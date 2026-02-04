import { InventoryForm } from "@/components/inventory/inventory-form"
import { requireAuth } from "@/lib/session"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import prisma from "@/lib/prisma"

export const metadata = {
  title: "Add New Inventory Item",
  description: "Create a new inventory item in the system.",
}

export default async function AddInventoryItemPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "create_inventory")) {
    return redirect("/auth/unauthorized")
  }

  const uoms = await prisma.units_of_measure.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      abbreviation: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Inventory Item</h1>
        <p className="text-muted-foreground">
          Fill in the details to create a new inventory item.
        </p>
      </div>
      <InventoryForm uoms={uoms} />
    </div>
  )
}
