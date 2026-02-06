"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Thermometer,
  TrendingUp,
  MessageSquare,
  Clock,
  Activity,
  FileText,
  Lightbulb,
  Target,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Play,
  Video,
  Send,
} from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

interface InquiryDetailClientProps {
  inquiry: any
  currentUserId: string
}

export function InquiryDetailClient({ inquiry, currentUserId }: InquiryDetailClientProps) {
  const [callDialogOpen, setCallDialogOpen] = useState(false)
  const [callData, setCallData] = useState({
    duration: 0,
    sentiment: "",
    summary: "",
    keyTopics: "",
    concerns: "",
    nextSteps: "",
    outcome: "",
    notes: "",
  })
  const [submittingCall, setSubmittingCall] = useState(false)

  // AI-Powered Insights
  const generateInsights = () => {
    const insights = []
    
    if (inquiry.leadScore >= 70) {
      insights.push({
        type: "success",
        title: "Hot Lead Alert!",
        message: "This lead has a high conversion probability. Prioritize immediate follow-up.",
        action: "Schedule Demo",
      })
    }
    
    if (inquiry.totalInteractions === 0) {
      insights.push({
        type: "warning",
        title: "No Interactions Yet",
        message: "This lead hasn't been contacted. Make the first call now to establish rapport.",
        action: "Make First Call",
      })
    }
    
    if (inquiry.followUpDate && new Date(inquiry.followUpDate) < new Date()) {
      insights.push({
        type: "error",
        title: "Overdue Follow-up",
        message: "Follow-up was scheduled for " + formatDate(new Date(inquiry.followUpDate)) + ". Contact immediately!",
        action: "Call Now",
      })
    }
    
    if (inquiry.leadTemperature === "COLD" && inquiry.totalInteractions > 3) {
      insights.push({
        type: "info",
        title: "Re-engagement Needed",
        message: "Multiple attempts made but lead remains cold. Try a different approach or offer.",
        action: "Send Special Offer",
      })
    }
    
    if (inquiry.inquiry_calls.length > 0) {
      const lastCall = inquiry.inquiry_calls[0]
      if (lastCall.sentiment === "NEGATIVE" || lastCall.sentiment === "VERY_NEGATIVE") {
        insights.push({
          type: "warning",
          title: "Negative Sentiment Detected",
          message: `Last call had ${lastCall.sentiment.replace("_", " ").toLowerCase()} sentiment. Address concerns before next contact.`,
          action: "Review Call Notes",
        })
      }
    }
    
    return insights
  }

  const insights = generateInsights()

  // Next Best Actions (AI-Recommended)
  const getNextBestActions = () => {
    const actions = []
    
    if (!inquiry.lastContactedAt) {
      actions.push({ icon: Phone, label: "Make First Call", priority: "high", color: "bg-red-500" })
    } else if (inquiry.leadScore >= 70) {
      actions.push({ icon: Video, label: "Schedule Demo", priority: "high", color: "bg-green-500" })
      actions.push({ icon: FileText, label: "Send Brochure", priority: "medium", color: "bg-blue-500" })
    } else if (inquiry.leadTemperature === "WARM") {
      actions.push({ icon: Phone, label: "Follow-up Call", priority: "medium", color: "bg-orange-500" })
      actions.push({ icon: Mail, label: "Send Email", priority: "low", color: "bg-gray-500" })
    } else {
      actions.push({ icon: Send, label: "Send WhatsApp", priority: "low", color: "bg-green-600" })
      actions.push({ icon: Mail, label: "Nurture Email", priority: "low", color: "bg-blue-400" })
    }
    
    return actions
  }

  const nextActions = getNextBestActions()

  const handleLogCall = async () => {
    setSubmittingCall(true)
    try {
      const response = await fetch("/api/crm/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryId: inquiry.id,
          callType: "OUTBOUND",
          duration: parseInt(callData.duration as any) || 0,
          sentiment: callData.sentiment || null,
          summary: callData.summary,
          keyTopics: callData.keyTopics ? callData.keyTopics.split(",").map(t => t.trim()) : [],
          concerns: callData.concerns ? callData.concerns.split(",").map(c => c.trim()) : [],
          nextSteps: callData.nextSteps,
          outcome: callData.outcome || null,
          notes: callData.notes,
        }),
      })

      if (response.ok) {
        toast.success("Call logged successfully! Lead score updated.")
        setCallDialogOpen(false)
        setCallData({
          duration: 0,
          sentiment: "",
          summary: "",
          keyTopics: "",
          concerns: "",
          nextSteps: "",
          outcome: "",
          notes: "",
        })
        window.location.reload()
      } else {
        toast.error("Failed to log call")
      }
    } catch (error) {
      console.error("Error logging call:", error)
      toast.error("Failed to log call")
    } finally {
      setSubmittingCall(false)
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

  const getSentimentBadge = (sentiment: string) => {
    const colors: Record<string, string> = {
      VERY_POSITIVE: "bg-green-500 text-white",
      POSITIVE: "bg-green-400 text-white",
      NEUTRAL: "bg-gray-400 text-white",
      NEGATIVE: "bg-orange-500 text-white",
      VERY_NEGATIVE: "bg-red-500 text-white",
    }
    return colors[sentiment] || "bg-gray-300"
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/inquiries">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inquiries
          </Button>
        </Link>
      </div>

      {/* Hero Section - Student Info & CRM Score */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Student Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-3xl">
                  {inquiry.students.users.firstName} {inquiry.students.users.lastName}
                </CardTitle>
                <CardDescription className="text-base">
                  {inquiry.inquiryNumber} • {inquiry.qualificationStatus.replace(/_/g, " ")}
                </CardDescription>
              </div>
              <Badge variant="outline" className={`text-lg px-4 py-2 ${getTemperatureColor(inquiry.leadTemperature)}`}>
                <Thermometer className="h-5 w-5 mr-2" />
                {inquiry.leadTemperature}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{inquiry.students.users.phone || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium truncate">{inquiry.students.users.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{inquiry.centers.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{formatDate(new Date(inquiry.createdAt))}</span>
              </div>
            </div>
            
            {inquiry.interestedCourses && inquiry.interestedCourses.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Interested Courses:</p>
                <div className="flex gap-2 flex-wrap">
                  {inquiry.interestedCourses.map((course: string, i: number) => (
                    <Badge key={i} variant="secondary">{course}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CRM Score Card */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Lead Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(inquiry.leadScore)}`}>
                {inquiry.leadScore}
              </div>
              <p className="text-sm text-muted-foreground mt-2">out of 100</p>
              <Progress value={inquiry.leadScore} className="h-3 mt-4" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{inquiry.totalInteractions}</div>
                <p className="text-xs text-muted-foreground">Interactions</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{inquiry.inquiry_calls.length}</div>
                <p className="text-xs text-muted-foreground">Calls</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>Smart recommendations based on lead behavior and history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border ${
                  insight.type === "success"
                    ? "bg-green-50 border-green-200"
                    : insight.type === "warning"
                    ? "bg-yellow-50 border-yellow-200"
                    : insight.type === "error"
                    ? "bg-red-50 border-red-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.message}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    {insight.action}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Next Best Actions
          </CardTitle>
          <CardDescription>AI-recommended actions to move this lead forward</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            {/* Primary Call Button */}
            <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                  <Phone className="h-5 w-5 mr-2" />
                  Make Call & Log
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Log Call with {inquiry.students.users.firstName}</DialogTitle>
                  <DialogDescription>
                    Record call details and the system will automatically update the lead score
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Call Duration (seconds)</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 300"
                        value={callData.duration}
                        onChange={(e) => setCallData({ ...callData, duration: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sentiment *</Label>
                      <Select value={callData.sentiment} onValueChange={(v) => setCallData({ ...callData, sentiment: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sentiment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VERY_POSITIVE">😊 Very Positive</SelectItem>
                          <SelectItem value="POSITIVE">🙂 Positive</SelectItem>
                          <SelectItem value="NEUTRAL">😐 Neutral</SelectItem>
                          <SelectItem value="NEGATIVE">😟 Negative</SelectItem>
                          <SelectItem value="VERY_NEGATIVE">😠 Very Negative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Call Summary *</Label>
                    <Textarea
                      placeholder="Brief summary of the conversation..."
                      value={callData.summary}
                      onChange={(e) => setCallData({ ...callData, summary: e.target.value })}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Key Topics (comma-separated)</Label>
                    <Input
                      placeholder="e.g., Fees, Course Duration, Job Prospects"
                      value={callData.keyTopics}
                      onChange={(e) => setCallData({ ...callData, keyTopics: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Concerns Raised (comma-separated)</Label>
                    <Input
                      placeholder="e.g., High fees, Location far, Time constraints"
                      value={callData.concerns}
                      onChange={(e) => setCallData({ ...callData, concerns: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Next Steps</Label>
                    <Textarea
                      placeholder="What should happen next..."
                      value={callData.nextSteps}
                      onChange={(e) => setCallData({ ...callData, nextSteps: e.target.value })}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Outcome</Label>
                    <Select value={callData.outcome} onValueChange={(v) => setCallData({ ...callData, outcome: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INTERESTED">Interested</SelectItem>
                        <SelectItem value="CONVERTED">Converted</SelectItem>
                        <SelectItem value="FOLLOW_UP_SCHEDULED">Follow-up Scheduled</SelectItem>
                        <SelectItem value="NOT_INTERESTED">Not Interested</SelectItem>
                        <SelectItem value="CALL_BACK_REQUESTED">Call Back Requested</SelectItem>
                        <SelectItem value="NO_ANSWER">No Answer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Additional Notes</Label>
                    <Textarea
                      placeholder="Any other important information..."
                      value={callData.notes}
                      onChange={(e) => setCallData({ ...callData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCallDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleLogCall} 
                    disabled={!callData.sentiment || !callData.summary || submittingCall}
                  >
                    {submittingCall ? "Logging..." : "Log Call & Update Score"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {nextActions.map((action, i) => (
              <Button key={i} variant="outline" size="lg" className={action.color}>
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="calls" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calls">Call History ({inquiry.inquiry_calls.length})</TabsTrigger>
          <TabsTrigger value="activities">Activities ({inquiry.inquiry_activities.length})</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups ({inquiry.inquiry_follow_ups.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes ({inquiry.inquiry_notes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="calls" className="space-y-4">
          {inquiry.inquiry_calls.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No calls logged yet. Click "Make Call & Log" to record your first interaction.
              </CardContent>
            </Card>
          ) : (
            inquiry.inquiry_calls.map((call: any) => (
              <Card key={call.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{call.callType}</Badge>
                        {call.sentiment && (
                          <Badge className={getSentimentBadge(call.sentiment)}>
                            {call.sentiment.replace("_", " ")}
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {new Date(call.startTime).toLocaleString()}
                        </span>
                        {call.duration && (
                          <span className="text-sm text-muted-foreground">
                            • {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, "0")}
                          </span>
                        )}
                      </div>
                      
                      {call.summary && (
                        <p className="text-sm">{call.summary}</p>
                      )}
                      
                      {call.keyTopics && call.keyTopics.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {call.keyTopics.map((topic: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {call.nextSteps && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <strong>Next Steps:</strong> {call.nextSteps}
                        </div>
                      )}
                    </div>
                    
                    {call.recordingUrl && (
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Play
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          {inquiry.inquiry_activities.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No activities recorded yet.
              </CardContent>
            </Card>
          ) : (
            inquiry.inquiry_activities.map((activity: any) => (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Activity className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{activity.title}</h4>
                        <Badge variant="outline">{activity.activityType}</Badge>
                        <Badge variant={activity.status === "COMPLETED" ? "default" : "secondary"}>
                          {activity.status}
                        </Badge>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="followups" className="space-y-4">
          {inquiry.inquiry_follow_ups.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No follow-ups scheduled yet.
              </CardContent>
            </Card>
          ) : (
            inquiry.inquiry_follow_ups.map((followUp: any) => (
              <Card key={followUp.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Clock className="h-5 w-5 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{followUp.followUpType}</Badge>
                          <Badge variant={followUp.status === "COMPLETED" ? "default" : "secondary"}>
                            {followUp.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(followUp.scheduledDate).toLocaleString()}
                          </span>
                        </div>
                        {followUp.notes && (
                          <p className="text-sm text-muted-foreground">{followUp.notes}</p>
                        )}
                      </div>
                    </div>
                    {followUp.status === "PENDING" && (
                      <Button size="sm">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          {inquiry.inquiry_notes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No notes added yet.
              </CardContent>
            </Card>
          ) : (
            inquiry.inquiry_notes.map((note: any) => (
              <Card key={note.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="text-sm">{note.note}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
