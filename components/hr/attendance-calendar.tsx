import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export async function AttendanceCalendar() {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
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
    },
    orderBy: {
      date: "desc",
    },
    take: 50,
  })

  const statusColors: Record<string, string> = {
    PRESENT: "bg-green-500",
    ABSENT: "bg-red-500",
    HALF_DAY: "bg-yellow-500",
    LATE: "bg-orange-500",
    ON_LEAVE: "bg-blue-500",
    WEEKEND: "bg-gray-500",
    HOLIDAY: "bg-purple-500",
    WORK_FROM_HOME: "bg-indigo-500",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Records - {today.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Work Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No attendance records found for this month
                  </TableCell>
                </TableRow>
              ) : (
                attendanceRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
                    <TableCell>
                      {record.employees.users.firstName} {record.employees.users.lastName}
                      <p className="text-xs text-muted-foreground">{record.employees.employeeCode}</p>
                    </TableCell>
                    <TableCell>
                      {record.checkIn ? record.checkIn.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : "-"}
                    </TableCell>
                    <TableCell>
                      {record.checkOut ? record.checkOut.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : "-"}
                    </TableCell>
                    <TableCell>
                      {record.workHours ? `${record.workHours.toFixed(2)} hrs` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[record.status]}>
                        {record.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {record.remarks || "-"}
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
