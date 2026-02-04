import { CenterForm } from "@/components/centers/center-form"
import { requireAuth } from "@/lib/session"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"

export const metadata = {
  title: "Add New Center",
  description: "Create a new training center in the system.",
}

export default async function AddCenterPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "create_centers")) {
    return redirect("/auth/unauthorized")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Center</h1>
        <p className="text-muted-foreground">
          Fill in the details to create a new training center.
        </p>
      </div>
      <CenterForm />
    </div>
  )
}
