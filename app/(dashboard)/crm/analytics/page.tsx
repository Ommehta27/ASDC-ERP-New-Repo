"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  Phone,
  Target,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  RefreshCcw,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Analytics {
  overview: {
    totalInquiries: number
    hotLeads: number
    warmLeads: number
    coldLeads: number
    qualifiedLeads: number
    conversions: number
    conversionRate: number
    averageLeadScore: number
  }
  calls: {
    totalCalls: number
    totalCallDuration: number
    averageCallDuration: number
    positiveSentimentCalls: number
    negativeSentimentCalls: number
    sentimentBreakdown: any[]
  }
  followUps: {
    pending: number
    overdue: number
  }
  breakdowns: {
    bySource: any[]
    byStatus: any[]
  }
  topPerformers: any[]
  dailyTrends: any[]
}

export default function CRMAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState("30")

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(dateRange))

      const res = await fetch(
        `/api/crm/analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }
      
      const data = await res.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setAnalytics(data)
    } catch (error: any) {
      console.error("Error fetching analytics:", error)
      setError(error.message || "Failed to fetch analytics")
      toast.error("Failed to fetch analytics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error Loading Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {error || "Failed to load analytics data. Please try again."}
            </p>
            <Button onClick={fetchAnalytics} className="w-full">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { overview, calls, followUps, breakdowns } = analytics

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into lead performance and conversion metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview.totalInquiries}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.hotLeads} hot, {overview.warmLeads} warm, {overview.coldLeads} cold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Qualified Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{overview.qualifiedLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.totalInquiries > 0
                ? ((overview.qualifiedLeads / overview.totalInquiries) * 100).toFixed(1)
                : "0"}
              % qualification rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{overview.conversions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.conversionRate}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Lead Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview.averageLeadScore}</div>
            <Progress value={overview.averageLeadScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Call Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Call Statistics
            </CardTitle>
            <CardDescription>Performance metrics for all calls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Calls</span>
              <span className="text-2xl font-bold">{calls.totalCalls}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Duration</span>
              <span className="text-lg font-semibold">
                {Math.floor(calls.totalCallDuration / 60)} min
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Avg Duration</span>
              <span className="text-lg font-semibold">
                {Math.floor(calls.averageCallDuration / 60)} min {calls.averageCallDuration % 60}s
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Sentiment Analysis</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">Positive Calls</span>
                  <Badge variant="outline" className="bg-green-50">
                    {calls.positiveSentimentCalls}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">Negative Calls</span>
                  <Badge variant="outline" className="bg-red-50">
                    {calls.negativeSentimentCalls}
                  </Badge>
                </div>
                <Progress
                  value={
                    calls.totalCalls > 0
                      ? (calls.positiveSentimentCalls / calls.totalCalls) * 100
                      : 0
                  }
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Follow-up Tracking
            </CardTitle>
            <CardDescription>Pending and overdue follow-ups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg bg-blue-50/50 border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-900">Pending Follow-ups</span>
                <span className="text-3xl font-bold text-blue-600">{followUps.pending}</span>
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-red-50/50 border-red-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-red-900 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Overdue Follow-ups
                </span>
                <span className="text-3xl font-bold text-red-600">{followUps.overdue}</span>
              </div>
            </div>
            <div className="pt-2">
              <Button className="w-full" variant="outline">
                View All Follow-ups
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdowns */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads by Source</CardTitle>
            <CardDescription>Distribution of inquiry sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {breakdowns.bySource.map((item: any) => (
                <div key={item.source} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.source}</span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={
                        overview.totalInquiries > 0
                          ? (item._count / overview.totalInquiries) * 100
                          : 0
                      }
                      className="w-24 h-2"
                    />
                    <Badge variant="secondary">{item._count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leads by Status</CardTitle>
            <CardDescription>Current status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {breakdowns.byStatus.map((item: any) => (
                <div key={item.status} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.status}</span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={
                        overview.totalInquiries > 0
                          ? (item._count / overview.totalInquiries) * 100
                          : 0
                      }
                      className="w-24 h-2"
                    />
                    <Badge variant="secondary">{item._count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
