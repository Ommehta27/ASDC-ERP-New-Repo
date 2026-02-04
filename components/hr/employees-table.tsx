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
import { Button } from "@/components/ui/button"
import { Eye, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export async function EmployeesTable() {
  const employees = await prisma.employees.findMany({
    include: {
      users: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      centers: {
        select: {
          name: true,
          code: true,
        },
      },
      employees: {
        select: {
          users: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-500",
    INACTIVE: "bg-gray-500",
    ON_LEAVE: "bg-yellow-500",
    TERMINATED: "bg-red-500",
    RESIGNED: "bg-orange-500",
  }

  const employmentTypeColors: Record<string, string> = {
    FULL_TIME: "bg-blue-500",
    PART_TIME: "bg-purple-500",
    CONTRACT: "bg-indigo-500",
    INTERN: "bg-pink-500",
    CONSULTANT: "bg-cyan-500",
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Center</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reporting Manager</TableHead>
            <TableHead>Joining Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-muted-foreground">
                No employees found
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.employeeCode}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">
                      {employee.users.firstName} {employee.users.lastName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Mail className="h-3 w-3" />
                      {employee.users.email}
                    </div>
                    {employee.users.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {employee.users.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{employee.designation}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>
                  {employee.centers ? (
                    <div>
                      {employee.centers.name}
                      <p className="text-xs text-muted-foreground">{employee.centers.code}</p>
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={employmentTypeColors[employee.employmentType]}>
                    {employee.employmentType.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusColors[employee.employmentStatus]}>
                    {employee.employmentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  {employee.employees ? (
                    <span className="text-sm">
                      {employee.employees.users.firstName} {employee.employees.users.lastName}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>{formatDate(employee.dateOfJoining)}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/hr/employees/${employee.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
