import { Suspense } from "react"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { LeaveApplicationsTable } from "@/components/hr/leave-applications-table"
import { LeaveStats } from "@/components/hr/leave-stats"

export default async function LeavesPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "view_leave")) {
    return redirect("/auth/unauthorized")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground">
            Manage leave applications and balances
          </p>
        </div>
        {hasPermission(user.role, "apply_leave") && (
          <Link href="/hr/leaves/apply">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Apply Leave
            </Button>
          </Link>
        )}
      </div>

      <Suspense fallback={<Skeleton className="h-32" />}>
        <LeaveStats />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-96" />}>
        <LeaveApplicationsTable />
      </Suspense>
    </div>
  )
}
