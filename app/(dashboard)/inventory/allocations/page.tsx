import { Suspense } from "react"
import { requireAuth } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { AllocationsTable } from "@/components/inventory/allocations-table"

export default async function AllocationsPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "view_inventory")) {
    return redirect("/auth/unauthorized")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Allocations</h1>
          <p className="text-muted-foreground">
            View and manage inventory allocated to centers
          </p>
        </div>
        {hasPermission(user.role, "allocate_inventory") && (
          <Link href="/inventory/allocations/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Allocate to Center
            </Button>
          </Link>
        )}
      </div>

      <Suspense fallback={<Skeleton className="h-96" />}>
        <AllocationsTable />
      </Suspense>
    </div>
  )
}
