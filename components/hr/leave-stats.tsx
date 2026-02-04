import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react"

export async function LeaveStats() {
  const currentYear = new Date().getFullYear()

  const [totalApplications, pendingLeaves, approvedLeaves, rejectedLeaves] = await Promise.all([
    prisma.leave_applications.count({
      where: {
        appliedDate: {
          gte: new Date(currentYear, 0, 1),
        },
      },
    }),
    prisma.leave_applications.count({
      where: {
        status: "PENDING",
      },
    }),
    prisma.leave_applications.count({
      where: {
        status: "APPROVED",
        appliedDate: {
          gte: new Date(currentYear, 0, 1),
        },
      },
    }),
    prisma.leave_applications.count({
      where: {
        status: "REJECTED",
        appliedDate: {
          gte: new Date(currentYear, 0, 1),
        },
      },
    }),
  ])

  const stats = [
    {
      title: "Total Applications",
      value: totalApplications,
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Pending Approval",
      value: pendingLeaves,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Approved",
      value: approvedLeaves,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Rejected",
      value: rejectedLeaves,
      icon: XCircle,
      color: "text-red-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
