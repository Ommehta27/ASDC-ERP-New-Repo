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
import { Users } from "lucide-react"

export async function TrainingProgramsTable() {
  const programs = await prisma.training_programs.findMany({
    include: {
      employee_training: {
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
      },
    },
    orderBy: {
      startDate: "desc",
    },
  })

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-blue-500",
    IN_PROGRESS: "bg-yellow-500",
    COMPLETED: "bg-green-500",
    CANCELLED: "bg-red-500",
    POSTPONED: "bg-orange-500",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Programs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No training programs found
                  </TableCell>
                </TableRow>
              ) : (
                programs.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{program.title}</p>
                        {program.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{program.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{program.trainer || "-"}</TableCell>
                    <TableCell>
                      {program.duration} {program.durationType}
                    </TableCell>
                    <TableCell>{formatDate(program.startDate)}</TableCell>
                    <TableCell>{formatDate(program.endDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{program.currentParticipants}</span>
                        {program.maxParticipants && (
                          <span className="text-muted-foreground">/ {program.maxParticipants}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{program.location || "Online"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[program.status]}>
                        {program.status}
                      </Badge>
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
