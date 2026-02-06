"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Save, Copy } from "lucide-react"
import { toast } from "sonner"

interface MonthlyAllocation {
  month: number
  year: number
  amount: number
}

interface BudgetPeriod {
  id: string
  periodName: string
  periodType: string
  fiscalYear: number
  startDate: string
  endDate: string
  isActive: boolean
}

interface SelectedPeriodDetails extends BudgetPeriod {
  // Extended with computed fields if needed
}

interface ChartOfAccount {
  id: string
  accountCode: string
  accountName: string
  isActive?: boolean
}

export function BudgetForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Form state
  const [budgetName, setBudgetName] = useState("")
  const [budgetType, setBudgetType] = useState("ANNUAL")
  const [periodId, setPeriodId] = useState("")
  const [costCenterId, setCostCenterId] = useState("")
  const [accountId, setAccountId] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [notes, setNotes] = useState("")

  // Data from API
  const [budgetPeriods, setBudgetPeriods] = useState<BudgetPeriod[]>([])
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  // Monthly allocations - start empty, user must select period first
  const [monthlyAllocations, setMonthlyAllocations] = useState<MonthlyAllocation[]>([])

  // Fetch budget periods and chart of accounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true)
        
        // Fetch budget periods
        const periodsResponse = await fetch("/api/finance/budget-periods")
        if (periodsResponse.ok) {
          const periodsData = await periodsResponse.json()
          setBudgetPeriods(periodsData.filter((p: BudgetPeriod) => p.isActive))
        }

        // Fetch chart of accounts
        const accountsResponse = await fetch("/api/finance/chart-of-accounts")
        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json()
          setChartOfAccounts(accountsData.filter((a: ChartOfAccount) => a.isActive !== false))
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load form data")
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [])

  // Watch for period changes and clear allocations if period changes
  useEffect(() => {
    if (periodId && monthlyAllocations.length > 0) {
      const selectedPeriod = budgetPeriods.find(p => p.id === periodId)
      if (selectedPeriod) {
        // Check if current allocations are outside the selected period
        const startDate = new Date(selectedPeriod.startDate)
        const endDate = new Date(selectedPeriod.endDate)
        
        const hasInvalidAllocations = monthlyAllocations.some(alloc => {
          const allocDate = new Date(alloc.year, alloc.month - 1)
          return allocDate < startDate || allocDate > endDate
        })
        
        if (hasInvalidAllocations) {
          setMonthlyAllocations([])
          toast.info("Allocations cleared due to fiscal year period change")
        }
      }
    }
  }, [periodId, budgetPeriods])

  const budgetTypes = [
    { value: "ANNUAL", label: "Annual Budget" },
    { value: "QUARTERLY", label: "Quarterly Budget" },
    { value: "MONTHLY", label: "Monthly Budget" },
    { value: "PROJECT_BASED", label: "Project Based" },
    { value: "DEPARTMENTAL", label: "Departmental" },
  ]

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const addMonthlyAllocation = () => {
    if (!periodId) {
      toast.error("Please select a budget period first")
      return
    }

    const selectedPeriod = budgetPeriods.find(p => p.id === periodId)
    if (!selectedPeriod) {
      toast.error("Invalid budget period selected")
      return
    }

    // Calculate the next month to add based on existing allocations
    let nextMonth = 1
    let nextYear = new Date(selectedPeriod.startDate).getFullYear()
    
    if (monthlyAllocations.length > 0) {
      // Get the last allocation
      const lastAllocation = monthlyAllocations[monthlyAllocations.length - 1]
      nextMonth = lastAllocation.month + 1
      nextYear = lastAllocation.year
      
      // Handle year rollover
      if (nextMonth > 12) {
        nextMonth = 1
        nextYear += 1
      }
    } else {
      // If no allocations yet, start from the fiscal year start
      const startDate = new Date(selectedPeriod.startDate)
      nextMonth = startDate.getMonth() + 1
      nextYear = startDate.getFullYear()
    }

    // Check if the month is within the fiscal year period
    const endDate = new Date(selectedPeriod.endDate)
    const proposedDate = new Date(nextYear, nextMonth - 1)
    
    if (proposedDate > endDate) {
      toast.error("Cannot add month beyond the fiscal year end date")
      return
    }

    setMonthlyAllocations([
      ...monthlyAllocations,
      { month: nextMonth, year: nextYear, amount: 0 },
    ])
  }

  const removeMonthlyAllocation = (index: number) => {
    setMonthlyAllocations(monthlyAllocations.filter((_, i) => i !== index))
  }

  const updateMonthlyAllocation = (index: number, field: keyof MonthlyAllocation, value: number) => {
    const updated = [...monthlyAllocations]
    updated[index] = { ...updated[index], [field]: value }
    setMonthlyAllocations(updated)
  }

  const distributeEvenly = () => {
    if (!periodId) {
      toast.error("Please select a budget period first")
      return
    }

    const selectedPeriod = budgetPeriods.find(p => p.id === periodId)
    if (!selectedPeriod) {
      toast.error("Invalid budget period selected")
      return
    }

    const total = parseFloat(totalAmount) || 0
    if (total === 0) {
      toast.error("Please enter a total budget amount first")
      return
    }

    // Parse the fiscal year start and end dates
    const startDate = new Date(selectedPeriod.startDate)
    const endDate = new Date(selectedPeriod.endDate)
    
    // Calculate number of months in the fiscal year
    const months: MonthlyAllocation[] = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      months.push({
        month: currentDate.getMonth() + 1, // JavaScript months are 0-indexed
        year: currentDate.getFullYear(),
        amount: 0, // Will be calculated below
      })
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
    
    const perMonth = total / months.length
    const distributed = months.map(m => ({
      ...m,
      amount: perMonth,
    }))
    
    setMonthlyAllocations(distributed)
    toast.success(`Budget distributed evenly across ${months.length} months (${new Date(selectedPeriod.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} to ${new Date(selectedPeriod.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const budgetData = {
        budgetName,
        budgetType,
        budgetPeriodId: periodId,
        costCenterId: costCenterId || null,
        accountId,
        totalAmount: parseFloat(totalAmount),
        notes,
        monthlyAllocations,
      }

      const response = await fetch("/api/finance/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(budgetData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create budget")
      }

      const result = await response.json()
      
      toast.success("Budget created successfully!")
      router.push("/finance/budgets")
      router.refresh()
    } catch (error: any) {
      console.error("Error creating budget:", error)
      toast.error(error.message || "Failed to create budget")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="allocations">Monthly Allocations</TabsTrigger>
          <TabsTrigger value="approval">Approval Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="budgetName">Budget Name *</Label>
              <Input
                id="budgetName"
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
                placeholder="e.g., HR Department Annual Budget FY2026"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetType">Budget Type *</Label>
              <Select value={budgetType} onValueChange={setBudgetType} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {budgetTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodId">Budget Period *</Label>
              <Select value={periodId} onValueChange={setPeriodId} required disabled={loadingData}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingData ? "Loading periods..." : "Select period"} />
                </SelectTrigger>
                <SelectContent>
                  {budgetPeriods.length === 0 ? (
                    <SelectItem value="none" disabled>No active periods found</SelectItem>
                  ) : (
                    budgetPeriods.map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.periodName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="costCenterId">Cost Center</Label>
              <Select value={costCenterId} onValueChange={setCostCenterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cost center" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hr">Human Resources</SelectItem>
                  <SelectItem value="it">Information Technology</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountId">Chart of Account *</Label>
              <Select value={accountId} onValueChange={setAccountId} required disabled={loadingData}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingData ? "Loading accounts..." : "Select account"} />
                </SelectTrigger>
                <SelectContent>
                  {chartOfAccounts.length === 0 ? (
                    <SelectItem value="none" disabled>No accounts found</SelectItem>
                  ) : (
                    chartOfAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.accountCode} - {account.accountName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Budget Amount *</Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="10000000.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Description</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional notes or budget justification"
              rows={4}
            />
          </div>
        </TabsContent>

        <TabsContent value="allocations" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Monthly Budget Breakdown</h3>
              <p className="text-sm text-muted-foreground">
                Allocate the total budget across different months
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={distributeEvenly}>
                <Copy className="mr-2 h-4 w-4" />
                Distribute Evenly
              </Button>
              <Button type="button" variant="outline" onClick={addMonthlyAllocation}>
                <Plus className="mr-2 h-4 w-4" />
                Add Month
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {monthlyAllocations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-2">No monthly allocations added yet</p>
                    <p className="text-sm">
                      Click "Distribute Evenly" to auto-allocate across the fiscal year,
                      or "Add Month" to manually add specific months
                    </p>
                  </div>
                ) : (
                  monthlyAllocations.map((allocation, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Month</Label>
                      <Select
                        value={allocation.month.toString()}
                        onValueChange={(value) => updateMonthlyAllocation(index, "month", parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month, i) => (
                            <SelectItem key={i} value={(i + 1).toString()}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 space-y-2">
                      <Label>Year</Label>
                      <Input
                        type="number"
                        value={allocation.year}
                        onChange={(e) => updateMonthlyAllocation(index, "year", parseInt(e.target.value))}
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={allocation.amount}
                        onChange={(e) => updateMonthlyAllocation(index, "amount", parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMonthlyAllocation(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
                )}

                {monthlyAllocations.length > 0 && (
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="font-medium">Total Allocated:</span>
                    <span className="text-lg font-bold">
                      ₹{monthlyAllocations.reduce((sum, a) => sum + a.amount, 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval Workflow</CardTitle>
              <CardDescription>
                Configure the approval process for this budget
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Required Approval Levels</Label>
                <Select defaultValue="2">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1 - Manager Approval</SelectItem>
                    <SelectItem value="2">Level 2 - Director Approval</SelectItem>
                    <SelectItem value="3">Level 3 - C-Level Approval</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 border rounded-lg p-4">
                <h4 className="font-medium">Approval Hierarchy</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span>Level 1: Budget Manager</span>
                    <span className="text-muted-foreground">First approval</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span>Level 2: Finance Director</span>
                    <span className="text-muted-foreground">Final approval</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="autoApprove" className="rounded" />
                <Label htmlFor="autoApprove">
                  Auto-approve if within threshold (₹1,00,000)
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="button" variant="outline">
          Save as Draft
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Creating..." : "Create Budget"}
        </Button>
      </div>
    </form>
  )
}
