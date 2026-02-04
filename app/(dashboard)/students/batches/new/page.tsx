import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import prisma from "@/lib/prisma"
import { BatchForm } from "@/components/students/batch-form"

export default async function NewBatchPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "create_batches")) {
    return redirect("/auth/unauthorized")
  }

  // Fetch courses, centers, and instructors for the form
  const [courses, centers, instructors] = await Promise.all([
    prisma.courses.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, code: true, name: true, duration: true, fees: true },
      orderBy: { name: "asc" },
    }),
    prisma.centers.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, code: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.employees.findMany({
      where: { employmentStatus: "ACTIVE" },
      select: {
        id: true,
        employeeCode: true,
        designation: true,
        users: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/students/batches">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Batch</h1>
          <p className="text-muted-foreground">
            Set up a new training batch for students
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Batch Details</CardTitle>
          <CardDescription>
            Configure batch settings including course, schedule, and capacity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BatchForm courses={courses} centers={centers} instructors={instructors} />
        </CardContent>
      </Card>
    </div>
  )
}
