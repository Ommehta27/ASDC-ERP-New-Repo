import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiConnectionsGrid } from "@/components/workflows/api-connections-grid"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function ApiConnectionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Connections</h1>
          <p className="text-muted-foreground mt-1">
            Connect WhatsApp, Meta, Google, and other services to power your workflows
          </p>
        </div>
        <Link href="/workflows/connections/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Connection
          </Button>
        </Link>
      </div>

      <ApiConnectionsGrid />
    </div>
  )
}
