import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VarianceAnalysis } from "@/components/finance/variance-analysis"
import { BudgetUtilizationChart } from "@/components/finance/budget-utilization-chart"
import { BudgetAlerts } from "@/components/finance/budget-alerts"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

export default function BudgetReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Reports & Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive budget tracking, variance analysis, and performance insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <BudgetAlerts />

      <Tabs defaultValue="variance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
          <TabsTrigger value="utilization">Budget Utilization</TabsTrigger>
          <TabsTrigger value="trends">Budget Trends</TabsTrigger>
          <TabsTrigger value="comparison">Period Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="variance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual Variance Analysis</CardTitle>
              <CardDescription>
                Detailed variance analysis showing budget deviations across all cost centers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VarianceAnalysis />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utilization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Utilization Dashboard</CardTitle>
              <CardDescription>
                Visual representation of budget utilization across departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BudgetUtilizationChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Trends Analysis</CardTitle>
              <CardDescription>
                Historical trends and patterns in budget allocation and spending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Budget trends visualization coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Period Comparison</CardTitle>
              <CardDescription>
                Compare budget performance across different fiscal periods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Period comparison coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
