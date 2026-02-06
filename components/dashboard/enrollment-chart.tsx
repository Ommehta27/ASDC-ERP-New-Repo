import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export async function EnrollmentChart() {
  // Get enrollment statistics by status
  const enrollmentStats = await prisma.enrollments.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
  })

  // Get monthly enrollment trend (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const recentEnrollments = await prisma.enrollments.findMany({
    where: {
      enrollmentDate: {
        gte: sixMonthsAgo,
      },
    },
    select: {
      enrollmentDate: true,
      status: true,
    },
  })

  // Calculate totals
  const totalEnrollments = enrollmentStats.reduce((sum, stat) => sum + stat._count.id, 0)
  const activeEnrollments = enrollmentStats.find(s => s.status === "ACTIVE")?._count.id || 0
  const completedEnrollments = enrollmentStats.find(s => s.status === "COMPLETED")?._count.id || 0

  const statusColors: Record<string, string> = {
    PENDING: "#6B7280",
    APPROVED: "#3B82F6",
    ACTIVE: "#10B981",
    COMPLETED: "#8B5CF6",
    DROPPED: "#EF4444",
    SUSPENDED: "#F59E0B",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment Overview</CardTitle>
        <CardDescription>Student enrollment statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-2xl font-bold">{totalEnrollments}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-green-600">{activeEnrollments}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-purple-600">{completedEnrollments}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <p className="text-sm font-medium">By Status</p>
            {enrollmentStats.map((stat) => (
              <div key={stat.status} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize">{stat.status.toLowerCase().replace(/_/g, " ")}</span>
                  <span className="font-medium">{stat._count.id}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(stat._count.id / totalEnrollments) * 100}%`,
                      backgroundColor: statusColors[stat.status] || "#6B7280",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
