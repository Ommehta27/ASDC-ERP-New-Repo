"use client"

import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface UtilizationData {
  id: string
  department: string
  budgeted: number
  utilized: number
  committed: number
  available: number
  utilizationPercent: number
}

export function BudgetUtilizationChart() {
  // Placeholder data - will be replaced with actual API call
  const data: UtilizationData[] = [
    {
      id: "1",
      department: "Human Resources",
      budgeted: 10000000,
      utilized: 6500000,
      committed: 2000000,
      available: 1500000,
      utilizationPercent: 65,
    },
    {
      id: "2",
      department: "Training & Development",
      budgeted: 5000000,
      utilized: 3800000,
      committed: 800000,
      available: 400000,
      utilizationPercent: 76,
    },
    {
      id: "3",
      department: "Infrastructure",
      budgeted: 8000000,
      utilized: 4200000,
      committed: 1500000,
      available: 2300000,
      utilizationPercent: 52.5,
    },
    {
      id: "4",
      department: "Marketing & Operations",
      budgeted: 4000000,
      utilized: 3500000,
      committed: 300000,
      available: 200000,
      utilizationPercent: 87.5,
    },
  ]

  const getUtilizationColor = (percent: number) => {
    if (percent >= 90) return "text-red-600"
    if (percent >= 75) return "text-orange-600"
    if (percent >= 50) return "text-yellow-600"
    return "text-green-600"
  }

  const getUtilizationBadge = (percent: number) => {
    if (percent >= 90) return <Badge className="bg-red-500">Critical</Badge>
    if (percent >= 75) return <Badge className="bg-orange-500">High</Badge>
    if (percent >= 50) return <Badge className="bg-yellow-500">Medium</Badge>
    return <Badge className="bg-green-500">Low</Badge>
  }

  return (
    <div className="space-y-6">
      {data.map((item) => (
        <div key={item.id} className="space-y-3 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{item.department}</h3>
              <p className="text-sm text-muted-foreground">
                Budget: {formatCurrency(item.budgeted)}
              </p>
            </div>
            {getUtilizationBadge(item.utilizationPercent)}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Utilization</span>
              <span className={`font-medium ${getUtilizationColor(item.utilizationPercent)}`}>
                {item.utilizationPercent.toFixed(1)}%
              </span>
            </div>
            <Progress value={item.utilizationPercent} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Utilized</p>
              <p className="text-sm font-medium text-blue-600">
                {formatCurrency(item.utilized)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Committed</p>
              <p className="text-sm font-medium text-orange-600">
                {formatCurrency(item.committed)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Available</p>
              <p className="text-sm font-medium text-green-600">
                {formatCurrency(item.available)}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Allocated (Utilized + Committed)</span>
              <span className="font-medium">
                {formatCurrency(item.utilized + item.committed)} ({((item.utilized + item.committed) / item.budgeted * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
