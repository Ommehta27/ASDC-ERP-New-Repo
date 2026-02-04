import { requireAuth } from "@/lib/session"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentInquiries } from "@/components/dashboard/recent-inquiries"
import { EnrollmentChart } from "@/components/dashboard/enrollment-chart"
import { PlacementChart } from "@/components/dashboard/placement-chart"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default async function DashboardPage() {
  const user = await requireAuth()

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening"

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting}, {user.firstName}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Here's your organization overview
        </p>
      </div>

      {/* Key Metrics */}
      <Suspense fallback={<Skeleton className="h-32" />}>
        <DashboardStats />
      </Suspense>

      {/* Analytics Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-80" />}>
          <EnrollmentChart />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-80" />}>
          <PlacementChart />
        </Suspense>
      </div>

      {/* Recent Activity */}
      <Suspense fallback={<Skeleton className="h-64" />}>
        <RecentInquiries />
      </Suspense>
    </div>
  )
}
