import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BudgetsTable } from "@/components/finance/budgets-table"
import { BudgetStats } from "@/components/finance/budget-stats"
import { Button } from "@/components/ui/button"
import { Plus, Calendar } from "lucide-react"
import Link from "next/link"

export default function BudgetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Management</h1>
          <p className="text-muted-foreground mt-1">
            Plan, allocate, and monitor budgets across your organization
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/finance/budgets/periods">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Budget Periods
            </Button>
          </Link>
          <Link href="/finance/budgets/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Budget
            </Button>
          </Link>
        </div>
      </div>

      <BudgetStats />

      <Card>
        <CardHeader>
          <CardTitle>Active Budgets</CardTitle>
          <CardDescription>
            View and manage all budget allocations for the current fiscal year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetsTable />
        </CardContent>
      </Card>
    </div>
  )
}
