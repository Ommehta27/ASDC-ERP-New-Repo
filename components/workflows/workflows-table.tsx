"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Eye, Play, Pause, Trash2, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Workflow {
  id: string
  name: string
  trigger: string
  status: string
  isActive: boolean
  totalRuns: number
  successRuns: number
  lastRun: string | null
  createdAt: string
}

export function WorkflowsTable() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch workflows from API
    setLoading(false)
    setWorkflows([])
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (workflows.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          No workflows found. Create your first workflow to get started.
        </p>
        <Link href="/workflows/new">
          <Button>Create Workflow</Button>
        </Link>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default"
      case "DRAFT":
        return "secondary"
      case "PAUSED":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getTriggerBadge = (trigger: string) => {
    const triggers: Record<string, { label: string; color: string }> = {
      MANUAL: { label: "Manual", color: "bg-gray-100 text-gray-800" },
      SCHEDULE: { label: "Schedule", color: "bg-blue-100 text-blue-800" },
      WEBHOOK: { label: "Webhook", color: "bg-purple-100 text-purple-800" },
      NEW_STUDENT: { label: "New Student", color: "bg-green-100 text-green-800" },
      NEW_INQUIRY: { label: "New Inquiry", color: "bg-yellow-100 text-yellow-800" },
      FORM_SUBMISSION: { label: "Form", color: "bg-orange-100 text-orange-800" },
    }
    
    const config = triggers[trigger] || { label: trigger, color: "bg-gray-100 text-gray-800" }
    return <span className={`px-2 py-1 rounded-md text-xs font-medium ${config.color}`}>{config.label}</span>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Trigger</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total Runs</TableHead>
            <TableHead className="text-right">Success Rate</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workflows.map((workflow) => {
            const successRate = workflow.totalRuns > 0 
              ? ((workflow.successRuns / workflow.totalRuns) * 100).toFixed(1) 
              : '0'
            
            return (
              <TableRow key={workflow.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${workflow.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                    {workflow.name}
                  </div>
                </TableCell>
                <TableCell>{getTriggerBadge(workflow.trigger)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(workflow.status)}>
                    {workflow.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{workflow.totalRuns}</TableCell>
                <TableCell className="text-right">
                  <span className={workflow.totalRuns > 0 && parseFloat(successRate) >= 90 ? 'text-green-600 font-medium' : ''}>
                    {successRate}%
                  </span>
                </TableCell>
                <TableCell>
                  {workflow.lastRun ? formatDate(workflow.lastRun) : 'Never'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        {workflow.isActive ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Play className="mr-2 h-4 w-4" />
                        Run Now
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
