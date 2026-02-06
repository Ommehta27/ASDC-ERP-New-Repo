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
import { 
  Eye, 
  Search, 
  Phone, 
  Thermometer, 
  Clock, 
  TrendingUp,
  MessageSquare,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { InquiryStatusSelector } from "./inquiry-status-selector"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface Inquiry {
  id: string
  inquiryNumber: string
  source: string
  status: string
  priority: string
  interestedCourses: string[]
  createdAt: Date
  leadScore: number
  leadTemperature: string
  lastContactedAt: string | null
  totalInteractions: number
  followUpDate: string | null
  qualificationStatus: string
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
  const [temperatureFilter, setTemperatureFilter] = useState<string>("")

  useEffect(() => {
    fetchInquiries()
  }, [search, temperatureFilter])

  const fetchInquiries = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (temperatureFilter) params.append("temperature", temperatureFilter)
      
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

  const getTemperatureColor = (temp: string) => {
    switch (temp) {
      case "HOT": return "bg-red-100 text-red-800 border-red-300"
      case "WARM": return "bg-orange-100 text-orange-800 border-orange-300"
      case "COLD": return "bg-blue-100 text-blue-800 border-blue-300"
      default: return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-red-600"
    if (score >= 40) return "text-orange-600"
    return "text-blue-600"
  }

  const isFollowUpOverdue = (date: string | null) => {
    if (!date) return false
    return new Date(date) < new Date()
  }

  const sourceColors: Record<string, string> = {
    WALK_IN: "bg-blue-500",
    PHONE: "bg-green-500",
    EMAIL: "bg-purple-500",
    WEBSITE: "bg-yellow-500",
    SOCIAL_MEDIA: "bg-pink-500",
    REFERRAL: "bg-cyan-500",
    MOBILE_APP: "bg-orange-500",
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
        <div className="flex gap-2">
          <Button
            variant={temperatureFilter === "HOT" ? "default" : "outline"}
            size="sm"
            onClick={() => setTemperatureFilter(temperatureFilter === "HOT" ? "" : "HOT")}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            🔥 Hot
          </Button>
          <Button
            variant={temperatureFilter === "WARM" ? "default" : "outline"}
            size="sm"
            onClick={() => setTemperatureFilter(temperatureFilter === "WARM" ? "" : "WARM")}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            🟠 Warm
          </Button>
          <Button
            variant={temperatureFilter === "COLD" ? "default" : "outline"}
            size="sm"
            onClick={() => setTemperatureFilter(temperatureFilter === "COLD" ? "" : "COLD")}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            🔵 Cold
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Score</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="w-24">Temp</TableHead>
              <TableHead>Interactions</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead>Next Follow-up</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No inquiries found
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((inquiry) => {
                const followUpOverdue = isFollowUpOverdue(inquiry.followUpDate)
                return (
                  <TableRow 
                    key={inquiry.id} 
                    className={`hover:bg-accent/50 ${followUpOverdue ? "bg-red-50/50" : ""}`}
                  >
                    <TableCell>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getScoreColor(inquiry.leadScore)}`}>
                          {inquiry.leadScore}
                        </div>
                        <Progress value={inquiry.leadScore} className="h-1 w-12 mt-1" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold">
                          {inquiry.students.users.firstName} {inquiry.students.users.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {inquiry.inquiryNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {inquiry.students.users.phone || "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {inquiry.students.users.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${getTemperatureColor(inquiry.leadTemperature)} font-semibold flex items-center gap-1 w-fit`}
                      >
                        <Thermometer className="h-3 w-3" />
                        {inquiry.leadTemperature}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{inquiry.totalInteractions}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {inquiry.lastContactedAt ? (
                        <div className="text-sm">
                          {formatDate(new Date(inquiry.lastContactedAt))}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">Never</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {inquiry.followUpDate ? (
                        <div className={`text-sm flex items-center gap-1 ${followUpOverdue ? "text-red-600 font-semibold" : ""}`}>
                          {followUpOverdue && <AlertCircle className="h-3 w-3" />}
                          <Clock className="h-3 w-3" />
                          {formatDate(new Date(inquiry.followUpDate))}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">Not scheduled</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <InquiryStatusSelector
                        inquiryId={inquiry.id}
                        currentStatus={inquiry.status}
                        currentPriority={inquiry.priority}
                        onUpdate={fetchInquiries}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/inquiries/${inquiry.id}`}>
                          <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
                            <Phone className="h-3 w-3 mr-1" />
                            Call
                          </Button>
                        </Link>
                        <Link href={`/inquiries/${inquiry.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
