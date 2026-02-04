"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NewBudgetPeriodPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    periodName: "",
    periodType: "ANNUAL",
    startDate: "",
    endDate: "",
    fiscalYear: new Date().getFullYear().toString(),
    quarter: undefined as string | undefined,
    month: undefined as string | undefined,
    description: "",
    isActive: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/finance/budget-periods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create budget period")
      }

      toast.success("Budget period created successfully!")
      router.push("/finance/budgets/periods")
      router.refresh()
    } catch (error: any) {
      console.error("Error creating budget period:", error)
      toast.error(error.message || "Failed to create budget period")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/finance/budgets/periods">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Budget Period</h1>
          <p className="text-muted-foreground mt-1">
            Define a new budget planning period
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Period Details</CardTitle>
            <CardDescription>
              Define the budget planning period information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Period Name */}
              <div className="space-y-2">
                <Label htmlFor="periodName">
                  Period Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="periodName"
                  placeholder="e.g., FY 2026 (Apr 2025 - Mar 2026)"
                  value={formData.periodName}
                  onChange={(e) =>
                    setFormData({ ...formData, periodName: e.target.value })
                  }
                  required
                />
              </div>

              {/* Period Type */}
              <div className="space-y-2">
                <Label htmlFor="periodType">
                  Period Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.periodType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, periodType: value })
                  }
                  required
                >
                  <SelectTrigger id="periodType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANNUAL">Annual</SelectItem>
                    <SelectItem value="SEMI_ANNUAL">Semi-Annual</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
                />
              </div>

              {/* Fiscal Year */}
              <div className="space-y-2">
                <Label htmlFor="fiscalYear">
                  Fiscal Year <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fiscalYear"
                  type="number"
                  placeholder="e.g., 2026"
                  value={formData.fiscalYear}
                  onChange={(e) =>
                    setFormData({ ...formData, fiscalYear: e.target.value })
                  }
                  required
                />
              </div>

              {/* Quarter (Optional) */}
              {formData.periodType === "QUARTERLY" && (
                <div className="space-y-2">
                  <Label htmlFor="quarter">Quarter</Label>
                  <Select
                    value={formData.quarter}
                    onValueChange={(value) =>
                      setFormData({ ...formData, quarter: value })
                    }
                  >
                    <SelectTrigger id="quarter">
                      <SelectValue placeholder="Select quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1">Q1</SelectItem>
                      <SelectItem value="Q2">Q2</SelectItem>
                      <SelectItem value="Q3">Q3</SelectItem>
                      <SelectItem value="Q4">Q4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Month (Optional) */}
              {formData.periodType === "MONTHLY" && (
                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Select
                    value={formData.month}
                    onValueChange={(value) =>
                      setFormData({ ...formData, month: value })
                    }
                  >
                    <SelectTrigger id="month">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="January">January</SelectItem>
                      <SelectItem value="February">February</SelectItem>
                      <SelectItem value="March">March</SelectItem>
                      <SelectItem value="April">April</SelectItem>
                      <SelectItem value="May">May</SelectItem>
                      <SelectItem value="June">June</SelectItem>
                      <SelectItem value="July">July</SelectItem>
                      <SelectItem value="August">August</SelectItem>
                      <SelectItem value="September">September</SelectItem>
                      <SelectItem value="October">October</SelectItem>
                      <SelectItem value="November">November</SelectItem>
                      <SelectItem value="December">December</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter period description or notes..."
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-4 border-t">
              <Link href="/finance/budgets/periods">
                <Button type="button" variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2">Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Period
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
