"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Workflow, CheckCircle, XCircle, Clock } from "lucide-react"

export function WorkflowStats() {
  // Placeholder data - will be replaced with actual API call
  const stats = {
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalExecutions: 0,
    successRate: 0,
  }

  const statCards = [
    {
      title: "Total Workflows",
      value: stats.totalWorkflows,
      icon: Workflow,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active",
      value: stats.activeWorkflows,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Executions",
      value: stats.totalExecutions,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Success Rate",
      value: `${stats.successRate}%`,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
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
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
