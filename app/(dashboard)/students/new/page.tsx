import { StudentForm } from "@/components/students/student-form"
import { requireAuth } from "@/lib/session"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import prisma from "@/lib/prisma"

export const metadata = {
  title: "Add New Student",
  description: "Create a new student record in the system.",
}

export default async function AddStudentPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "create_students")) {
    return redirect("/auth/unauthorized")
  }

  const centers = await prisma.centers.findMany({
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
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
        <p className="text-muted-foreground">
          Fill in the details to create a new student record.
        </p>
      </div>
      <StudentForm centers={centers} />
    </div>
  )
}
