import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WorkflowsTable } from "@/components/workflows/workflows-table"
import { WorkflowStats } from "@/components/workflows/workflow-stats"
import { Button } from "@/components/ui/button"
import { Plus, Zap } from "lucide-react"
import Link from "next/link"

export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Automation</h1>
          <p className="text-muted-foreground mt-1">
            Automate tasks with WhatsApp, Meta, Google, and other API integrations
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/workflows/templates">
            <Button variant="outline">
              <Zap className="mr-2 h-4 w-4" />
              Templates
            </Button>
          </Link>
          <Link href="/workflows/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </Link>
        </div>
      </div>

      <WorkflowStats />

      <Card>
        <CardHeader>
          <CardTitle>Your Workflows</CardTitle>
          <CardDescription>
            Manage and monitor your automated workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkflowsTable />
        </CardContent>
      </Card>
    </div>
  )
}
