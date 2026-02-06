"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  GitBranch,
  Users,
  Clock,
  AlertCircle,
  MoveUp,
  MoveDown,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface ApprovalLevel {
  levelNumber: number
  levelName: string
  description: string
  approverType: string
  approverRole: string
  specificApprovers: string[]
  minApprovals: number
  autoApproveAmount: number | null
  requiresAll: boolean
  timeoutHours: number | null
  isActive: boolean
}

export default function NewApprovalHierarchyPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [entityType, setEntityType] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isDefault, setIsDefault] = useState(false)

  // Levels state
  const [levels, setLevels] = useState<ApprovalLevel[]>([
    {
      levelNumber: 1,
      levelName: "Level 1",
      description: "",
      approverType: "ROLE_BASED",
      approverRole: "",
      specificApprovers: [],
      minApprovals: 1,
      autoApproveAmount: null,
      requiresAll: false,
      timeoutHours: null,
      isActive: true,
    },
  ])

  const addLevel = () => {
    setLevels([
      ...levels,
      {
        levelNumber: levels.length + 1,
        levelName: `Level ${levels.length + 1}`,
        description: "",
        approverType: "ROLE_BASED",
        approverRole: "",
        specificApprovers: [],
        minApprovals: 1,
        autoApproveAmount: null,
        requiresAll: false,
        timeoutHours: null,
        isActive: true,
      },
    ])
  }

  const removeLevel = (index: number) => {
    if (levels.length === 1) {
      toast.error("At least one approval level is required")
      return
    }
    const newLevels = levels.filter((_, i) => i !== index)
    // Renumber levels
    newLevels.forEach((level, i) => {
      level.levelNumber = i + 1
    })
    setLevels(newLevels)
  }

  const moveLevel = (index: number, direction: "up" | "down") => {
    const newLevels = [...levels]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    
    if (targetIndex < 0 || targetIndex >= newLevels.length) return
    
    // Swap
    [newLevels[index], newLevels[targetIndex]] = [newLevels[targetIndex], newLevels[index]]
    
    // Renumber
    newLevels.forEach((level, i) => {
      level.levelNumber = i + 1
    })
    
    setLevels(newLevels)
  }

  const updateLevel = (index: number, field: keyof ApprovalLevel, value: any) => {
    const newLevels = [...levels]
    newLevels[index] = { ...newLevels[index], [field]: value }
    setLevels(newLevels)
  }

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      toast.error("Please enter a hierarchy name")
      return
    }
    if (!entityType) {
      toast.error("Please select an entity type")
      return
    }
    if (levels.length === 0) {
      toast.error("At least one approval level is required")
      return
    }

    // Validate each level
    for (const level of levels) {
      if (!level.levelName.trim()) {
        toast.error(`Level ${level.levelNumber}: Name is required`)
        return
      }
      if (level.approverType === "ROLE_BASED" && !level.approverRole) {
        toast.error(`Level ${level.levelNumber}: Approver role is required`)
        return
      }
    }

    setSaving(true)

    try {
      const res = await fetch("/api/setup/approval-hierarchies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          entityType,
          isActive,
          isDefault,
          levels,
        }),
      })

      if (res.ok) {
        toast.success("Approval hierarchy created successfully")
        router.push("/setup/approval-hierarchies")
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to create hierarchy")
      }
    } catch (error) {
      console.error("Error creating hierarchy:", error)
      toast.error("Failed to create hierarchy")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/setup/approval-hierarchies">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Approval Hierarchy</h1>
          <p className="text-muted-foreground mt-1">
            Build a custom approval workflow with multiple levels
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Configure the hierarchy name and entity type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Hierarchy Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Standard PO Approval"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entityType">Entity Type *</Label>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger id="entityType">
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PURCHASE_ORDER">Purchase Orders</SelectItem>
                  <SelectItem value="BUDGET">Budgets</SelectItem>
                  <SelectItem value="BUDGET_PERIOD">Budget Periods</SelectItem>
                  <SelectItem value="PURCHASE">Purchases</SelectItem>
                  <SelectItem value="EXPENSE">Expenses</SelectItem>
                  <SelectItem value="PAYMENT">Payments</SelectItem>
                  <SelectItem value="LEAVE_APPLICATION">Leave Applications</SelectItem>
                  <SelectItem value="SALARY_REVISION">Salary Revisions</SelectItem>
                  <SelectItem value="ASSET_ALLOCATION">Asset Allocations</SelectItem>
                  <SelectItem value="INVENTORY_TRANSFER">Inventory Transfers</SelectItem>
                  <SelectItem value="VENDOR_CREATION">Vendor Creation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose and scope of this approval hierarchy..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch id="isDefault" checked={isDefault} onCheckedChange={setIsDefault} />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Set as Default
              </Label>
            </div>
          </div>

          {isDefault && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                Setting this as default will automatically apply it to all new {entityType.replace(/_/g, " ").toLowerCase()} requests. Any existing default hierarchy for this entity type will be unset.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Levels */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Approval Levels</CardTitle>
              <CardDescription>
                Define the approval flow with multiple levels and conditions
              </CardDescription>
            </div>
            <Button onClick={addLevel} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Level
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {levels.map((level, index) => (
            <Card key={index} className="border-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-base px-3 py-1">
                      Level {level.levelNumber}
                    </Badge>
                    <Input
                      placeholder="Level Name"
                      value={level.levelName}
                      onChange={(e) => updateLevel(index, "levelName", e.target.value)}
                      className="max-w-xs"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveLevel(index, "up")}
                      disabled={index === 0}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveLevel(index, "down")}
                      disabled={index === levels.length - 1}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLevel(index)}
                      disabled={levels.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe this approval level..."
                    value={level.description}
                    onChange={(e) => updateLevel(index, "description", e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Approver Type *</Label>
                    <Select
                      value={level.approverType}
                      onValueChange={(value) => updateLevel(index, "approverType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ROLE_BASED">Role Based</SelectItem>
                        <SelectItem value="SPECIFIC_USERS">Specific Users</SelectItem>
                        <SelectItem value="REPORTING_MANAGER">Reporting Manager</SelectItem>
                        <SelectItem value="DEPARTMENT_HEAD">Department Head</SelectItem>
                        <SelectItem value="CENTER_DIRECTOR">Center Director</SelectItem>
                        <SelectItem value="FINANCE_TEAM">Finance Team</SelectItem>
                        <SelectItem value="HR_TEAM">HR Team</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {level.approverType === "ROLE_BASED" && (
                    <div className="space-y-2">
                      <Label>Approver Role *</Label>
                      <Select
                        value={level.approverRole}
                        onValueChange={(value) => updateLevel(index, "approverRole", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                          <SelectItem value="CENTER_DIRECTOR">Center Director</SelectItem>
                          <SelectItem value="TRAINER">Trainer</SelectItem>
                          <SelectItem value="COUNSELOR">Counselor</SelectItem>
                          <SelectItem value="PLACEMENT_OFFICER">Placement Officer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Minimum Approvals</Label>
                    <Input
                      type="number"
                      min="1"
                      value={level.minApprovals}
                      onChange={(e) => updateLevel(index, "minApprovals", parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Auto-Approve Amount (Optional)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 10000"
                      value={level.autoApproveAmount || ""}
                      onChange={(e) =>
                        updateLevel(index, "autoApproveAmount", e.target.value ? parseFloat(e.target.value) : null)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Timeout (Hours)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 48"
                      value={level.timeoutHours || ""}
                      onChange={(e) =>
                        updateLevel(index, "timeoutHours", e.target.value ? parseInt(e.target.value) : null)
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={level.requiresAll}
                      onCheckedChange={(checked) => updateLevel(index, "requiresAll", checked)}
                    />
                    <Label className="text-sm">Requires All Approvers</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={level.isActive}
                      onCheckedChange={(checked) => updateLevel(index, "isActive", checked)}
                    />
                    <Label className="text-sm">Active</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {levels.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No approval levels defined</p>
              <Button onClick={addLevel}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Level
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Link href="/setup/approval-hierarchies">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Hierarchy
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
