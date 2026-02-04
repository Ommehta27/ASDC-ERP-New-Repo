import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export async function RecentInquiries() {
  const inquiries = await prisma.inquiries.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      students: {
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
  })

  if (inquiries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Inquiries</CardTitle>
          <CardDescription>Latest student inquiries</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No inquiries yet</p>
        </CardContent>
      </Card>
    )
  }

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-500",
    FOLLOW_UP: "bg-yellow-500",
    QUALIFIED: "bg-green-500",
    CONVERTED: "bg-purple-500",
    LOST: "bg-red-500",
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Inquiries</CardTitle>
            <CardDescription>Latest student inquiries</CardDescription>
          </div>
          <Link href="/inquiries">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="flex items-center justify-between border-b pb-3 last:border-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {inquiry.students?.users?.firstName} {inquiry.students?.users?.lastName}
                  </p>
                  <Badge variant="secondary" className={statusColors[inquiry.status] || "bg-gray-500"}>
                    {inquiry.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {inquiry.inquiryNumber} • {formatDate(inquiry.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
