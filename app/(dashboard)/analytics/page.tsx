import { requireAuth } from "@/lib/session"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PowerBIEmbed } from "@/components/analytics/powerbi-embed"
import { BarChart3, TrendingUp, Users, Briefcase } from "lucide-react"

export const metadata = {
  title: "Analytics & Reports",
  description: "View business intelligence dashboards and reports.",
}

export default async function AnalyticsPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "view_analytics")) {
    return redirect("/auth/unauthorized")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
        <p className="text-muted-foreground">
          Comprehensive business intelligence dashboards powered by PowerBI
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="h-4 w-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger value="placements">
            <Briefcase className="h-4 w-4 mr-2" />
            Placements
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How to Embed PowerBI Reports</CardTitle>
              <CardDescription>
                Follow these steps to integrate your PowerBI dashboards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Step 1: Create a PowerBI Report</h3>
                <p className="text-sm text-muted-foreground">
                  Log in to your PowerBI Service account and create or open the report you want to embed.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Step 2: Get the Embed URL</h3>
                <p className="text-sm text-muted-foreground">
                  Click on <strong>File → Embed → Publish to web</strong>. Copy the iframe URL provided.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Step 3: Paste the URL Below</h3>
                <p className="text-sm text-muted-foreground">
                  Enter the embed URL in the configuration section below to display your dashboard.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Make sure your PowerBI report is published and publicly accessible, 
                  or configured with appropriate authentication for your organization.
                </p>
              </div>
            </CardContent>
          </Card>

          <PowerBIEmbed title="Business Overview Dashboard" />
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Analytics</CardTitle>
              <CardDescription>
                Track student enrollment, performance, and retention metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure your PowerBI report URL above to display student analytics including:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                <li>Enrollment trends over time</li>
                <li>Course completion rates</li>
                <li>Student demographics and distribution</li>
                <li>Performance metrics by center</li>
                <li>Drop-out analysis and retention rates</li>
              </ul>
            </CardContent>
          </Card>
          
          <PowerBIEmbed title="Student Life Cycle Analytics" />
        </TabsContent>

        <TabsContent value="placements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Placement Analytics</CardTitle>
              <CardDescription>
                Monitor placement success rates and salary trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure your PowerBI report URL above to display placement analytics including:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                <li>Placement success rates by course and center</li>
                <li>Average salary packages and trends</li>
                <li>Top recruiting companies and sectors</li>
                <li>Time-to-placement analysis</li>
                <li>Skill-wise placement comparison</li>
              </ul>
            </CardContent>
          </Card>
          
          <PowerBIEmbed title="Placement Performance Dashboard" />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Center Performance</CardTitle>
              <CardDescription>
                Compare center-wise performance metrics and KPIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure your PowerBI report URL above to display performance analytics including:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                <li>Center-wise enrollment and placement rates</li>
                <li>Resource utilization and capacity analysis</li>
                <li>Trainer performance metrics</li>
                <li>Financial performance by center</li>
                <li>Student satisfaction scores</li>
              </ul>
            </CardContent>
          </Card>
          
          <PowerBIEmbed title="Center Performance Dashboard" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
