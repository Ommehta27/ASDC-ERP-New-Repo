import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { POForm } from "@/components/procurement/po-form"

export default async function NewPOPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "create_purchase_orders")) {
    return redirect("/auth/unauthorized")
  }

  // Fetch vendors, centers, and inventory items
  const [vendors, centers, inventoryItems] = await Promise.all([
    prisma.vendors.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        vendorCode: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.centers.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.inventory_items.findMany({
      select: {
        id: true,
        itemCode: true,
        name: true,
        estimatedPrice: true,
        specifications: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Purchase Order</h1>
        <p className="text-muted-foreground">
          Generate professional purchase orders for vendors
        </p>
      </div>

      <POForm 
        vendors={vendors} 
        centers={centers} 
        inventoryItems={inventoryItems}
      />
    </div>
  )
}
