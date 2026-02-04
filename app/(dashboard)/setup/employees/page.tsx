import { requireAuth } from "@/lib/session"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

export const metadata = {
  title: "Employees",
  description: "Manage employee records and information.",
}

export default async function EmployeesPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "manage_setup")) {
    return redirect("/auth/unauthorized")
  }

  const employees = await prisma.employees.findMany({
    include: {
      users: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
        },
      },
      centers: {
        select: {
          name: true,
          code: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-500",
    ON_LEAVE: "bg-yellow-500",
    RESIGNED: "bg-red-500",
    TERMINATED: "bg-red-700",
    RETIRED: "bg-gray-500",
  }

  const typeColors: Record<string, string> = {
    FULL_TIME: "bg-blue-500",
    PART_TIME: "bg-cyan-500",
    CONTRACT: "bg-purple-500",
    INTERN: "bg-orange-500",
    CONSULTANT: "bg-pink-500",
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage employee records, hierarchy, and information
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Center</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Joining Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.employeeCode}</TableCell>
                  <TableCell>
                    {employee.users.firstName} {employee.users.lastName}
                  </TableCell>
                  <TableCell>{employee.users.email}</TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.centers?.name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={typeColors[employee.employmentType]}>
                      {employee.employmentType.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(employee.dateOfJoining)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[employee.employmentStatus]}>
                      {employee.employmentStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
