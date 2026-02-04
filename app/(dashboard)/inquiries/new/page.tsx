import { InquiryForm } from "@/components/inquiries/inquiry-form"
import { requireAuth } from "@/lib/session"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import prisma from "@/lib/prisma"

export const metadata = {
  title: "Add New Inquiry",
  description: "Create a new student inquiry in the system.",
}

export default async function AddInquiryPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "create_students")) {
    return redirect("/auth/unauthorized")
  }

  const [centers, courses] = await Promise.all([
    prisma.centers.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.courses.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Inquiry</h1>
        <p className="text-muted-foreground">
          Fill in the details to create a new student inquiry.
        </p>
      </div>
      <InquiryForm centers={centers} courses={courses} />
    </div>
  )
}
