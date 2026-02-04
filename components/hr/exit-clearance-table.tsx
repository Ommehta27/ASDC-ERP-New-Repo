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
import { formatDate, formatCurrency } from "@/lib/utils"
import { CheckCircle, XCircle } from "lucide-react"

export async function ExitClearanceTable() {
  const exitRecords = await prisma.exit_clearance.findMany({
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
      resignationDate: "desc",
    },
  })

  const statusColors: Record<string, string> = {
    INITIATED: "bg-yellow-500",
    PENDING_CLEARANCE: "bg-orange-500",
    CLEARANCE_IN_PROGRESS: "bg-blue-500",
    COMPLETED: "bg-green-500",
    CANCELLED: "bg-gray-500",
  }

  const exitTypeColors: Record<string, string> = {
    RESIGNATION: "bg-blue-500",
    TERMINATION: "bg-red-500",
    RETIREMENT: "bg-purple-500",
    ABSCONDING: "bg-orange-500",
    END_OF_CONTRACT: "bg-indigo-500",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exit Clearance Records</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Employee Code</TableHead>
                <TableHead>Exit Type</TableHead>
                <TableHead>Resignation Date</TableHead>
                <TableHead>Last Working Day</TableHead>
                <TableHead>Clearance Status</TableHead>
                <TableHead>Final Settlement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rehire Eligible</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exitRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No exit clearance records found
                  </TableCell>
                </TableRow>
              ) : (
                exitRecords.map((exit) => (
                  <TableRow key={exit.id}>
                    <TableCell>
                      <p className="font-medium">
                        {exit.employees.users.firstName} {exit.employees.users.lastName}
                      </p>
                    </TableCell>
                    <TableCell>{exit.employees.employeeCode}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={exitTypeColors[exit.exitType]}>
                        {exit.exitType.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(exit.resignationDate)}</TableCell>
                    <TableCell className="font-medium">{formatDate(exit.lastWorkingDate)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1">
                          {exit.assetsReturned ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-600" />
                          )}
                          <span>Assets</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {exit.documentsReturned ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-600" />
                          )}
                          <span>Documents</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {exit.noDuesCleared ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-600" />
                          )}
                          <span>No Dues</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {exit.exitInterviewDone ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-600" />
                          )}
                          <span>Exit Interview</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {exit.finalSettlement ? formatCurrency(exit.finalSettlement) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[exit.status]}>
                        {exit.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {exit.rehireEligible ? (
                        <Badge variant="outline" className="bg-green-500">Yes</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-500">No</Badge>
                      )}
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
