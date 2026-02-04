"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

interface BudgetPeriod {
  id: string
  periodName: string
  periodType: string
  fiscalYear: number
  startDate: string
  endDate: string
  quarter?: string | null
  month?: string | null
  description?: string | null
  status: string
  isActive: boolean
  createdAt: string
}

export function BudgetPeriodsTable() {
  const [periods, setPeriods] = useState<BudgetPeriod[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPeriods()
  }, [])

  const fetchPeriods = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/finance/budget-periods")
      
      if (!response.ok) {
        throw new Error("Failed to fetch budget periods")
      }

      const data = await response.json()
      setPeriods(data)
    } catch (error) {
      console.error("Error fetching budget periods:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (periods.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No budget periods found. Create your first budget period to get started.
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default"
      case "DRAFT":
        return "secondary"
      case "CLOSED":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Fiscal Year</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {periods.map((period) => (
            <TableRow key={period.id}>
              <TableCell className="font-medium">{period.periodName}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {period.periodType.replace(/_/g, ' ')}
                </Badge>
              </TableCell>
              <TableCell>{period.fiscalYear}</TableCell>
              <TableCell>{formatDate(period.startDate)}</TableCell>
              <TableCell>{formatDate(period.endDate)}</TableCell>
              <TableCell>
                <Badge variant={getStatusColor(period.status)}>
                  {period.status}
                </Badge>
              </TableCell>
              <TableCell>
                {period.isActive ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/finance/budgets/periods/${period.id}`}>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
