import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExecutionsTable } from "@/components/workflows/executions-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ExecutionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workflow Executions</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and debug your workflow runs
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Executions</TabsTrigger>
          <TabsTrigger value="running">Running</TabsTrigger>
          <TabsTrigger value="success">Successful</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Executions</CardTitle>
              <CardDescription>Complete history of workflow runs</CardDescription>
            </CardHeader>
            <CardContent>
              <ExecutionsTable filter="all" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="running">
          <Card>
            <CardHeader>
              <CardTitle>Running Executions</CardTitle>
              <CardDescription>Currently executing workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <ExecutionsTable filter="running" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="success">
          <Card>
            <CardHeader>
              <CardTitle>Successful Executions</CardTitle>
              <CardDescription>Workflows that completed successfully</CardDescription>
            </CardHeader>
            <CardContent>
              <ExecutionsTable filter="success" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed">
          <Card>
            <CardHeader>
              <CardTitle>Failed Executions</CardTitle>
              <CardDescription>Workflows that encountered errors</CardDescription>
            </CardHeader>
            <CardContent>
              <ExecutionsTable filter="failed" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
