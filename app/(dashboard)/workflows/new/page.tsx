import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WorkflowBuilder } from "@/components/workflows/workflow-builder"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewWorkflowPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/workflows">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Workflow</h1>
          <p className="text-muted-foreground mt-1">
            Build your custom automation workflow
          </p>
        </div>
      </div>

      <WorkflowBuilder />
    </div>
  )
}
