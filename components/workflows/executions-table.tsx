"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, RefreshCw, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Execution {
  id: string
  workflowName: string
  status: string
  startedAt: string
  completedAt: string | null
  duration: number | null
  errorMessage: string | null
}

interface ExecutionsTableProps {
  filter: "all" | "running" | "success" | "failed"
}

export function ExecutionsTable({ filter }: ExecutionsTableProps) {
  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch executions from API
    setLoading(false)
    setExecutions([])
  }, [filter])

  if (loading) {
    return <div>Loading...</div>
  }

  if (executions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No executions found for this filter.
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <Badge className="bg-green-500">Success</Badge>
      case "FAILED":
        return <Badge className="bg-red-500">Failed</Badge>
      case "RUNNING":
        return <Badge className="bg-blue-500">Running</Badge>
      case "CANCELLED":
        return <Badge variant="outline">Cancelled</Badge>
      case "TIMEOUT":
        return <Badge className="bg-orange-500">Timeout</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDuration = (ms: number | null) => {
    if (!ms) return "-"
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Workflow</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead className="text-right">Duration</TableHead>
            <TableHead>Error</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {executions.map((execution) => (
            <TableRow key={execution.id}>
              <TableCell className="font-medium">{execution.workflowName}</TableCell>
              <TableCell>{getStatusBadge(execution.status)}</TableCell>
              <TableCell>{formatDate(execution.startedAt)}</TableCell>
              <TableCell>
                {execution.completedAt ? formatDate(execution.completedAt) : "-"}
              </TableCell>
              <TableCell className="text-right">
                {formatDuration(execution.duration)}
              </TableCell>
              <TableCell>
                {execution.errorMessage ? (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm truncate max-w-xs">{execution.errorMessage}</span>
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {execution.status === "FAILED" && (
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
