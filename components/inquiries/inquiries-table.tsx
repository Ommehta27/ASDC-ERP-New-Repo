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
import { InquiryStatusSelector } from "./inquiry-status-selector"

interface Inquiry {
  id: string
  inquiryNumber: string
  source: string
  status: string
  priority: string
  interestedCourses: string[]
  createdAt: Date
  students: {
    users: {
      email: string
      firstName: string
      lastName: string
      phone: string | null
    }
  }
  centers: {
    name: string
    code: string
  }
}

export function InquiriesTable() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchInquiries()
  }, [search])

  const fetchInquiries = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      
      const response = await fetch(`/api/inquiries?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInquiries(data)
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error)
    } finally {
      setLoading(false)
    }
  }

  const sourceColors: Record<string, string> = {
    DIRECT: "bg-blue-500",
    REFERRAL: "bg-green-500",
    WEBSITE: "bg-purple-500",
    PHONE_CALL: "bg-yellow-500",
    EMAIL: "bg-cyan-500",
    SOCIAL_MEDIA: "bg-pink-500",
    WALK_IN: "bg-orange-500",
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
            placeholder="Search inquiries..."
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
              <TableHead>Inquiry #</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Center</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status & Priority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No inquiries found
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell className="font-medium">{inquiry.inquiryNumber}</TableCell>
                  <TableCell>
                    {inquiry.students.users.firstName} {inquiry.students.users.lastName}
                  </TableCell>
                  <TableCell>{inquiry.students.users.email}</TableCell>
                  <TableCell>{inquiry.students.users.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={sourceColors[inquiry.source] || "bg-gray-500"}>
                      {inquiry.source}
                    </Badge>
                  </TableCell>
                  <TableCell>{inquiry.centers.name}</TableCell>
                  <TableCell>{formatDate(inquiry.createdAt)}</TableCell>
                  <TableCell>
                    <InquiryStatusSelector
                      inquiryId={inquiry.id}
                      currentStatus={inquiry.status}
                      currentPriority={inquiry.priority}
                      onUpdate={fetchInquiries}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/inquiries/${inquiry.id}`}>
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
