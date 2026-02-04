"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Facebook, Instagram, Mail, Calendar, FileSpreadsheet, HardDrive, Zap, Settings } from "lucide-react"

interface ApiProvider {
  id: string
  name: string
  provider: string
  description: string
  icon: any
  color: string
  status: "connected" | "disconnected" | "error"
  features: string[]
}

export function ApiConnectionsGrid() {
  const [providers] = useState<ApiProvider[]>([
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      provider: "WHATSAPP",
      description: "Send messages, notifications, and automate customer interactions",
      icon: MessageSquare,
      color: "text-green-600",
      status: "disconnected",
      features: ["Send Messages", "Webhooks", "Templates", "Media Support"],
    },
    {
      id: "facebook",
      name: "Facebook",
      provider: "FACEBOOK",
      description: "Post updates, manage pages, and automate social media",
      icon: Facebook,
      color: "text-blue-600",
      status: "disconnected",
      features: ["Post to Feed", "Page Management", "Comments", "Analytics"],
    },
    {
      id: "instagram",
      name: "Instagram",
      provider: "INSTAGRAM",
      description: "Share photos, stories, and manage Instagram business",
      icon: Instagram,
      color: "text-pink-600",
      status: "disconnected",
      features: ["Post Media", "Stories", "Comments", "Direct Messages"],
    },
    {
      id: "gmail",
      name: "Gmail",
      provider: "GMAIL",
      description: "Send emails, manage inbox, and automate email workflows",
      icon: Mail,
      color: "text-red-600",
      status: "disconnected",
      features: ["Send Emails", "Read Inbox", "Labels", "Attachments"],
    },
    {
      id: "gcal",
      name: "Google Calendar",
      provider: "GOOGLE_CALENDAR",
      description: "Create events, schedule meetings, and manage calendars",
      icon: Calendar,
      color: "text-blue-500",
      status: "disconnected",
      features: ["Create Events", "Update Events", "Reminders", "Attendees"],
    },
    {
      id: "gsheets",
      name: "Google Sheets",
      provider: "GOOGLE_SHEETS",
      description: "Read/write spreadsheets, automate data entry and reports",
      icon: FileSpreadsheet,
      color: "text-green-600",
      status: "disconnected",
      features: ["Read Sheets", "Write Data", "Update Rows", "Create Sheets"],
    },
    {
      id: "gdrive",
      name: "Google Drive",
      provider: "GOOGLE_DRIVE",
      description: "Upload files, manage folders, and share documents",
      icon: HardDrive,
      color: "text-yellow-600",
      status: "disconnected",
      features: ["Upload Files", "Create Folders", "Share Files", "Download"],
    },
  ])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-500">Connected</Badge>
      case "error":
        return <Badge className="bg-red-500">Error</Badge>
      default:
        return <Badge variant="secondary">Not Connected</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => {
          const Icon = provider.icon
          return (
            <Card key={provider.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg bg-gray-50`}>
                    <Icon className={`h-6 w-6 ${provider.color}`} />
                  </div>
                  {getStatusBadge(provider.status)}
                </div>
                <CardTitle className="mt-4">{provider.name}</CardTitle>
                <CardDescription>{provider.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {provider.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                {provider.status === "connected" ? (
                  <>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                    <Button variant="ghost" size="sm">
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button size="sm" className="flex-1">
                    <Zap className="mr-2 h-4 w-4" />
                    Connect
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Need a Custom Integration?
          </CardTitle>
          <CardDescription>
            Connect to any API with custom webhooks and REST API integrations
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Custom Integration
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function Plus({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  )
}
