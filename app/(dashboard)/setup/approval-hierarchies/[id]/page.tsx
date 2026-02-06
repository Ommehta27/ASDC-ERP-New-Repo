"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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
  Clock,
  AlertCircle,
  MoveUp,
  MoveDown,
  Loader2,
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

export default function EditApprovalHierarchyPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [entityType, setEntityType] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isDefault, setIsDefault] = useState(false)
  const [levels, setLevels] = useState<ApprovalLevel[]>([])

  useEffect(() => {
    fetchHierarchy()
  }, [])

  const fetchHierarchy = async () => {
    try {
      const res = await fetch(`/api/setup/approval-hierarchies/${params.id}`)
      const data = await res.json()

      setName(data.name)
      setDescription(data.description || "")
      setEntityType(data.entityType)
      setIsActive(data.isActive)
      setIsDefault(data.isDefault)
      setLevels(
        data.approval_levels.map((level: any) => ({
          levelNumber: level.levelNumber,
          levelName: level.levelName,
          description: level.description || "",
          approverType: level.approverType,
          approverRole: level.approverRole || "",
          specificApprovers: level.specificApprovers || [],
          minApprovals: level.minApprovals,
          autoApproveAmount: level.autoApproveAmount,
          requiresAll: level.requiresAll,
          timeoutHours: level.timeoutHours,
          isActive: level.isActive,
        }))
      )
    } catch (error) {
      console.error("Error fetching hierarchy:", error)
      toast.error("Failed to load hierarchy")
    } finally {
      setLoading(false)
    }
  }

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
    newLevels.forEach((level, i) => {
      level.levelNumber = i + 1
    })
    setLevels(newLevels)
  }

  const moveLevel = (index: number, direction: "up" | "down") => {
    const newLevels = [...levels]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    
    if (targetIndex < 0 || targetIndex >= newLevels.length) return
    
    [newLevels[index], newLevels[targetIndex]] = [newLevels[targetIndex], newLevels[index]]
    
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
    if (!name.trim()) {
      toast.error("Please enter a hierarchy name")
      return
    }
    if (levels.length === 0) {
      toast.error("At least one approval level is required")
      return
    }

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
      const res = await fetch(`/api/setup/approval-hierarchies/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          isActive,
          isDefault,
          levels,
        }),
      })

      if (res.ok) {
        toast.success("Approval hierarchy updated successfully")
        router.push("/setup/approval-hierarchies")
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to update hierarchy")
      }
    } catch (error) {
      console.error("Error updating hierarchy:", error)
      toast.error("Failed to update hierarchy")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading hierarchy...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/setup/approval-hierarchies">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Approval Hierarchy</h1>
          <p className="text-muted-foreground mt-1">
            Modify the approval workflow configuration
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Configure the hierarchy name and settings</CardDescription>
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
              <Label>Entity Type</Label>
              <Input value={entityType.replace(/_/g, " ")} disabled />
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
                Setting this as default will automatically apply it to all new {entityType.replace(/_/g, " ").toLowerCase()} requests.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Approval Levels</CardTitle>
              <CardDescription>
                Define the approval flow with multiple levels
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
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Link href="/setup/approval-hierarchies">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Update Hierarchy
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
