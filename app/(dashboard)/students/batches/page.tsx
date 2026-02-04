import { Suspense } from "react"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Users, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
import { formatDate } from "@/lib/utils"

export default async function BatchesPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "view_batches")) {
    return redirect("/auth/unauthorized")
  }

  // Fetch batch statistics
  const [totalBatches, upcomingBatches, ongoingBatches, completedBatches] = await Promise.all([
    prisma.batches.count({ where: { isActive: true } }),
    prisma.batches.count({ where: { status: "UPCOMING", isActive: true } }),
    prisma.batches.count({ where: { status: "ONGOING", isActive: true } }),
    prisma.batches.count({ where: { status: "COMPLETED", isActive: true } }),
  ])

  // Fetch batches with related data
  const batches = await prisma.batches.findMany({
    where: { isActive: true },
    include: {
      courses: {
        select: {
          name: true,
          code: true,
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
      _count: {
        select: {
          batch_students: true,
        },
      },
    },
    orderBy: {
      startDate: "desc",
    },
  })

  const statusColors: Record<string, string> = {
    UPCOMING: "bg-blue-500",
    ONGOING: "bg-green-500",
    COMPLETED: "bg-gray-500",
    CANCELLED: "bg-red-500",
    ON_HOLD: "bg-yellow-500",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Batches</h1>
          <p className="text-muted-foreground">
            Manage batches, track progress, and analyze performance
          </p>
        </div>
        {hasPermission(user.role, "create_batches") && (
          <Link href="/students/batches/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create Batch
            </Button>
          </Link>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBatches}</div>
            <p className="text-xs text-muted-foreground">
              Active batches in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBatches}</div>
            <p className="text-xs text-muted-foreground">
              Yet to start
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ongoing</CardTitle>
            <AlertCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ongoingBatches}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedBatches}</div>
            <p className="text-xs text-muted-foreground">
              Successfully finished
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Batches</CardTitle>
          <CardDescription>
            View and manage all student batches across centers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch Code</TableHead>
                  <TableHead>Batch Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Center</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      No batches found. Create your first batch to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-mono font-medium">
                        {batch.batchCode}
                      </TableCell>
                      <TableCell className="font-medium">
                        {batch.batchName}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{batch.courses.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {batch.courses.code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{batch.centers.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {batch.centers.code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {batch.employees ? (
                          <div className="text-sm">
                            {batch.employees.users.firstName} {batch.employees.users.lastName}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(batch.startDate)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{batch._count.batch_students}</span>
                          <span className="text-muted-foreground">/ {batch.capacity}</span>
                          <div className="ml-2 h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{
                                width: `${Math.min((batch._count.batch_students / batch.capacity) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[batch.status]}>
                          {batch.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/students/batches/${batch.id}`}>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
