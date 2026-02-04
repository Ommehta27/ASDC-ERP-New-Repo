import { Suspense } from "react"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { PerformanceReviewsTable } from "@/components/hr/performance-reviews-table"

export default async function PerformancePage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "view_performance")) {
    return redirect("/auth/unauthorized")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Management</h1>
          <p className="text-muted-foreground">
            Track and manage employee performance reviews
          </p>
        </div>
        {hasPermission(user.role, "create_performance_review") && (
          <Link href="/hr/performance/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Review
            </Button>
          </Link>
        )}
      </div>

      <Suspense fallback={<Skeleton className="h-96" />}>
        <PerformanceReviewsTable />
      </Suspense>
    </div>
  )
}
