import { Suspense } from "react"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { AttendanceCalendar } from "@/components/hr/attendance-calendar"
import { AttendanceStats } from "@/components/hr/attendance-stats"

export default async function AttendancePage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "view_attendance")) {
    return redirect("/auth/unauthorized")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
        <p className="text-muted-foreground">
          Track and manage employee attendance
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-32" />}>
        <AttendanceStats />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-96" />}>
        <AttendanceCalendar />
      </Suspense>
    </div>
  )
}
