import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Building2, Users, GraduationCap } from "lucide-react"

export async function CenterPerformance() {
  // Get centers with their related data
  const centers = await prisma.centers.findMany({
    where: {
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      code: true,
      capacity: true,
      _count: {
        select: {
          students: true,
          enrollments: true,
        },
      },
    },
    take: 5,
    orderBy: {
      students: {
        _count: "desc",
      },
    },
  })

  const totalCenters = await prisma.centers.count({
    where: { status: "ACTIVE" },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Center Performance</CardTitle>
        <CardDescription>Top performing centers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Active Centers</span>
            </div>
            <span className="text-lg font-bold">{totalCenters}</span>
          </div>

          <div className="space-y-3">
            {centers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No centers available
              </p>
            ) : (
              centers.map((center, index) => {
                const utilization = center.capacity 
                  ? ((center._count.students / center.capacity) * 100).toFixed(0)
                  : "0"

                return (
                  <div key={center.id} className="space-y-2 p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{center.name}</p>
                          <p className="text-xs text-muted-foreground">{center.code}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="flex items-center space-x-2 text-xs">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Students:</span>
                        <span className="font-medium">{center._count.students}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <GraduationCap className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Enrollments:</span>
                        <span className="font-medium">{center._count.enrollments}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Utilization</span>
                        <span className="font-medium">{utilization}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${Math.min(parseInt(utilization), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
