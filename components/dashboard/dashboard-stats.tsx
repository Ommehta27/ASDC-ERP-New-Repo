import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, GraduationCap, Briefcase } from "lucide-react"

export async function DashboardStats() {
  const now = new Date()
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const last60Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const [
    totalStudents,
    studentsLast30Days,
    studentsLast60Days,
    activeInquiries,
    inquiriesLast30Days,
    activeEnrollments,
    enrollmentsLast30Days,
    totalPlacements,
    placementsLast30Days,
    activeCenters,
  ] = await Promise.all([
    // Total students (excluding inquiries)
    prisma.students.count({
      where: { status: { notIn: ["INQUIRY"] } },
    }),
    // Students added in last 30 days
    prisma.students.count({
      where: {
        status: { notIn: ["INQUIRY"] },
        createdAt: { gte: last30Days },
      },
    }),
    // Students added between 30-60 days ago
    prisma.students.count({
      where: {
        status: { notIn: ["INQUIRY"] },
        createdAt: { gte: last60Days, lt: last30Days },
      },
    }),
    // Active inquiries (not converted or lost)
    prisma.inquiries.count({
      where: { status: { notIn: ["CONVERTED", "LOST"] } },
    }),
    // Inquiries from last 30 days
    prisma.inquiries.count({
      where: { createdAt: { gte: last30Days } },
    }),
    // Active enrollments
    prisma.enrollments.count({
      where: { status: { in: ["ACTIVE", "APPROVED"] } },
    }),
    // Enrollments from last 30 days
    prisma.enrollments.count({
      where: { enrollmentDate: { gte: last30Days } },
    }),
    // Total successful placements
    prisma.placements.count({
      where: { status: "PLACED" },
    }),
    // Placements from last 30 days
    prisma.placements.count({
      where: {
        status: "PLACED",
        placedAt: { gte: last30Days },
      },
    }),
    // Active centers
    prisma.centers.count({
      where: { status: "ACTIVE" },
    }),
  ])

  // Calculate trends
  const studentTrend = studentsLast60Days > 0 
    ? (((studentsLast30Days - studentsLast60Days) / studentsLast60Days) * 100).toFixed(1)
    : studentsLast30Days > 0 ? "100" : "0"

  const stats = [
    {
      title: "Total Students",
      value: totalStudents,
      change: `+${studentsLast30Days}`,
      changeText: "this month",
      icon: Users,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      trend: Number(studentTrend) > 0 ? "up" : Number(studentTrend) < 0 ? "down" : "neutral",
      trendValue: `${studentTrend}%`,
    },
    {
      title: "Active Inquiries",
      value: activeInquiries,
      change: `+${inquiriesLast30Days}`,
      changeText: "new this month",
      icon: UserPlus,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      trend: inquiriesLast30Days > 0 ? "up" : "neutral",
      trendValue: inquiriesLast30Days.toString(),
    },
    {
      title: "Active Enrollments",
      value: activeEnrollments,
      change: `+${enrollmentsLast30Days}`,
      changeText: "this month",
      icon: GraduationCap,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      trend: enrollmentsLast30Days > 0 ? "up" : "neutral",
      trendValue: enrollmentsLast30Days.toString(),
    },
    {
      title: "Placements",
      value: totalPlacements,
      change: `+${placementsLast30Days}`,
      changeText: "this month",
      icon: Briefcase,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
      trend: placementsLast30Days > 0 ? "up" : "neutral",
      trendValue: placementsLast30Days.toString(),
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <Icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="font-medium text-foreground">{stat.change}</span> {stat.changeText}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
