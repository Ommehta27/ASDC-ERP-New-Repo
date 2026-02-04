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
import { formatDate } from "@/lib/utils"

export async function LeaveApplicationsTable() {
  const leaveApplications = await prisma.leave_applications.findMany({
    include: {
      employees: {
        include: {
          users: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      leave_types: {
        select: {
          name: true,
          code: true,
        },
      },
    },
    orderBy: {
      appliedDate: "desc",
    },
    take: 50,
  })

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500",
    APPROVED: "bg-green-500",
    REJECTED: "bg-red-500",
    CANCELLED: "bg-gray-500",
    WITHDRAWN: "bg-orange-500",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application Code</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No leave applications found
                  </TableCell>
                </TableRow>
              ) : (
                leaveApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">{application.applicationCode}</TableCell>
                    <TableCell>
                      {application.employees.users.firstName} {application.employees.users.lastName}
                      <p className="text-xs text-muted-foreground">{application.employees.employeeCode}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{application.leave_types.name}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(application.startDate)}</TableCell>
                    <TableCell>{formatDate(application.endDate)}</TableCell>
                    <TableCell className="font-medium">{application.days}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[application.status]}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(application.appliedDate)}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {application.reason}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
