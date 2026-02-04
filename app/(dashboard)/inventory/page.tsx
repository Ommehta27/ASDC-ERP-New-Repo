import { Suspense } from "react"
import { requireAuth } from "@/lib/session"
import { InventoryTable } from "@/components/inventory/inventory-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"

export default async function InventoryPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "view_inventory")) {
    return redirect("/auth/unauthorized")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Items</h1>
          <p className="text-muted-foreground">
            Manage inventory items and track allocations
          </p>
        </div>
        <div className="flex gap-2">
          {hasPermission(user.role, "create_inventory") && (
            <>
              <Link href="/inventory/allocations/new">
                <Button variant="outline" className="w-full sm:w-auto">
                  Allocate to Center
                </Button>
              </Link>
              <Link href="/inventory/new">
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-96" />}>
        <InventoryTable />
      </Suspense>
    </div>
  )
}
