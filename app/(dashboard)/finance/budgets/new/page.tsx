import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BudgetForm } from "@/components/finance/budget-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewBudgetPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/finance/budgets">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Budget</h1>
          <p className="text-muted-foreground mt-1">
            Define a new budget allocation for a fiscal period
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget Details</CardTitle>
          <CardDescription>
            Enter budget information, allocation details, and monthly breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetForm />
        </CardContent>
      </Card>
    </div>
  )
}
