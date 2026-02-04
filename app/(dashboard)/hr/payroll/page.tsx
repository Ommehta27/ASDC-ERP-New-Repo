import { Suspense } from "react"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { PayrollTable } from "@/components/hr/payroll-table"
import { PayrollStats } from "@/components/hr/payroll-stats"

export default async function PayrollPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "view_payroll")) {
    return redirect("/auth/unauthorized")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">
            Process and manage employee payroll
          </p>
        </div>
        {hasPermission(user.role, "process_payroll") && (
          <Link href="/hr/payroll/process">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Process Payroll
            </Button>
          </Link>
        )}
      </div>

      <Suspense fallback={<Skeleton className="h-32" />}>
        <PayrollStats />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-96" />}>
        <PayrollTable />
      </Suspense>
    </div>
  )
}
