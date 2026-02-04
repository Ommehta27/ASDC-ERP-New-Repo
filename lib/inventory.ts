import prisma from "@/lib/prisma"
import { randomUUID } from "crypto"

// Central Warehouse Code - used for unallocated inventory
export const CENTRAL_WAREHOUSE_CODE = "CENTRAL-WH"

/**
 * Get the Central Warehouse (Unallocated Inventory Pool)
 */
export async function getCentralWarehouse() {
  const warehouse = await prisma.centers.findUnique({
    where: { code: CENTRAL_WAREHOUSE_CODE },
  })
  
  if (!warehouse) {
    throw new Error("Central Warehouse not found. Please run database seed.")
  }
  
  return warehouse
}

/**
 * Get unallocated stock for an item
 */
export async function getUnallocatedStock(itemId: string) {
  const warehouse = await getCentralWarehouse()
  
  const stock = await prisma.center_inventories.findFirst({
    where: {
      itemId,
      centerId: warehouse.id,
    },
  })
  
  return stock?.quantity || 0
}

/**
 * Check if sufficient unallocated stock is available
 */
export async function hasUnallocatedStock(itemId: string, requiredQuantity: number) {
  const availableStock = await getUnallocatedStock(itemId)
  return availableStock >= requiredQuantity
}

/**
 * Add items to unallocated inventory (e.g., from purchase, returns, restocking)
 */
export async function addToUnallocated(params: {
  itemId: string
  quantity: number
  purchasePrice?: number
  condition?: "NEW" | "GOOD" | "FAIR" | "POOR"
  location?: string
  purchaseDate?: Date
  serialNumbers?: string[]
  notes?: string
  supplier?: string
  invoiceNumber?: string
}) {
  const warehouse = await getCentralWarehouse()
  
  // Check if item already exists in unallocated inventory
  const existing = await prisma.center_inventories.findFirst({
    where: {
      itemId: params.itemId,
      centerId: warehouse.id,
    },
  })
  
  if (existing) {
    // Update existing record
    return await prisma.center_inventories.update({
      where: { id: existing.id },
      data: {
        quantity: existing.quantity + params.quantity,
        purchasePrice: params.purchasePrice || existing.purchasePrice,
        condition: params.condition || existing.condition,
        supplier: params.supplier || existing.supplier,
        invoiceNumber: params.invoiceNumber || existing.invoiceNumber,
        notes: params.notes,
        updatedAt: new Date(),
      },
    })
  } else {
    // Create new record
    return await prisma.center_inventories.create({
      data: {
        id: randomUUID(),
        itemId: params.itemId,
        centerId: warehouse.id,
        quantity: params.quantity,
        purchasePrice: params.purchasePrice,
        condition: params.condition || "NEW",
        location: params.location || "Central Warehouse",
        purchaseDate: params.purchaseDate,
        serialNumbers: params.serialNumbers || [],
        notes: params.notes,
        supplier: params.supplier,
        invoiceNumber: params.invoiceNumber,
        updatedAt: new Date(),
      },
    })
  }
}

/**
 * Allocate items from unallocated to a specific center
 */
export async function allocateFromUnallocated(params: {
  itemId: string
  centerId: string
  quantity: number
  unitCost?: number
  condition?: "NEW" | "GOOD" | "FAIR" | "POOR"
  location?: string
  serialNumbers?: string[]
  notes?: string
}) {
  const warehouse = await getCentralWarehouse()
  
  // Check if sufficient stock is available
  const hasStock = await hasUnallocatedStock(params.itemId, params.quantity)
  if (!hasStock) {
    const available = await getUnallocatedStock(params.itemId)
    throw new Error(
      `Insufficient unallocated stock. Required: ${params.quantity}, Available: ${available}`
    )
  }
  
  // Deduct from unallocated
  const unallocatedStock = await prisma.center_inventories.findFirst({
    where: {
      itemId: params.itemId,
      centerId: warehouse.id,
    },
  })
  
  if (!unallocatedStock) {
    throw new Error("Unallocated stock record not found")
  }
  
  await prisma.center_inventories.update({
    where: { id: unallocatedStock.id },
    data: {
      quantity: unallocatedStock.quantity - params.quantity,
      updatedAt: new Date(),
    },
  })
  
  // Add to target center
  const existingAtCenter = await prisma.center_inventories.findFirst({
    where: {
      itemId: params.itemId,
      centerId: params.centerId,
    },
  })
  
  if (existingAtCenter) {
    // Update existing
    return await prisma.center_inventories.update({
      where: { id: existingAtCenter.id },
      data: {
        quantity: existingAtCenter.quantity + params.quantity,
        purchasePrice: params.unitCost || existingAtCenter.purchasePrice,
        condition: params.condition || existingAtCenter.condition,
        location: params.location || existingAtCenter.location,
        notes: params.notes,
        updatedAt: new Date(),
      },
    })
  } else {
    // Create new
    return await prisma.center_inventories.create({
      data: {
        id: randomUUID(),
        itemId: params.itemId,
        centerId: params.centerId,
        quantity: params.quantity,
        purchasePrice: params.unitCost || unallocatedStock.purchasePrice,
        condition: params.condition || "NEW",
        location: params.location,
        serialNumbers: params.serialNumbers || [],
        notes: params.notes,
        updatedAt: new Date(),
      },
    })
  }
}

/**
 * Return items from a center to unallocated (e.g., center closure, excess stock)
 */
export async function returnToUnallocated(params: {
  itemId: string
  fromCenterId: string
  quantity: number
  reason?: string
}) {
  const warehouse = await getCentralWarehouse()
  
  // Get stock at the source center
  const centerStock = await prisma.center_inventories.findFirst({
    where: {
      itemId: params.itemId,
      centerId: params.fromCenterId,
    },
  })
  
  if (!centerStock) {
    throw new Error("Item not found at source center")
  }
  
  if (centerStock.quantity < params.quantity) {
    throw new Error(
      `Insufficient quantity at center. Available: ${centerStock.quantity}, Requested: ${params.quantity}`
    )
  }
  
  // Deduct from center
  await prisma.center_inventories.update({
    where: { id: centerStock.id },
    data: {
      quantity: centerStock.quantity - params.quantity,
      updatedAt: new Date(),
    },
  })
  
  // Add back to unallocated
  return await addToUnallocated({
    itemId: params.itemId,
    quantity: params.quantity,
    purchasePrice: centerStock.purchasePrice || undefined,
    condition: centerStock.condition,
    notes: params.reason,
  })
}

/**
 * Get all unallocated inventory items
 */
export async function getUnallocatedInventory() {
  const warehouse = await getCentralWarehouse()
  
  return await prisma.center_inventories.findMany({
    where: {
      centerId: warehouse.id,
      quantity: {
        gt: 0,
      },
    },
    include: {
      inventory_items: {
        select: {
          id: true,
          itemCode: true,
          name: true,
          category: true,
          brand: true,
          model: true,
          units_of_measure: {
            select: {
              name: true,
              abbreviation: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  })
}
