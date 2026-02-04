import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "view_procurement")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const vendorId = searchParams.get("vendorId")
    const centerId = searchParams.get("centerId")

    const where: any = {}

    if (status) where.status = status
    if (vendorId) where.vendorId = vendorId
    if (centerId) where.centerId = centerId

    const purchases = await prisma.purchases.findMany({
      where,
      include: {
        vendors: {
          select: {
            name: true,
            vendorCode: true,
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

    return NextResponse.json(purchases)
  } catch (error) {
    console.error("Error fetching purchases:", error)
    return NextResponse.json({ message: "Failed to fetch purchases" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "manage_procurement")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const {
      vendorId,
      centerId,
      billNumber,
      billDate,
      billImageUrl,
      subtotal,
      cgst,
      sgst,
      igst,
      totalAmount,
      paymentMethod,
      paymentStatus,
      notes,
      lineItems,
    } = body

    // Basic validation
    if (!vendorId || !centerId || !totalAmount) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (!lineItems || lineItems.length === 0) {
      return NextResponse.json({ message: "At least one line item is required" }, { status: 400 })
    }

    // Generate purchase number
    const lastPurchase = await prisma.purchases.findFirst({
      orderBy: { createdAt: "desc" },
      select: { purchaseNumber: true },
    })

    let purchaseNumber = "PUR-0001"
    if (lastPurchase) {
      const lastNumber = parseInt(lastPurchase.purchaseNumber.split("-")[1])
      purchaseNumber = `PUR-${String(lastNumber + 1).padStart(4, "0")}`
    }

    // Create purchase with line items in a transaction
    const newPurchase = await prisma.$transaction(async (tx) => {
      // Create purchase header
      const purchase = await tx.purchases.create({
        data: {
          id: randomUUID(),
          purchaseNumber,
          vendorId,
          centerId,
          billNumber,
          billDate: billDate ? new Date(billDate) : undefined,
          billImageUrl,
          subtotal: subtotal ? parseFloat(subtotal) : 0,
          cgst: cgst ? parseFloat(cgst) : 0,
          sgst: sgst ? parseFloat(sgst) : 0,
          igst: igst ? parseFloat(igst) : 0,
          totalAmount: parseFloat(totalAmount),
          paymentMethod,
          paymentStatus: paymentStatus || "PENDING",
          notes,
          status: "DRAFT",
          createdById: user.id,
          updatedAt: new Date(),
        },
      })

      // Create line items
      for (const item of lineItems) {
        const qty = parseFloat(item.quantity || "0")
        const price = parseFloat(item.unitPrice || "0")
        const discount = parseFloat(item.discount || "0")
        const cgstRate = parseFloat(item.cgstRate || "0")
        const sgstRate = parseFloat(item.sgstRate || "0")
        const igstRate = parseFloat(item.igstRate || "0")

        const itemSubtotal = qty * price - discount
        const cgstAmount = (itemSubtotal * cgstRate) / 100
        const sgstAmount = (itemSubtotal * sgstRate) / 100
        const igstAmount = (itemSubtotal * igstRate) / 100
        const totalPrice = itemSubtotal + cgstAmount + sgstAmount + igstAmount

        await tx.purchase_items.create({
          data: {
            id: randomUUID(),
            purchaseId: purchase.id,
            inventoryItemId: item.inventoryItemId || undefined,
            itemName: item.itemName,
            description: item.description,
            hsnCode: item.hsnCode,
            quantity: qty,
            unitPrice: price,
            cgstRate,
            cgstAmount,
            sgstRate,
            sgstAmount,
            igstRate,
            igstAmount,
            discount,
            totalPrice,
            isManualEntry: !item.inventoryItemId,
            createdAt: new Date(),
          },
        })
      }

      // Return purchase with all relations
      return tx.purchases.findUnique({
        where: { id: purchase.id },
        include: {
          vendors: true,
          centers: true,
          purchase_items: {
            include: {
              inventory_items: true,
            },
          },
        },
      })
    })

    return NextResponse.json(newPurchase, { status: 201 })
  } catch (error: any) {
    console.error("Error creating purchase:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Purchase number already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: error.message || "Failed to create purchase" }, { status: 500 })
  }
}
