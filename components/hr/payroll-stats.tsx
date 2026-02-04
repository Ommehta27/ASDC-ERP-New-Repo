import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, TrendingUp, CheckCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export async function PayrollStats() {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  const [totalPayroll, processedPayroll, pendingPayroll, totalEmployees] = await Promise.all([
    prisma.payroll.aggregate({
      where: {
        month: currentMonth,
        year: currentYear,
      },
      _sum: {
        netSalary: true,
      },
    }),
    prisma.payroll.count({
      where: {
        month: currentMonth,
        year: currentYear,
        status: "PAID",
      },
    }),
    prisma.payroll.count({
      where: {
        month: currentMonth,
        year: currentYear,
        status: {
          in: ["DRAFT", "PENDING_APPROVAL", "APPROVED"],
        },
      },
    }),
    prisma.employees.count({
      where: { employmentStatus: "ACTIVE" },
    }),
  ])

  const stats = [
    {
      title: "Total Payroll",
      value: formatCurrency(totalPayroll._sum.netSalary || 0),
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Processed",
      value: processedPayroll,
      icon: CheckCircle,
      color: "text-blue-600",
    },
    {
      title: "Pending",
      value: pendingPayroll,
      icon: TrendingUp,
      color: "text-yellow-600",
    },
    {
      title: "Total Employees",
      value: totalEmployees,
      icon: Users,
      color: "text-purple-600",
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
            <p className="text-xs text-muted-foreground mt-1">
              {currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
