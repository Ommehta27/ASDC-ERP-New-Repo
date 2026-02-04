import { Suspense } from "react"
import { requireAuth } from "@/lib/session"
import { InquiriesTable } from "@/components/inquiries/inquiries-table"
import { InquiryQRDialog } from "@/components/inquiries/inquiry-qr-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"

export default async function InquiriesPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "view_students")) {
    return redirect("/auth/unauthorized")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inquiries</h1>
          <p className="text-sm text-muted-foreground">
            Manage student inquiries and conversions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <InquiryQRDialog />
          {hasPermission(user.role, "create_students") && (
            <Link href="/inquiries/new" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Inquiry
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-96" />}>
        <InquiriesTable />
      </Suspense>
    </div>
  )
}
