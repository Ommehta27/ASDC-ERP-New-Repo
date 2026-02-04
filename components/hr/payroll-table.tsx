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
import { formatCurrency, formatDate } from "@/lib/utils"

export async function PayrollTable() {
  const payrollRecords = await prisma.payroll.findMany({
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
    orderBy: [
      { year: "desc" },
      { month: "desc" },
    ],
    take: 50,
  })

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-500",
    PENDING_APPROVAL: "bg-yellow-500",
    APPROVED: "bg-blue-500",
    PROCESSED: "bg-green-500",
    PAID: "bg-emerald-500",
    FAILED: "bg-red-500",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll Records</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payroll Number</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Month/Year</TableHead>
                <TableHead className="text-right">Basic Salary</TableHead>
                <TableHead className="text-right">Allowances</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No payroll records found
                  </TableCell>
                </TableRow>
              ) : (
                payrollRecords.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell className="font-medium">{payroll.payrollNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {payroll.employees.users.firstName} {payroll.employees.users.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{payroll.employees.employeeCode}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(payroll.year, payroll.month - 1).toLocaleDateString('en-IN', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(payroll.basicSalary)}</TableCell>
                    <TableCell className="text-right text-green-600">
                      +{formatCurrency(payroll.allowances)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      -{formatCurrency(payroll.deductions)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(payroll.netSalary)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[payroll.status]}>
                        {payroll.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payroll.paymentDate ? formatDate(payroll.paymentDate) : "-"}
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
