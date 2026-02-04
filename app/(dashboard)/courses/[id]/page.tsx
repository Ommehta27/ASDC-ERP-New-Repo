import { notFound, redirect } from "next/navigation"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  BookOpen, 
  Clock, 
  DollarSign, 
  Users, 
  MapPin, 
  Calendar,
  GraduationCap,
  FileText,
  CheckCircle2,
  Edit,
  Trash2,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

interface CourseDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const user = await requireAuth()

  if (!hasPermission(user.role, "view_courses")) {
    return redirect("/auth/unauthorized")
  }

  const { id } = await params

  const course = await prisma.courses.findUnique({
    where: {
      id,
    },
    include: {
      centers: {
        select: {
          id: true,
          name: true,
          code: true,
          city: true,
        },
      },
      batches: {
        select: {
          id: true,
          code: true,
          startDate: true,
          endDate: true,
          currentStrength: true,
          maxCapacity: true,
        },
        orderBy: {
          startDate: "desc",
        },
      },
      enrollments: {
        select: {
          id: true,
          enrollmentNumber: true,
          enrollmentDate: true,
          status: true,
          students: {
            select: {
              id: true,
              studentId: true,
              users: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          enrollmentDate: "desc",
        },
        take: 10,
      },
      _count: {
        select: {
          enrollments: true,
          batches: true,
        },
      },
    },
  })

  if (!course) {
    notFound()
  }

  const difficultyColors: Record<string, string> = {
    BEGINNER: "bg-green-500 text-white",
    INTERMEDIATE: "bg-yellow-500 text-white",
    ADVANCED: "bg-orange-500 text-white",
    EXPERT: "bg-red-500 text-white",
  }

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-500 text-white",
    INACTIVE: "bg-gray-500 text-white",
    DRAFT: "bg-blue-500 text-white",
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/courses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{course.name}</h1>
              <Badge className={statusColors[course.status]}>{course.status}</Badge>
              <Badge className={difficultyColors[course.difficulty]}>{course.difficulty}</Badge>
            </div>
            <p className="text-lg text-muted-foreground">{course.code}</p>
          </div>
          
          {hasPermission(user.role, "edit_courses") && (
            <div className="flex gap-2">
              <Link href={`/courses/${course.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              {hasPermission(user.role, "delete_courses") && (
                <Button variant="outline" size="sm" className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.duration}</div>
            <p className="text-xs text-muted-foreground">hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{course.fees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">per student</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course._count.enrollments}</div>
            <p className="text-xs text-muted-foreground">students enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course._count.batches}</div>
            <p className="text-xs text-muted-foreground">batches running</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {course.description || "No description available"}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Category</h3>
                  <p className="text-muted-foreground">{course.category}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Difficulty Level</h3>
                  <Badge className={difficultyColors[course.difficulty]}>
                    {course.difficulty}
                  </Badge>
                </div>
              </div>

              {course.prerequisites && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Prerequisites</h3>
                    <p className="text-muted-foreground">{course.prerequisites}</p>
                  </div>
                </>
              )}

              {course.centers && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Associated Center
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {course.centers.name} ({course.centers.code})
                      </Badge>
                      {course.centers.city && (
                        <span className="text-sm text-muted-foreground">
                          • {course.centers.city}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold mb-1">Created</h3>
                  <p className="text-muted-foreground">{formatDate(course.createdAt)}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Last Updated</h3>
                  <p className="text-muted-foreground">{formatDate(course.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Enrollments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Enrollments
              </CardTitle>
              <CardDescription>Last 10 students enrolled in this course</CardDescription>
            </CardHeader>
            <CardContent>
              {course.enrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No enrollments yet
                </p>
              ) : (
                <div className="space-y-3">
                  {course.enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {enrollment.students.users.firstName} {enrollment.students.users.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {enrollment.enrollmentNumber} • {enrollment.students.users.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={enrollment.status === "ACTIVE" ? "default" : "secondary"}
                          className="mb-1"
                        >
                          {enrollment.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(enrollment.enrollmentDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {course._count.enrollments > 10 && (
                    <Link href={`/enrollments?courseId=${course.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View All Enrollments ({course._count.enrollments})
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Batches Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Batches
              </CardTitle>
              <CardDescription>Active batches for this course</CardDescription>
            </CardHeader>
            <CardContent>
              {course.batches.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No batches created yet
                </p>
              ) : (
                <div className="space-y-3">
                  {course.batches.map((batch) => (
                    <div
                      key={batch.id}
                      className="p-3 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{batch.code}</p>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>
                            {batch.currentStrength} / {batch.maxCapacity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {hasPermission(user.role, "create_enrollments") && (
                <Link href={`/enrollments/new?courseId=${course.id}`}>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Enroll Student
                  </Button>
                </Link>
              )}
              <Link href={`/batches?courseId=${course.id}`}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  View All Batches
                </Button>
              </Link>
              <Link href={`/enrollments?courseId=${course.id}`}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  View All Students
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
