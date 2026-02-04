import prisma from "@/lib/prisma"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Star } from "lucide-react"

export async function PerformanceReviewsTable() {
  const reviews = await prisma.performance_reviews.findMany({
    include: {
      employees: {
        include: {
          users: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: {
      reviewPeriodEnd: "desc",
    },
    take: 50,
  })

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-500",
    SUBMITTED: "bg-blue-500",
    UNDER_REVIEW: "bg-yellow-500",
    COMPLETED: "bg-green-500",
    ARCHIVED: "bg-purple-500",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Review Period</TableHead>
                <TableHead>Overall Rating</TableHead>
                <TableHead>Technical Skills</TableHead>
                <TableHead>Communication</TableHead>
                <TableHead>Teamwork</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reviewed On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No performance reviews found
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {review.employees.users.firstName} {review.employees.users.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{review.employees.employeeCode}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDate(review.reviewPeriodStart)}</p>
                        <p className="text-muted-foreground">to {formatDate(review.reviewPeriodEnd)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {review.overallRating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="font-medium">{review.overallRating.toFixed(1)}/5.0</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {review.technicalSkills ? (
                        <span>{review.technicalSkills.toFixed(1)}/5.0</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {review.communication ? (
                        <span>{review.communication.toFixed(1)}/5.0</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {review.teamwork ? (
                        <span>{review.teamwork.toFixed(1)}/5.0</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[review.status]}>
                        {review.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {review.reviewedDate ? formatDate(review.reviewedDate) : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
