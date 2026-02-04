import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Briefcase, TrendingUp, IndianRupee } from "lucide-react"

export async function PlacementChart() {
  // Get placement statistics
  const placements = await prisma.placements.findMany({
    select: {
      status: true,
      salary: true,
      placedAt: true,
    },
  })

  const totalPlacements = placements.length
  const placedStudents = placements.filter(p => p.status === "PLACED").length
  const inProgressPlacements = placements.filter(p => p.status === "IN_PROGRESS").length
  
  // Calculate average salary (for placed students)
  const placedSalaries = placements
    .filter(p => p.status === "PLACED" && p.salary)
    .map(p => p.salary!)
  
  const averageSalary = placedSalaries.length > 0
    ? placedSalaries.reduce((sum, salary) => sum + salary, 0) / placedSalaries.length
    : 0

  // Calculate placement rate
  const totalStudents = await prisma.students.count({
    where: {
      status: {
        notIn: ["INQUIRY"],
      },
    },
  })
  
  const placementRate = totalStudents > 0 
    ? ((placedStudents / totalStudents) * 100).toFixed(1)
    : "0.0"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Placement Overview</CardTitle>
        <CardDescription>Student placement statistics and insights</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-4 p-4 rounded-lg border bg-green-50">
              <div className="p-2 rounded-full bg-green-500/10">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{placedStudents}</p>
                <p className="text-xs text-green-600">Successfully Placed</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 rounded-lg border bg-orange-50">
              <div className="p-2 rounded-full bg-orange-500/10">
                <Briefcase className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-700">{inProgressPlacements}</p>
                <p className="text-xs text-orange-600">In Progress</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-blue-50">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Placement Rate</p>
                  <p className="text-xs text-blue-600">Overall success rate</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-700">{placementRate}%</p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-purple-50">
              <div className="flex items-center space-x-3">
                <IndianRupee className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Average Salary</p>
                  <p className="text-xs text-purple-600">Mean placement package</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-700">
                {averageSalary > 0 
                  ? `₹${(averageSalary / 100000).toFixed(1)}L`
                  : "-"}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Total placement records: <span className="font-medium">{totalPlacements}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
