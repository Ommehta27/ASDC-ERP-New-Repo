"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  GitBranch,
  Plus,
  Edit,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ApprovalHierarchy {
  id: string
  name: string
  description: string | null
  entityType: string
  isActive: boolean
  isDefault: boolean
  createdAt: string
  approval_levels: any[]
  _count: {
    approval_requests: number
  }
}

export default function ApprovalHierarchiesPage() {
  const [hierarchies, setHierarchies] = useState<ApprovalHierarchy[]>([])
  const [loading, setLoading] = useState(true)
  const [entityFilter, setEntityFilter] = useState<string>("ALL")

  const fetchHierarchies = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (entityFilter && entityFilter !== "ALL") params.append("entityType", entityFilter)

      const res = await fetch(`/api/setup/approval-hierarchies?${params.toString()}`)
      const data = await res.json()
      
      // Ensure data is an array before setting
      if (Array.isArray(data)) {
        setHierarchies(data)
      } else {
        console.error("API returned non-array data:", data)
        setHierarchies([])
        toast.error(data.error || "Failed to fetch approval hierarchies")
      }
    } catch (error) {
      console.error("Error fetching hierarchies:", error)
      setHierarchies([])
      toast.error("Failed to fetch approval hierarchies")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHierarchies()
  }, [entityFilter])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this approval hierarchy?")) {
      return
    }

    try {
      const res = await fetch(`/api/setup/approval-hierarchies/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Approval hierarchy deleted successfully")
        fetchHierarchies()
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to delete hierarchy")
      }
    } catch (error) {
      console.error("Error deleting hierarchy:", error)
      toast.error("Failed to delete hierarchy")
    }
  }

  const getEntityTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      PURCHASE_ORDER: "bg-blue-100 text-blue-800",
      BUDGET: "bg-green-100 text-green-800",
      BUDGET_PERIOD: "bg-purple-100 text-purple-800",
      PURCHASE: "bg-orange-100 text-orange-800",
      EXPENSE: "bg-red-100 text-red-800",
      LEAVE_APPLICATION: "bg-cyan-100 text-cyan-800",
      SALARY_REVISION: "bg-pink-100 text-pink-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approval Hierarchies</h1>
          <p className="text-muted-foreground mt-1">
            Configure custom approval workflows for different operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchHierarchies}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/setup/approval-hierarchies/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Hierarchy
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Hierarchies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hierarchies.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Hierarchies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {hierarchies.filter(h => h.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entity Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(hierarchies.map(h => h.entityType)).size}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hierarchies.reduce((sum, h) => sum + h._count.approval_requests, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filter by Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Entity Types</SelectItem>
                <SelectItem value="PURCHASE_ORDER">Purchase Orders</SelectItem>
                <SelectItem value="BUDGET">Budgets</SelectItem>
                <SelectItem value="BUDGET_PERIOD">Budget Periods</SelectItem>
                <SelectItem value="PURCHASE">Purchases</SelectItem>
                <SelectItem value="EXPENSE">Expenses</SelectItem>
                <SelectItem value="LEAVE_APPLICATION">Leave Applications</SelectItem>
                <SelectItem value="SALARY_REVISION">Salary Revisions</SelectItem>
                <SelectItem value="ASSET_ALLOCATION">Asset Allocations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Hierarchies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Hierarchies</CardTitle>
          <CardDescription>
            Manage approval workflows for various operations in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : hierarchies.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No approval hierarchies found</p>
              <Link href="/setup/approval-hierarchies/new">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Hierarchy
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Levels</TableHead>
                    <TableHead>Requests</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hierarchies.map((hierarchy) => (
                    <TableRow key={hierarchy.id}>
                      <TableCell>
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {hierarchy.name}
                            {hierarchy.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                          {hierarchy.description && (
                            <div className="text-sm text-muted-foreground">
                              {hierarchy.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getEntityTypeBadge(hierarchy.entityType)}>
                          {hierarchy.entityType.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GitBranch className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {hierarchy.approval_levels.length} Levels
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {hierarchy._count.approval_requests}
                        </span>
                      </TableCell>
                      <TableCell>
                        {hierarchy.isActive ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/setup/approval-hierarchies/${hierarchy.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(hierarchy.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
