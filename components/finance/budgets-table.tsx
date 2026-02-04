"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Eye, TrendingUp } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface Budget {
  id: string
  budgetNumber: string
  budgetName: string
  totalAmount: number
  allocatedAmount: number
  actualAmount: number
  variance: number
  variancePercent: number
  status: string
  budgetType: string
}

export function BudgetsTable() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/finance/budgets")
      
      if (!response.ok) {
        throw new Error("Failed to fetch budgets")
      }

      const data = await response.json()
      setBudgets(data)
    } catch (error) {
      console.error("Error fetching budgets:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (budgets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No budgets found. Create your first budget to get started.
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default"
      case "DRAFT":
        return "secondary"
      case "APPROVED":
        return "default"
      case "CLOSED":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return "text-green-600"
    if (variance < 0) return "text-red-600"
    return "text-gray-600"
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Budget Number</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead className="text-right">Allocated</TableHead>
            <TableHead className="text-right">Actual</TableHead>
            <TableHead>Utilization</TableHead>
            <TableHead className="text-right">Variance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgets.map((budget) => {
            const utilizationPercent = (budget.actualAmount / budget.totalAmount) * 100
            return (
              <TableRow key={budget.id}>
                <TableCell className="font-mono">{budget.budgetNumber}</TableCell>
                <TableCell className="font-medium">{budget.budgetName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{budget.budgetType}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(budget.totalAmount)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(budget.allocatedAmount)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(budget.actualAmount)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Progress value={utilizationPercent} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {utilizationPercent.toFixed(1)}%
                    </p>
                  </div>
                </TableCell>
                <TableCell className={`text-right font-medium ${getVarianceColor(budget.variance)}`}>
                  {formatCurrency(budget.variance)}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(budget.status)}>
                    {budget.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/finance/budgets/${budget.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/finance/budgets/${budget.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
