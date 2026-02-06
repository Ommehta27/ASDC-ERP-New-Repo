"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  Video,
  MessageSquare,
  RefreshCcw,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function CRMFollowUpsPage() {
  const [followUps, setFollowUps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [overdueOnly, setOverdueOnly] = useState(false)

  const fetchFollowUps = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append("status", statusFilter)
      if (overdueOnly) params.append("overdue", "true")

      const res = await fetch(`/api/crm/follow-ups?${params.toString()}`)
      const data = await res.json()
      setFollowUps(data.followUps || [])
    } catch (error) {
      console.error("Error fetching follow-ups:", error)
      toast.error("Failed to fetch follow-ups")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFollowUps()
  }, [statusFilter, overdueOnly])

  const handleComplete = async (followUpId: string) => {
    try {
      await fetch("/api/crm/follow-ups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpId, status: "COMPLETED" }),
      })
      toast.success("Follow-up marked as completed")
      fetchFollowUps()
    } catch (error) {
      toast.error("Failed to update follow-up")
    }
  }

  const getFollowUpIcon = (type: string) => {
    switch (type) {
      case "CALL": return <Phone className="h-4 w-4" />
      case "EMAIL": return <Mail className="h-4 w-4" />
      case "SMS": return <MessageSquare className="h-4 w-4" />
      case "MEETING": return <Video className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT": return "destructive"
      case "HIGH": return "destructive"
      case "MEDIUM": return "default"
      case "LOW": return "secondary"
      default: return "outline"
    }
  }

  const isOverdue = (date: string) => {
    return new Date(date) < new Date()
  }

  const pending = followUps.filter(f => f.status === "PENDING")
  const completed = followUps.filter(f => f.status === "COMPLETED")
  const overdue = pending.filter(f => isOverdue(f.scheduledDate))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Follow-ups</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all scheduled follow-up activities
          </p>
        </div>
        <Button variant="outline" onClick={fetchFollowUps}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Follow-ups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{followUps.length}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pending.length}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdue.length}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completed.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={overdueOnly ? "default" : "outline"}
              onClick={() => setOverdueOnly(!overdueOnly)}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Overdue Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Follow-ups List */}
      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading follow-ups...
            </CardContent>
          </Card>
        ) : followUps.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No follow-ups found
            </CardContent>
          </Card>
        ) : (
          followUps.map((followUp) => {
            const overdueFlag = followUp.status === "PENDING" && isOverdue(followUp.scheduledDate)
            return (
              <Card
                key={followUp.id}
                className={`hover:bg-accent/50 transition-colors ${
                  overdueFlag ? "border-red-200 bg-red-50/20" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Follow-up Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        {getFollowUpIcon(followUp.followUpType)}
                        <Link
                          href={`/crm/leads/${followUp.inquiries.id}`}
                          className="font-semibold hover:underline"
                        >
                          {followUp.inquiries.students.users.firstName}{" "}
                          {followUp.inquiries.students.users.lastName}
                        </Link>
                        <Badge variant={getPriorityColor(followUp.priority)}>
                          {followUp.priority}
                        </Badge>
                        <Badge variant="outline">{followUp.followUpType}</Badge>
                        {overdueFlag && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            OVERDUE
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(followUp.scheduledDate).toLocaleString()}
                        </div>
                      </div>

                      {followUp.notes && (
                        <p className="text-sm text-muted-foreground">{followUp.notes}</p>
                      )}

                      {followUp.outcome && (
                        <div className="text-sm">
                          <span className="font-medium">Outcome:</span> {followUp.outcome}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex gap-2">
                      {followUp.status === "PENDING" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleComplete(followUp.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                      <Link href={`/crm/leads/${followUp.inquiries.id}`}>
                        <Button variant="ghost" size="sm">
                          View Lead
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
