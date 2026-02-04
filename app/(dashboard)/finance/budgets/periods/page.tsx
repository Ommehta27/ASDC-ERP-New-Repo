import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BudgetPeriodsTable } from "@/components/finance/budget-periods-table"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function BudgetPeriodsPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Budget Periods</h1>
            <p className="text-muted-foreground mt-1">
              Manage fiscal years and budget planning periods
            </p>
          </div>
        </div>
        <Link href="/finance/budgets/periods/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Period
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget Planning Periods</CardTitle>
          <CardDescription>
            Define fiscal years and planning periods for budget allocation and tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetPeriodsTable />
        </CardContent>
      </Card>
    </div>
  )
}
