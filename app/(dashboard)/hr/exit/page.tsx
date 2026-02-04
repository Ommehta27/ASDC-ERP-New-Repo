import { Suspense } from "react"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { ExitClearanceTable } from "@/components/hr/exit-clearance-table"

export default async function ExitPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "view_exit")) {
    return redirect("/auth/unauthorized")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exit Management</h1>
        <p className="text-muted-foreground">
          Manage employee separations and exit clearance
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-96" />}>
        <ExitClearanceTable />
      </Suspense>
    </div>
  )
}
