import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TemplatesGrid } from "@/components/workflows/templates-grid"

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workflow Templates</h1>
        <p className="text-muted-foreground mt-1">
          Pre-built automation templates to get started quickly
        </p>
      </div>

      <TemplatesGrid />
    </div>
  )
}
