import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle, XCircle, Clock } from "lucide-react"

export async function AttendanceStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalEmployees, presentToday, absentToday, onLeaveToday] = await Promise.all([
    prisma.employees.count({
      where: { employmentStatus: "ACTIVE" },
    }),
    prisma.attendance.count({
      where: {
        date: today,
        status: "PRESENT",
      },
    }),
    prisma.attendance.count({
      where: {
        date: today,
        status: "ABSENT",
      },
    }),
    prisma.attendance.count({
      where: {
        date: today,
        status: "ON_LEAVE",
      },
    }),
  ])

  const stats = [
    {
      title: "Total Employees",
      value: totalEmployees,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Present Today",
      value: presentToday,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Absent Today",
      value: absentToday,
      icon: XCircle,
      color: "text-red-600",
    },
    {
      title: "On Leave",
      value: onLeaveToday,
      icon: Clock,
      color: "text-yellow-600",
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
