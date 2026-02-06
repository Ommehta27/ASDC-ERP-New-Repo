"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Target,
  Thermometer,
  TrendingUp,
  TrendingDown,
  Phone,
  Mail,
  Calendar,
  User,
  Search,
  Filter,
  Download,
  RefreshCcw,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Lead {
  id: string
  inquiryNumber: string
  leadScore: number
  leadTemperature: string
  qualificationStatus: string
  status: string
  priority: string
  lastContactedAt: string | null
  totalInteractions: number
  conversionProbability: number | null
  followUpDate: string | null
  students: {
    users: {
      firstName: string
      lastName: string
      email: string
      phone: string | null
    }
  }
  users_inquiries_assignedToIdTousers: {
    firstName: string
    lastName: string
  } | null
  centers: {
    name: string
    code: string
  }
  inquiry_calls: any[]
  inquiry_activities: any[]
  inquiry_follow_ups: any[]
}

export default function CRMLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [temperatureFilter, setTemperatureFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [qualificationFilter, setQualificationFilter] = useState<string>("")

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (temperatureFilter) params.append("temperature", temperatureFilter)
      if (statusFilter) params.append("status", statusFilter)
      if (qualificationFilter) params.append("qualification", qualificationFilter)

      const res = await fetch(`/api/crm/leads?${params.toString()}`)
      const data = await res.json()
      setLeads(data.inquiries || [])
    } catch (error) {
      console.error("Error fetching leads:", error)
      toast.error("Failed to fetch leads")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [temperatureFilter, statusFilter, qualificationFilter])

  const getTemperatureColor = (temp: string) => {
    switch (temp) {
      case "HOT": return "destructive"
      case "WARM": return "default"
      case "COLD": return "secondary"
      default: return "outline"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-red-500"
    if (score >= 40) return "text-orange-500"
    return "text-blue-500"
  }

  const filteredLeads = leads.filter((lead) => {
    const searchLower = searchTerm.toLowerCase()
    const studentName = `${lead.students.users.firstName} ${lead.students.users.lastName}`.toLowerCase()
    const email = lead.students.users.email.toLowerCase()
    const phone = lead.students.users.phone || ""
    return studentName.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower)
  })

  const stats = {
    total: leads.length,
    hot: leads.filter(l => l.leadTemperature === "HOT").length,
    warm: leads.filter(l => l.leadTemperature === "WARM").length,
    cold: leads.filter(l => l.leadTemperature === "COLD").length,
    qualified: leads.filter(l => l.qualificationStatus === "SALES_QUALIFIED").length,
    avgScore: leads.length > 0 
      ? (leads.reduce((sum, l) => sum + l.leadScore, 0) / leads.length).toFixed(1) 
      : "0",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Enterprise-grade CRM with intelligent lead scoring and conversion tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLeads}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Thermometer className="h-4 w-4 text-red-500" />
              Hot Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.hot}</div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Thermometer className="h-4 w-4 text-orange-500" />
              Warm Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.warm}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Thermometer className="h-4 w-4 text-blue-500" />
              Cold Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.cold}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Target className="h-4 w-4 text-green-500" />
              Qualified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.qualified}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={temperatureFilter} onValueChange={setTemperatureFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Temperatures" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All Temperatures</SelectItem>
                <SelectItem value="HOT">Hot</SelectItem>
                <SelectItem value="WARM">Warm</SelectItem>
                <SelectItem value="COLD">Cold</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All Status</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="CONTACTED">Contacted</SelectItem>
                <SelectItem value="QUALIFIED">Qualified</SelectItem>
                <SelectItem value="INTERESTED">Interested</SelectItem>
                <SelectItem value="ENROLLED">Enrolled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={qualificationFilter} onValueChange={setQualificationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Qualification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All Qualification</SelectItem>
                <SelectItem value="UNQUALIFIED">Unqualified</SelectItem>
                <SelectItem value="MARKETING_QUALIFIED">Marketing Qualified</SelectItem>
                <SelectItem value="SALES_QUALIFIED">Sales Qualified</SelectItem>
                <SelectItem value="DISQUALIFIED">Disqualified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads ({filteredLeads.length})</CardTitle>
          <CardDescription>
            Click on any lead to view detailed information and interaction history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading leads...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No leads found</div>
          ) : (
            <div className="space-y-3">
              {filteredLeads.map((lead) => (
                <Link key={lead.id} href={`/crm/leads/${lead.id}`}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Lead Score */}
                        <div className="col-span-1 text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(lead.leadScore)}`}>
                            {lead.leadScore}
                          </div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>

                        {/* Student Info */}
                        <div className="col-span-3">
                          <div className="font-semibold">
                            {lead.students.users.firstName} {lead.students.users.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {lead.students.users.email}
                          </div>
                          {lead.students.users.phone && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {lead.students.users.phone}
                            </div>
                          )}
                        </div>

                        {/* Temperature & Status */}
                        <div className="col-span-2 space-y-1">
                          <Badge variant={getTemperatureColor(lead.leadTemperature)}>
                            {lead.leadTemperature}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {lead.qualificationStatus.replace(/_/g, " ")}
                          </div>
                        </div>

                        {/* Interactions */}
                        <div className="col-span-2 text-center">
                          <div className="text-lg font-semibold">{lead.totalInteractions}</div>
                          <div className="text-xs text-muted-foreground">Interactions</div>
                        </div>

                        {/* Last Contact */}
                        <div className="col-span-2 text-sm">
                          {lead.lastContactedAt ? (
                            <>
                              <div className="text-muted-foreground">Last Contact:</div>
                              <div>{new Date(lead.lastContactedAt).toLocaleDateString()}</div>
                            </>
                          ) : (
                            <div className="text-muted-foreground">Not contacted</div>
                          )}
                        </div>

                        {/* Assigned To */}
                        <div className="col-span-2 text-sm">
                          {lead.users_inquiries_assignedToIdTousers ? (
                            <>
                              <div className="text-muted-foreground">Assigned:</div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {lead.users_inquiries_assignedToIdTousers.firstName}{" "}
                                {lead.users_inquiries_assignedToIdTousers.lastName}
                              </div>
                            </>
                          ) : (
                            <div className="text-muted-foreground">Unassigned</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
