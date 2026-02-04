import { Suspense } from "react"
import { requireAuth } from "@/lib/session"
import { CentersGrid } from "@/components/centers/centers-grid"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"

export default async function CentersPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "view_centers")) {
    return redirect("/auth/unauthorized")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centers</h1>
          <p className="text-muted-foreground">
            Manage training centers and locations
          </p>
        </div>
        {hasPermission(user.role, "create_centers") && (
          <Link href="/centers/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Center
            </Button>
          </Link>
        )}
      </div>

      <Suspense fallback={<Skeleton className="h-96" />}>
        <CentersGrid />
      </Suspense>
    </div>
  )
}
