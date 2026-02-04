import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { ManualPurchaseForm } from "@/components/purchases/manual-purchase-form"

export default async function ManualPurchasePage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "manage_procurement")) {
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
      },
      orderBy: {
        name: "asc",
      },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manual Purchase Entry</h1>
        <p className="text-muted-foreground">
          Record purchase without bill scanning - Direct data entry
        </p>
      </div>

      <ManualPurchaseForm 
        vendors={vendors} 
        centers={centers} 
        inventoryItems={inventoryItems}
      />
    </div>
  )
}
