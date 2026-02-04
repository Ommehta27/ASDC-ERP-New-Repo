import { CourseForm } from "@/components/courses/course-form"
import { requireAuth } from "@/lib/session"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import prisma from "@/lib/prisma"

export const metadata = {
  title: "Add New Course",
  description: "Create a new course in the system.",
}

export default async function AddCoursePage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "create_courses")) {
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
        <h1 className="text-3xl font-bold tracking-tight">Add New Course</h1>
        <p className="text-muted-foreground">
          Fill in the details to create a new course.
        </p>
      </div>
      <CourseForm centers={centers} />
    </div>
  )
}
