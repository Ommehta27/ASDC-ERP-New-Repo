import { EnrollmentForm } from "@/components/enrollments/enrollment-form"
import { requireAuth } from "@/lib/session"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import prisma from "@/lib/prisma"

export const metadata = {
  title: "Add New Enrollment",
  description: "Create a new student enrollment in the system.",
}

export default async function AddEnrollmentPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "create_students")) {
    return redirect("/auth/unauthorized")
  }

  const [students, courses, batches, centers] = await Promise.all([
    prisma.students.findMany({
      where: {
        status: {
          not: "INQUIRY",
        },
      },
      select: {
        id: true,
        studentId: true,
        users: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
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
        fees: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.batches.findMany({
      select: {
        id: true,
        code: true,
        startDate: true,
        endDate: true,
      },
      orderBy: {
        startDate: "desc",
      },
    }),
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
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Enrollment</h1>
        <p className="text-muted-foreground">
          Fill in the details to create a new enrollment record.
        </p>
      </div>
      <EnrollmentForm students={students} courses={courses} batches={batches} centers={centers} />
    </div>
  )
}
