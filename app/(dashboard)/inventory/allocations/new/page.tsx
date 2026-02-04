import { AllocationForm } from "@/components/inventory/allocation-form"
import { requireAuth } from "@/lib/session"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import prisma from "@/lib/prisma"

export const metadata = {
  title: "Allocate Inventory",
  description: "Allocate inventory items to centers.",
}

export default async function NewAllocationPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "allocate_inventory")) {
    return redirect("/auth/unauthorized")
  }

  const [items, centers] = await Promise.all([
    prisma.inventory_items.findMany({
      select: {
        id: true,
        itemCode: true,
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
        name: true,
        code: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Allocate Inventory to Center</h1>
        <p className="text-muted-foreground">
          Fill in the details to allocate inventory items to a center.
        </p>
      </div>
      <AllocationForm items={items} centers={centers} />
    </div>
  )
}
