import { Suspense } from "react"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { OnboardingTable } from "@/components/hr/onboarding-table"

export default async function OnboardingPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "view_onboarding")) {
    return redirect("/auth/unauthorized")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employee Onboarding</h1>
        <p className="text-muted-foreground">
          Track new hire onboarding progress and tasks
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-96" />}>
        <OnboardingTable />
      </Suspense>
    </div>
  )
}
