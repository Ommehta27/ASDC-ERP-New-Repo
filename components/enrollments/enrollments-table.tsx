"use client"

import { useState, useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/utils"
import { Eye, Search } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

interface Enrollment {
  id: string
  enrollmentNumber: string
  enrollmentDate: Date
  status: string
  totalFees: number
  paidAmount: number
  paymentStatus: string
  students: {
    users: {
      email: string
      firstName: string
      lastName: string
    }
  }
  courses: {
    name: string
    code: string
  }
  centers: {
    name: string
    code: string
  }
  batches: {
    name: string
    code: string
  } | null
}

export function EnrollmentsTable() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchEnrollments()
  }, [search])

  const fetchEnrollments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      
      const response = await fetch(`/api/enrollments?${params}`)
      if (response.ok) {
        const data = await response.json()
        setEnrollments(data)
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500",
    ACTIVE: "bg-green-500",
    COMPLETED: "bg-blue-500",
    DROPPED: "bg-red-500",
    SUSPENDED: "bg-gray-500",
  }

  const paymentStatusColors: Record<string, string> = {
    PENDING: "bg-yellow-500",
    PARTIAL: "bg-orange-500",
    PAID: "bg-green-500",
    OVERDUE: "bg-red-500",
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search enrollments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Enrollment #</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Center</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Fees</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  No enrollments found
                </TableCell>
              </TableRow>
            ) : (
              enrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell className="font-medium">{enrollment.enrollmentNumber}</TableCell>
                  <TableCell>
                    {enrollment.students.users.firstName} {enrollment.students.users.lastName}
                  </TableCell>
                  <TableCell>{enrollment.courses.name}</TableCell>
                  <TableCell>{enrollment.centers.name}</TableCell>
                  <TableCell>{enrollment.batches?.name || "-"}</TableCell>
                  <TableCell>{formatDate(enrollment.enrollmentDate)}</TableCell>
                  <TableCell>
                    ₹{enrollment.paidAmount.toLocaleString()} / ₹
                    {enrollment.totalFees.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColors[enrollment.status] || "bg-gray-500"}
                    >
                      {enrollment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={paymentStatusColors[enrollment.paymentStatus] || "bg-gray-500"}
                    >
                      {enrollment.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/enrollments/${enrollment.id}`}>
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
    </div>
  )
}
