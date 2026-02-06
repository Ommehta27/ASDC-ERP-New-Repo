import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Edit, ArrowLeft, Download, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { requireAuth } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import prisma from "@/lib/prisma"

async function getBudget(id: string) {
  try {
    const budget = await prisma.budgets.findUnique({
      where: { id },
      include: {
        budget_periods: {
          select: {
            periodName: true,
            fiscalYear: true,
            startDate: true,
            endDate: true,
          },
        },
        cost_centers: {
          select: {
            centerCode: true,
            centerName: true,
          },
        },
        chart_of_accounts: {
          select: {
            accountCode: true,
            accountName: true,
          },
        },
        budget_allocations: {
          orderBy: [
            { year: "asc" },
            { month: "asc" },
          ],
        },
      },
    })

    if (!budget) return null

    // Calculate variance
    const variance = budget.totalAmount - budget.actualAmount
    const variancePercent = (variance / budget.totalAmount) * 100

    return {
      ...budget,
      variance,
      variancePercent,
    }
  } catch (error) {
    console.error("Error fetching budget:", error)
    return null
  }
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export default async function BudgetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()

  if (!hasPermission(user.role, "view_budgets")) {
    return redirect("/auth/unauthorized")
  }

  const { id } = await params
  const budget = await getBudget(id)

  if (!budget) {
    notFound()
  }

  const utilizationPercent = (budget.actualAmount / budget.totalAmount) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/finance/budgets">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{budget.budgetNumber}</h1>
            <p className="text-muted-foreground mt-1">{budget.budgetName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href={`/finance/budgets/${id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Budget
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(budget.totalAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {budget.budget_periods?.periodName || "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actual Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(budget.actualAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {utilizationPercent.toFixed(1)}% utilized
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(budget.totalAmount - budget.actualAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((budget.totalAmount - budget.actualAmount) / budget.totalAmount * 100).toFixed(1)}% remaining
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Variance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${budget.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(budget.variance))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.abs(budget.variancePercent).toFixed(1)}% {budget.variance >= 0 ? 'favorable' : 'unfavorable'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Budget Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget Type</p>
                <Badge variant="outline" className="mt-1">{budget.budgetType}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className="mt-1">{budget.status}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cost Center</p>
                <p className="mt-1">{budget.cost_centers ? `${budget.cost_centers.centerCode} - ${budget.cost_centers.centerName}` : "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account</p>
                <p className="mt-1">{budget.chart_of_accounts ? `${budget.chart_of_accounts.accountCode} - ${budget.chart_of_accounts.accountName}` : "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                <p className="mt-1">{formatDate(budget.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="mt-1">{formatDate(budget.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span className="font-medium">{utilizationPercent.toFixed(1)}%</span>
              </div>
              <Progress value={utilizationPercent} className="h-3" />
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Allocated</span>
                <span className="font-medium">{formatCurrency(budget.allocatedAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Committed</span>
                <span className="font-medium text-orange-600">{formatCurrency(budget.committedAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Actual Spent</span>
                <span className="font-medium text-blue-600">{formatCurrency(budget.actualAmount)}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="font-medium">Available Balance</span>
                <span className="font-bold text-green-600">{formatCurrency(budget.totalAmount - budget.actualAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="allocations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="allocations">Monthly Allocations</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="allocations">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Budget Allocations</CardTitle>
              <CardDescription>Budget allocation and spending by month</CardDescription>
            </CardHeader>
            <CardContent>
              {budget.budget_allocations && budget.budget_allocations.length > 0 ? (
                <div className="space-y-4">
                  {budget.budget_allocations.map((allocation: any, index: number) => {
                    const variance = allocation.allocatedAmount - allocation.actualAmount
                    return (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex-1">
                          <p className="font-medium">{months[allocation.month - 1]} {allocation.year}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-muted-foreground">
                              Allocated: <span className="font-medium text-foreground">{formatCurrency(allocation.allocatedAmount)}</span>
                            </span>
                            <span className="text-muted-foreground">
                              Actual: <span className="font-medium text-foreground">{formatCurrency(allocation.actualAmount)}</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                          </p>
                          <p className="text-xs text-muted-foreground">variance</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No monthly allocations configured
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Budget Transactions</CardTitle>
              <CardDescription>All transactions affecting this budget</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No transactions recorded yet
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Budget Notes</CardTitle>
              <CardDescription>Additional information and justification</CardDescription>
            </CardHeader>
            <CardContent>
              {budget.notes ? (
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{budget.notes}</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No notes available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
