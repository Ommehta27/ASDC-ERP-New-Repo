"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PiggyBank, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function BudgetStats() {
  // Placeholder data - will be replaced with actual API call
  const stats = {
    totalBudget: 50000000,
    allocated: 35000000,
    committed: 15000000,
    actualSpent: 12500000,
    available: 22500000,
    variance: 2500000,
    utilizationPercent: 25,
  }

  const statCards = [
    {
      title: "Total Budget",
      value: formatCurrency(stats.totalBudget),
      icon: PiggyBank,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Allocated",
      value: formatCurrency(stats.allocated),
      subtitle: `${((stats.allocated / stats.totalBudget) * 100).toFixed(1)}% of total`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Actual Spent",
      value: formatCurrency(stats.actualSpent),
      subtitle: `${stats.utilizationPercent}% utilization`,
      icon: TrendingDown,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Available",
      value: formatCurrency(stats.available),
      subtitle: `${((stats.available / stats.totalBudget) * 100).toFixed(1)}% remaining`,
      icon: PiggyBank,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
