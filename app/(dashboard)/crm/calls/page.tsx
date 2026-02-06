"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Play,
  Download,
  FileText,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCcw,
  Plus,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import Link from "next/link"

export default function CRMCallsPage() {
  const [calls, setCalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sentimentFilter, setSentimentFilter] = useState("")

  const fetchCalls = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (sentimentFilter) params.append("sentiment", sentimentFilter)

      const res = await fetch(`/api/crm/calls?${params.toString()}`)
      const data = await res.json()
      setCalls(data.calls || [])
    } catch (error) {
      console.error("Error fetching calls:", error)
      toast.error("Failed to fetch calls")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCalls()
  }, [sentimentFilter])

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "VERY_POSITIVE":
      case "POSITIVE":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "NEGATIVE":
      case "VERY_NEGATIVE":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "VERY_POSITIVE":
        return "bg-green-100 text-green-800 border-green-200"
      case "POSITIVE":
        return "bg-green-50 text-green-700 border-green-100"
      case "NEUTRAL":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "NEGATIVE":
        return "bg-orange-50 text-orange-700 border-orange-100"
      case "VERY_NEGATIVE":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-50 text-gray-600 border-gray-100"
    }
  }

  const getCallTypeIcon = (type: string) => {
    switch (type) {
      case "INBOUND":
        return <PhoneIncoming className="h-4 w-4" />
      case "OUTBOUND":
        return <PhoneOutgoing className="h-4 w-4" />
      case "MISSED":
        return <PhoneMissed className="h-4 w-4 text-red-500" />
      default:
        return <Phone className="h-4 w-4" />
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const stats = {
    total: calls.length,
    positive: calls.filter(c => ["POSITIVE", "VERY_POSITIVE"].includes(c.sentiment)).length,
    negative: calls.filter(c => ["NEGATIVE", "VERY_NEGATIVE"].includes(c.sentiment)).length,
    avgDuration: calls.length > 0
      ? calls.reduce((sum, c) => sum + (c.duration || 0), 0) / calls.length
      : 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Call Recordings</h1>
          <p className="text-muted-foreground mt-1">
            View, analyze, and transcribe call recordings with AI-powered insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCalls}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Log Call
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Log New Call</DialogTitle>
                <DialogDescription>
                  Record details of a phone conversation with a lead
                </DialogDescription>
              </DialogHeader>
              <div className="text-center py-8 text-muted-foreground">
                Call logging form coming soon...
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Positive Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.positive}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.positive / stats.total) * 100).toFixed(1) : "0"}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Negative Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.negative}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.negative / stats.total) * 100).toFixed(1) : "0"}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(stats.avgDuration / 60)}:{(stats.avgDuration % 60).toFixed(0).padStart(2, "0")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Sentiments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All Sentiments</SelectItem>
                <SelectItem value="VERY_POSITIVE">Very Positive</SelectItem>
                <SelectItem value="POSITIVE">Positive</SelectItem>
                <SelectItem value="NEUTRAL">Neutral</SelectItem>
                <SelectItem value="NEGATIVE">Negative</SelectItem>
                <SelectItem value="VERY_NEGATIVE">Very Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Calls List */}
      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading calls...
            </CardContent>
          </Card>
        ) : calls.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No calls found
            </CardContent>
          </Card>
        ) : (
          calls.map((call) => (
            <Card key={call.id} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Call Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getCallTypeIcon(call.callType)}
                        <span className="font-semibold">
                          {call.inquiries.students.users.firstName}{" "}
                          {call.inquiries.students.users.lastName}
                        </span>
                      </div>
                      <Badge variant="outline">{call.callType}</Badge>
                      {call.sentiment && (
                        <Badge variant="outline" className={getSentimentColor(call.sentiment)}>
                          <span className="mr-1">{getSentimentIcon(call.sentiment)}</span>
                          {call.sentiment.replace("_", " ")}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(call.startTime).toLocaleString()}
                      </div>
                      <div>Duration: {formatDuration(call.duration)}</div>
                      {call.outcome && (
                        <Badge variant="secondary">{call.outcome.replace("_", " ")}</Badge>
                      )}
                    </div>

                    {call.summary && (
                      <p className="text-sm text-muted-foreground">{call.summary}</p>
                    )}

                    {call.keyTopics && call.keyTopics.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {call.keyTopics.map((topic: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex gap-2">
                    {call.recordingUrl && (
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Play
                      </Button>
                    )}
                    {call.transcript && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            Transcript
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Call Transcript</DialogTitle>
                            <DialogDescription>
                              {new Date(call.startTime).toLocaleString()} •{" "}
                              {formatDuration(call.duration)}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="whitespace-pre-wrap text-sm">{call.transcript}</div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <Link href={`/crm/leads/${call.inquiries.id}`}>
                      <Button variant="ghost" size="sm">
                        View Lead
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
