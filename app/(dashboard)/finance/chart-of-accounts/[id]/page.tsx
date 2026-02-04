import { Suspense } from "react"
import { requireAuth } from "@/lib/session"
import { ChartOfAccountsForm } from "@/components/finance/chart-of-accounts-form"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function EditChartOfAccountPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireAuth()

  if (!hasPermission(user.role, "manage_finance")) {
    return redirect("/auth/unauthorized")
  }

  const { id } = await params

  const account = await prisma.chart_of_accounts.findUnique({
    where: { id },
  })

  if (!account) {
    notFound()
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
          <h1 className="text-3xl font-bold tracking-tight">Edit Account</h1>
          <p className="text-muted-foreground">
            {account.accountCode} - {account.accountName}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>
            Update account settings including tax, budget, and controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartOfAccountsForm initialData={account} />
        </CardContent>
      </Card>
    </div>
  )
}
