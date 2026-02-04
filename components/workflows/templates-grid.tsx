"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Mail, Calendar, FileSpreadsheet, Users, Bell, TrendingUp } from "lucide-react"

interface Template {
  id: string
  name: string
  description: string
  category: string
  provider: string
  icon: any
  color: string
  steps: number
  usageCount: number
}

export function TemplatesGrid() {
  const templates: Template[] = [
    {
      id: "1",
      name: "WhatsApp New Student Welcome",
      description: "Automatically send a welcome message via WhatsApp when a new student enrolls",
      category: "Student Management",
      provider: "WHATSAPP",
      icon: MessageSquare,
      color: "text-green-600",
      steps: 3,
      usageCount: 245,
    },
    {
      id: "2",
      name: "Inquiry Follow-up Email",
      description: "Send automated follow-up emails to inquiries after 24 hours",
      category: "Lead Management",
      provider: "GMAIL",
      icon: Mail,
      color: "text-red-600",
      steps: 4,
      usageCount: 189,
    },
    {
      id: "3",
      name: "Google Calendar Meeting Scheduler",
      description: "Create calendar events when enrollment meetings are booked",
      category: "Scheduling",
      provider: "GOOGLE_CALENDAR",
      icon: Calendar,
      color: "text-blue-500",
      steps: 3,
      usageCount: 156,
    },
    {
      id: "4",
      name: "Student Data to Google Sheets",
      description: "Sync new student enrollments to Google Sheets for reporting",
      category: "Reporting",
      provider: "GOOGLE_SHEETS",
      icon: FileSpreadsheet,
      color: "text-green-600",
      steps: 2,
      usageCount: 312,
    },
    {
      id: "5",
      name: "WhatsApp Payment Reminder",
      description: "Send payment reminders via WhatsApp before due date",
      category: "Finance",
      provider: "WHATSAPP",
      icon: Bell,
      color: "text-orange-600",
      steps: 5,
      usageCount: 278,
    },
    {
      id: "6",
      name: "Facebook New Course Announcement",
      description: "Post new course announcements to Facebook page automatically",
      category: "Marketing",
      provider: "FACEBOOK",
      icon: TrendingUp,
      color: "text-blue-600",
      steps: 3,
      usageCount: 134,
    },
    {
      id: "7",
      name: "Bulk WhatsApp Notifications",
      description: "Send bulk notifications to students via WhatsApp",
      category: "Communication",
      provider: "WHATSAPP",
      icon: Users,
      color: "text-green-600",
      steps: 3,
      usageCount: 421,
    },
    {
      id: "8",
      name: "Gmail Course Completion Certificate",
      description: "Email course completion certificates automatically",
      category: "Student Management",
      provider: "GMAIL",
      icon: Mail,
      color: "text-red-600",
      steps: 4,
      usageCount: 298,
    },
  ]

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Student Management": "bg-purple-100 text-purple-800",
      "Lead Management": "bg-blue-100 text-blue-800",
      "Scheduling": "bg-green-100 text-green-800",
      "Reporting": "bg-yellow-100 text-yellow-800",
      "Finance": "bg-orange-100 text-orange-800",
      "Marketing": "bg-pink-100 text-pink-800",
      "Communication": "bg-cyan-100 text-cyan-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => {
        const Icon = template.icon
        return (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg bg-gray-50`}>
                  <Icon className={`h-6 w-6 ${template.color}`} />
                </div>
                <Badge variant="outline" className={getCategoryColor(template.category)}>
                  {template.category}
                </Badge>
              </div>
              <CardTitle className="mt-4">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{template.steps} steps</span>
                <span>{template.usageCount} uses</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Use Template</Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
