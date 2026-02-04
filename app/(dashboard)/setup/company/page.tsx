import { requireAuth } from "@/lib/session"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import prisma from "@/lib/prisma"
import { CompanyInfoForm } from "@/components/setup/company-info-form"

export const metadata = {
  title: "Company Information",
  description: "Manage company details and settings.",
}

export default async function CompanyInfoPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "manage_setup")) {
    return redirect("/auth/unauthorized")
  }

  const companyInfo = await prisma.company_info.findFirst({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Information</h1>
        <p className="text-muted-foreground">
          Manage your company details, logo, and business information
        </p>
      </div>
      <CompanyInfoForm initialData={companyInfo} />
    </div>
  )
}
