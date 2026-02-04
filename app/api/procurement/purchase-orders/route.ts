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

    const pos = await prisma.purchase_orders.findMany({
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
        po_items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(pos, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching POs:", error)
    return NextResponse.json({ message: "Failed to fetch POs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!user || !hasPermission(user.role, "create_purchase_orders")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const {
      vendorId,
      centerId,
      priority,
      expectedDeliveryDate,
      paymentTerms,
      deliveryAddress,
      notes,
      termsConditions,
      subtotal,
      taxAmount,
      totalAmount,
      lineItems,
    } = body

    // Validation
    if (!vendorId || !centerId || !totalAmount) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (!lineItems || lineItems.length === 0) {
      return NextResponse.json({ message: "At least one line item is required" }, { status: 400 })
    }

    // Generate PO number
    const lastPO = await prisma.purchase_orders.findFirst({
      orderBy: { createdAt: "desc" },
      select: { poNumber: true },
    })

    let poNumber = "PO-0001"
    if (lastPO) {
      const lastNumber = parseInt(lastPO.poNumber.split("-")[1])
      poNumber = `PO-${String(lastNumber + 1).padStart(4, "0")}`
    }

    // Create PO with line items
    const newPO = await prisma.$transaction(async (tx) => {
      // Create PO header
      const po = await tx.purchase_orders.create({
        data: {
          id: randomUUID(),
          poNumber,
          vendorId,
          centerId,
          priority: priority || "MEDIUM",
          orderDate: new Date(),
          expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined,
          subtotal: subtotal ? parseFloat(subtotal) : 0,
          taxAmount: taxAmount ? parseFloat(taxAmount) : 0,
          totalAmount: parseFloat(totalAmount),
          paymentTerms,
          deliveryAddress,
          notes,
          termsConditions,
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
        const taxRate = parseFloat(item.taxRate || "0")

        const itemSubtotal = qty * price - discount
        const itemTax = (itemSubtotal * taxRate) / 100
        const totalPrice = itemSubtotal + itemTax

        await tx.po_items.create({
          data: {
            id: randomUUID(),
            purchaseOrderId: po.id,
            inventoryItemId: item.inventoryItemId || undefined,
            itemName: item.itemName,
            description: item.description,
            specifications: item.specifications,
            quantity: Math.floor(qty), // PO items use Int
            unitPrice: price,
            taxRate,
            discount,
            totalPrice,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      }

      // Return PO with all relations
      return tx.purchase_orders.findUnique({
        where: { id: po.id },
        include: {
          vendors: true,
          centers: true,
          po_items: {
            include: {
              inventory_items: true,
            },
          },
        },
      })
    })

    return NextResponse.json(newPO, { status: 201 })
  } catch (error: any) {
    console.error("Error creating PO:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ message: "PO number already exists" }, { status: 409 })
    }
    return NextResponse.json(
      { message: error.message || "Failed to create PO" },
      { status: 500 }
    )
  }
}
