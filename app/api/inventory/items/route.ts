import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { randomUUID } from "crypto"
import { addToUnallocated } from "@/lib/inventory"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "view_inventory")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const where: any = {}

    if (category) where.category = category
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { itemCode: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ]
    }

    const items = await prisma.inventory_items.findMany({
      where,
      include: {
        units_of_measure: {
          select: {
            name: true,
            abbreviation: true,
          },
        },
        _count: {
          select: {
            center_inventories: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching inventory items:", error)
    return NextResponse.json({ message: "Failed to fetch inventory items" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "create_inventory")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const {
      itemCode,
      name,
      description,
      category,
      brand,
      model,
      uomId,
      specifications,
      estimatedPrice,
      warrantyPeriodMonths,
      maintenanceIntervalDays,
      minQuantityPerCenter,
      defaultSupplier,
      initialStock,
      initialCost,
    } = body

    // Basic validation
    if (!itemCode || !name || !category) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Create inventory item
    const newItem = await prisma.inventory_items.create({
      data: {
        id: randomUUID(),
        itemCode,
        name,
        description,
        category,
        brand,
        model,
        uomId: uomId || undefined,
        specifications,
        estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
        warrantyPeriodMonths: warrantyPeriodMonths ? parseInt(warrantyPeriodMonths) : undefined,
        maintenanceIntervalDays: maintenanceIntervalDays ? parseInt(maintenanceIntervalDays) : undefined,
        minQuantityPerCenter: minQuantityPerCenter ? parseInt(minQuantityPerCenter) : 5,
        defaultSupplier,
        updatedAt: new Date(),
      },
      include: {
        units_of_measure: true,
      },
    })

    // If initial stock is provided, add to unallocated inventory
    if (initialStock && parseInt(initialStock) > 0) {
      await addToUnallocated({
        itemId: newItem.id,
        quantity: parseInt(initialStock),
        purchasePrice: initialCost ? parseFloat(initialCost) : undefined,
        condition: "NEW",
        notes: "Initial stock from item creation",
      })
    }

    return NextResponse.json(newItem, { status: 201 })
  } catch (error: any) {
    console.error("Error creating inventory item:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Item code already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: "Failed to create inventory item" }, { status: 500 })
  }
}
