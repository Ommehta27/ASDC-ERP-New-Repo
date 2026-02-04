import { Suspense } from "react"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { TrainingProgramsTable } from "@/components/hr/training-programs-table"

export default async function TrainingPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "view_training")) {
    return redirect("/auth/unauthorized")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training & Development</h1>
          <p className="text-muted-foreground">
            Manage training programs and employee enrollments
          </p>
        </div>
        {hasPermission(user.role, "create_training") && (
          <Link href="/hr/training/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Training Program
            </Button>
          </Link>
        )}
      </div>

      <Suspense fallback={<Skeleton className="h-96" />}>
        <TrainingProgramsTable />
      </Suspense>
    </div>
  )
}
