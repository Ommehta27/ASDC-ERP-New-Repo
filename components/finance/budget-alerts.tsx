"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, AlertCircle, Info } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface BudgetAlert {
  id: string
  type: "THRESHOLD_EXCEEDED" | "APPROACHING_LIMIT" | "OVER_BUDGET" | "INFO"
  severity: "CRITICAL" | "WARNING" | "INFO"
  message: string
  budget: string
  currentValue: number
  threshold: number
}

export function BudgetAlerts() {
  // Placeholder data - will be replaced with actual API call
  const alerts: BudgetAlert[] = [
    {
      id: "1",
      type: "OVER_BUDGET",
      severity: "CRITICAL",
      message: "Training & Development budget has exceeded the allocated amount",
      budget: "Training & Development",
      currentValue: 2300000,
      threshold: 2000000,
    },
    {
      id: "2",
      type: "THRESHOLD_EXCEEDED",
      severity: "WARNING",
      message: "Marketing budget has reached 90% utilization",
      budget: "Marketing & Operations",
      currentValue: 3600000,
      threshold: 4000000,
    },
    {
      id: "3",
      type: "APPROACHING_LIMIT",
      severity: "INFO",
      message: "Infrastructure budget is approaching 75% utilization",
      budget: "Infrastructure",
      currentValue: 5800000,
      threshold: 8000000,
    },
  ]

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <AlertTriangle className="h-4 w-4" />
      case "WARNING":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getAlertVariant = (severity: string): "default" | "destructive" => {
    if (severity === "CRITICAL") return "destructive"
    return "default"
  }

  if (alerts.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Alert key={alert.id} variant={getAlertVariant(alert.severity)}>
          {getAlertIcon(alert.severity)}
          <AlertTitle className="flex items-center justify-between">
            <span>{alert.budget}</span>
            <span className="text-sm font-normal">
              {formatCurrency(alert.currentValue)} / {formatCurrency(alert.threshold)}
            </span>
          </AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
