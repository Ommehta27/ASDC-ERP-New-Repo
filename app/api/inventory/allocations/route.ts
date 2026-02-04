import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { randomUUID } from "crypto"
import { 
  allocateFromUnallocated, 
  getUnallocatedStock,
  CENTRAL_WAREHOUSE_CODE 
} from "@/lib/inventory"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "view_inventory")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const centerInventories = await prisma.center_inventories.findMany({
      include: {
        inventory_items: {
          select: {
            itemCode: true,
            name: true,
            category: true,
          },
        },
        centers: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(centerInventories)
  } catch (error) {
    console.error("Error fetching allocations:", error)
    return NextResponse.json({ message: "Failed to fetch allocations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "allocate_inventory")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const {
      itemId,
      centerId,
      quantity,
      unitCost,
      condition,
      location,
      purchaseDate,
      serialNumbers,
      notes,
    } = body

    // Basic validation
    if (!itemId || !centerId || !quantity) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const requestedQty = parseInt(quantity)

    // Check unallocated stock availability
    const unallocatedStock = await getUnallocatedStock(itemId)
    
    if (unallocatedStock < requestedQty) {
      // Fetch item details for better error message
      const item = await prisma.inventory_items.findUnique({
        where: { id: itemId },
        select: { name: true, itemCode: true },
      })
      
      return NextResponse.json({ 
        message: `Insufficient unallocated stock for ${item?.name || 'item'}. Available: ${unallocatedStock}, Requested: ${requestedQty}. Please purchase or restock first.`,
        availableStock: unallocatedStock,
        requestedStock: requestedQty,
      }, { status: 400 })
    }

    // Allocate from unallocated inventory
    const allocation = await allocateFromUnallocated({
      itemId,
      centerId,
      quantity: requestedQty,
      unitCost: unitCost ? parseFloat(unitCost) : undefined,
      condition: condition || "NEW",
      location,
      serialNumbers: serialNumbers ? serialNumbers.split(",").map((s: string) => s.trim()) : undefined,
      notes,
    })

    // Fetch complete allocation with relations
    const completeAllocation = await prisma.center_inventories.findUnique({
      where: { id: allocation.id },
      include: {
        inventory_items: true,
        centers: true,
      },
    })

    return NextResponse.json(completeAllocation, { status: 201 })
  } catch (error: any) {
    console.error("Error creating allocation:", error)
    
    // Send user-friendly error messages
    if (error.message.includes("Insufficient unallocated stock")) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ 
      message: error.message || "Failed to create allocation" 
    }, { status: 500 })
  }
}
