"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface VarianceItem {
  id: string
  category: string
  budgeted: number
  actual: number
  variance: number
  variancePercent: number
  status: "favorable" | "unfavorable" | "neutral"
}

export function VarianceAnalysis() {
  // Placeholder data - will be replaced with actual API call
  const items: VarianceItem[] = [
    {
      id: "1",
      category: "Salaries & Wages",
      budgeted: 10000000,
      actual: 9500000,
      variance: 500000,
      variancePercent: 5,
      status: "favorable",
    },
    {
      id: "2",
      category: "Training & Development",
      budgeted: 2000000,
      actual: 2300000,
      variance: -300000,
      variancePercent: -15,
      status: "unfavorable",
    },
    {
      id: "3",
      category: "Infrastructure",
      budgeted: 5000000,
      actual: 4800000,
      variance: 200000,
      variancePercent: 4,
      status: "favorable",
    },
    {
      id: "4",
      category: "Marketing",
      budgeted: 3000000,
      actual: 3000000,
      variance: 0,
      variancePercent: 0,
      status: "neutral",
    },
  ]

  const getVarianceColor = (status: string) => {
    switch (status) {
      case "favorable":
        return "text-green-600"
      case "unfavorable":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getVarianceIcon = (status: string) => {
    switch (status) {
      case "favorable":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "unfavorable":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "favorable":
        return <Badge className="bg-green-500">Favorable</Badge>
      case "unfavorable":
        return <Badge className="bg-red-500">Unfavorable</Badge>
      default:
        return <Badge variant="outline">On Track</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Total Budgeted</p>
          <p className="text-2xl font-bold">
            {formatCurrency(items.reduce((sum, item) => sum + item.budgeted, 0))}
          </p>
        </div>
        <div className="rounded-lg border p-4 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Total Actual</p>
          <p className="text-2xl font-bold">
            {formatCurrency(items.reduce((sum, item) => sum + item.actual, 0))}
          </p>
        </div>
        <div className="rounded-lg border p-4 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Total Variance</p>
          <p className={`text-2xl font-bold ${getVarianceColor(items.reduce((sum, item) => sum + item.variance, 0) > 0 ? "favorable" : "unfavorable")}`}>
            {formatCurrency(items.reduce((sum, item) => sum + item.variance, 0))}
          </p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Budgeted</TableHead>
              <TableHead className="text-right">Actual</TableHead>
              <TableHead className="text-right">Variance</TableHead>
              <TableHead className="text-right">Variance %</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.category}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.budgeted)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.actual)}</TableCell>
                <TableCell className={`text-right font-medium ${getVarianceColor(item.status)}`}>
                  {formatCurrency(Math.abs(item.variance))}
                </TableCell>
                <TableCell className={`text-right font-medium ${getVarianceColor(item.status)}`}>
                  {item.variancePercent > 0 ? "+" : ""}{item.variancePercent.toFixed(1)}%
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>{getVarianceIcon(item.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
