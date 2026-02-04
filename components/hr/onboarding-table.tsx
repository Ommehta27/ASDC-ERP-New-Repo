import prisma from "@/lib/prisma"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export async function OnboardingTable() {
  // Get employees who joined in the last 90 days
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const recentEmployees = await prisma.employees.findMany({
    where: {
      dateOfJoining: {
        gte: ninetyDaysAgo,
      },
      employmentStatus: "ACTIVE",
    },
    include: {
      users: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      employee_onboarding: {
        include: {
          onboarding_tasks: true,
        },
      },
    },
    orderBy: {
      dateOfJoining: "desc",
    },
  })

  const statusColors: Record<string, string> = {
    PENDING: "bg-gray-500",
    IN_PROGRESS: "bg-yellow-500",
    COMPLETED: "bg-green-500",
    SKIPPED: "bg-orange-500",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Onboarding (Last 90 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Employee Code</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Total Tasks</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No recent onboarding records found
                  </TableCell>
                </TableRow>
              ) : (
                recentEmployees.map((employee) => {
                  const totalTasks = employee.employee_onboarding.length
                  const completedTasks = employee.employee_onboarding.filter(
                    (task) => task.status === "COMPLETED"
                  ).length
                  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

                  return (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <p className="font-medium">
                          {employee.users.firstName} {employee.users.lastName}
                        </p>
                      </TableCell>
                      <TableCell>{employee.employeeCode}</TableCell>
                      <TableCell>{employee.designation}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell className="text-center">{totalTasks}</TableCell>
                      <TableCell className="text-center font-medium text-green-600">
                        {completedTasks}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="h-2 w-24" />
                          <span className="text-sm text-muted-foreground">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
