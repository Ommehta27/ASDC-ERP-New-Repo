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

interface Placement {
  id: string
  placementNumber: string
  companyName: string
  companyType: string
  jobTitle: string
  location: string
  salary: number | null
  status: string
  joiningDate: Date | null
  students: {
    users: {
      email: string
      firstName: string
      lastName: string
    }
  }
  centers: {
    name: string
    code: string
  }
}

export function PlacementsTable() {
  const [placements, setPlacements] = useState<Placement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchPlacements()
  }, [search])

  const fetchPlacements = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      
      const response = await fetch(`/api/placements?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPlacements(data)
      }
    } catch (error) {
      console.error("Error fetching placements:", error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: Record<string, string> = {
    IN_PROGRESS: "bg-yellow-500",
    PLACED: "bg-green-500",
    JOINED: "bg-blue-500",
    OFFER_DECLINED: "bg-red-500",
    OFFER_PENDING: "bg-orange-500",
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
            placeholder="Search placements..."
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
              <TableHead>Placement #</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Joining Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {placements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No placements found
                </TableCell>
              </TableRow>
            ) : (
              placements.map((placement) => (
                <TableRow key={placement.id}>
                  <TableCell className="font-medium">{placement.placementNumber}</TableCell>
                  <TableCell>
                    {placement.students.users.firstName} {placement.students.users.lastName}
                  </TableCell>
                  <TableCell>{placement.companyName}</TableCell>
                  <TableCell>{placement.jobTitle}</TableCell>
                  <TableCell>{placement.location}</TableCell>
                  <TableCell>
                    {placement.salary ? `₹${placement.salary.toLocaleString()}` : "-"}
                  </TableCell>
                  <TableCell>{placement.joiningDate ? formatDate(placement.joiningDate) : "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColors[placement.status] || "bg-gray-500"}
                    >
                      {placement.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/placements/${placement.id}`}>
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
