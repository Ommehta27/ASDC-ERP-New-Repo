import { Suspense } from "react"
import { requireAuth } from "@/lib/session"
import { ChartOfAccountsForm } from "@/components/finance/chart-of-accounts-form"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function NewChartOfAccountPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "manage_finance")) {
    return redirect("/auth/unauthorized")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/finance/chart-of-accounts">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Account</h1>
          <p className="text-muted-foreground">
            Add a new account to your chart of accounts
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>
            Configure all account settings including tax, budget, and controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartOfAccountsForm />
        </CardContent>
      </Card>
    </div>
  )
}
