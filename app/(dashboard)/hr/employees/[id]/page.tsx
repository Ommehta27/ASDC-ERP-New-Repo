import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate, formatCurrency } from "@/lib/utils"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building2,
  DollarSign,
  FileText,
  Clock,
  Award,
  Package,
  BookOpen,
} from "lucide-react"

interface EmployeeDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const { id } = await params
  const user = await requireAuth()

  if (!hasPermission(user.role, "view_employee_profile")) {
    return redirect("/auth/unauthorized")
  }

  const employee = await prisma.employees.findUnique({
    where: { id },
    include: {
      users: true,
      centers: true,
      employees: {
        include: {
          users: true,
        },
      },
      employee_documents: {
        orderBy: { createdAt: "desc" },
      },
      leave_balances: {
        include: {
          leave_types: true,
        },
        where: {
          year: new Date().getFullYear(),
        },
      },
      attendance: {
        orderBy: { date: "desc" },
        take: 10,
      },
      performance_reviews: {
        orderBy: { reviewPeriodEnd: "desc" },
        take: 5,
      },
      employee_training: {
        include: {
          training_programs: true,
        },
        orderBy: { enrolledDate: "desc" },
      },
      employee_assets: {
        where: {
          status: "ASSIGNED",
        },
      },
      salary_structures: {
        where: {
          isActive: true,
        },
        include: {
          salary_components: true,
        },
      },
      payroll: {
        orderBy: [
          { year: "desc" },
          { month: "desc" },
        ],
        take: 6,
      },
    },
  })

  if (!employee) {
    notFound()
  }

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-500",
    INACTIVE: "bg-gray-500",
    ON_LEAVE: "bg-yellow-500",
    TERMINATED: "bg-red-500",
    RESIGNED: "bg-orange-500",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {employee.users.firstName} {employee.users.lastName}
          </h1>
          <p className="text-muted-foreground">{employee.designation}</p>
        </div>
        <Badge className={statusColors[employee.employmentStatus]}>
          {employee.employmentStatus}
        </Badge>
      </div>

      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Employee Code</p>
                <p className="font-medium">{employee.employeeCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{employee.users.email}</p>
                </div>
              </div>
              {employee.users.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{employee.users.phone}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {employee.dateOfBirth && (
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{formatDate(employee.dateOfBirth)}</p>
                  </div>
                </div>
              )}
              {employee.gender && (
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{employee.gender}</p>
                </div>
              )}
              {employee.bloodGroup && (
                <div>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <p className="font-medium">{employee.bloodGroup}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {employee.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="font-medium">{employee.address}</p>
                      {employee.city && employee.state && (
                        <p className="text-sm text-muted-foreground">
                          {employee.city}, {employee.state} - {employee.pincode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Employment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Designation</p>
              <p className="font-medium">{employee.designation}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{employee.department}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Employment Type</p>
              <Badge variant="outline">{employee.employmentType.replace("_", " ")}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Joining</p>
              <p className="font-medium">{formatDate(employee.dateOfJoining)}</p>
            </div>
            {employee.centers && (
              <div>
                <p className="text-sm text-muted-foreground">Primary Center</p>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{employee.centers.name}</p>
                </div>
              </div>
            )}
            {employee.employees && (
              <div>
                <p className="text-sm text-muted-foreground">Reporting Manager</p>
                <p className="font-medium">
                  {employee.employees.users.firstName} {employee.employees.users.lastName}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Additional Information */}
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents ({employee.employee_documents.length})
          </TabsTrigger>
          <TabsTrigger value="leave">
            <Calendar className="h-4 w-4 mr-2" />
            Leave Balance ({employee.leave_balances.length})
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <Clock className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Award className="h-4 w-4 mr-2" />
            Performance ({employee.performance_reviews.length})
          </TabsTrigger>
          <TabsTrigger value="training">
            <BookOpen className="h-4 w-4 mr-2" />
            Training ({employee.employee_training.length})
          </TabsTrigger>
          <TabsTrigger value="assets">
            <Package className="h-4 w-4 mr-2" />
            Assets ({employee.employee_assets.length})
          </TabsTrigger>
          <TabsTrigger value="salary">
            <DollarSign className="h-4 w-4 mr-2" />
            Salary
          </TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Employee Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {employee.employee_documents.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No documents uploaded</p>
              ) : (
                <div className="space-y-4">
                  {employee.employee_documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{doc.documentName}</p>
                        <p className="text-sm text-muted-foreground">{doc.documentType}</p>
                        {doc.expiryDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Expires: {formatDate(doc.expiryDate)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.isVerified && <Badge variant="outline" className="bg-green-500">Verified</Badge>}
                        <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer">
                          <Badge variant="secondary">View</Badge>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Balance Tab */}
        <TabsContent value="leave">
          <Card>
            <CardHeader>
              <CardTitle>Leave Balance - {new Date().getFullYear()}</CardTitle>
            </CardHeader>
            <CardContent>
              {employee.leave_balances.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No leave balance records</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employee.leave_balances.map((balance) => (
                    <div key={balance.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">{balance.leave_types.name}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Opening</p>
                          <p className="font-medium">{balance.opening} days</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Earned</p>
                          <p className="font-medium">{balance.earned} days</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Taken</p>
                          <p className="font-medium">{balance.taken} days</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Balance</p>
                          <p className="font-medium text-green-600">{balance.balance} days</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {employee.attendance.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No attendance records</p>
              ) : (
                <div className="space-y-2">
                  {employee.attendance.map((att) => (
                    <div key={att.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{formatDate(att.date)}</p>
                        <p className="text-sm text-muted-foreground">{att.status}</p>
                      </div>
                      <div className="text-right">
                        {att.checkIn && att.checkOut && (
                          <>
                            <p className="text-sm font-medium">
                              {att.checkIn.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - 
                              {att.checkOut.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {att.workHours && (
                              <p className="text-xs text-muted-foreground">{att.workHours.toFixed(2)} hrs</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {employee.performance_reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No performance reviews</p>
              ) : (
                <div className="space-y-4">
                  {employee.performance_reviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium">
                            {formatDate(review.reviewPeriodStart)} - {formatDate(review.reviewPeriodEnd)}
                          </p>
                          <Badge className="mt-1">{review.status}</Badge>
                        </div>
                        {review.overallRating && (
                          <Badge variant="outline" className="text-lg">
                            {review.overallRating.toFixed(1)}/5.0
                          </Badge>
                        )}
                      </div>
                      {review.achievements && (
                        <div className="mt-3">
                          <p className="text-sm font-medium">Achievements:</p>
                          <p className="text-sm text-muted-foreground mt-1">{review.achievements}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Training Programs</CardTitle>
            </CardHeader>
            <CardContent>
              {employee.employee_training.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No training records</p>
              ) : (
                <div className="space-y-4">
                  {employee.employee_training.map((training) => (
                    <div key={training.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{training.training_programs.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Enrolled: {formatDate(training.enrolledDate)}
                          </p>
                          {training.completedDate && (
                            <p className="text-sm text-green-600 mt-1">
                              Completed: {formatDate(training.completedDate)}
                            </p>
                          )}
                        </div>
                        <Badge>{training.status}</Badge>
                      </div>
                      {training.rating && (
                        <p className="text-sm mt-2">Rating: {training.rating}/5.0</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Assets</CardTitle>
            </CardHeader>
            <CardContent>
              {employee.employee_assets.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No assets assigned</p>
              ) : (
                <div className="space-y-4">
                  {employee.employee_assets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{asset.assetName}</p>
                        <p className="text-sm text-muted-foreground">{asset.assetType}</p>
                        {asset.assetCode && (
                          <p className="text-xs text-muted-foreground mt-1">Code: {asset.assetCode}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{asset.condition}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Assigned: {formatDate(asset.assignedDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salary Tab */}
        <TabsContent value="salary">
          <Card>
            <CardHeader>
              <CardTitle>Salary Structure</CardTitle>
            </CardHeader>
            <CardContent>
              {employee.salary_structures.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No salary structure defined</p>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Current Salary Components</h4>
                    {employee.salary_structures.map((structure) => (
                      <div key={structure.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{structure.salary_components.name}</p>
                          <p className="text-xs text-muted-foreground">{structure.salary_components.type}</p>
                        </div>
                        <p className="font-medium">{formatCurrency(structure.amount)}</p>
                      </div>
                    ))}
                  </div>

                  {employee.payroll.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Recent Payroll</h4>
                      {employee.payroll.map((payroll) => (
                        <div key={payroll.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <p className="font-medium">
                              {new Date(payroll.year, payroll.month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                            </p>
                            <Badge>{payroll.status}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Basic Salary</p>
                              <p className="font-medium">{formatCurrency(payroll.basicSalary)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Allowances</p>
                              <p className="font-medium">{formatCurrency(payroll.allowances)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Deductions</p>
                              <p className="font-medium text-red-600">{formatCurrency(payroll.deductions)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Net Salary</p>
                              <p className="font-medium text-green-600">{formatCurrency(payroll.netSalary)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
