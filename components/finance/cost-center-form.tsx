"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface CostCenterFormProps {
  costCenter?: any
}

export function CostCenterForm({ costCenter }: CostCenterFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [centers, setCenters] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])

  const [formData, setFormData] = useState({
    centerCode: costCenter?.centerCode || "",
    centerName: costCenter?.centerName || "",
    description: costCenter?.description || "",
    centerId: costCenter?.centerId || "",
    managerId: costCenter?.managerId || "",
    isActive: costCenter?.isActive ?? true,
  })

  useEffect(() => {
    // Fetch centers for parent selection
    fetch("/api/centers")
      .then((res) => res.json())
      .then((data) => setCenters(data))
      .catch((err) => console.error("Error fetching centers:", err))

    // Fetch employees for manager selection
    fetch("/api/hr/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch((err) => console.error("Error fetching employees:", err))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.centerCode || !formData.centerName) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      const url = costCenter
        ? `/api/finance/cost-centers/${costCenter.id}`
        : "/api/finance/cost-centers"
      
      const method = costCenter ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success(costCenter ? "Cost center updated successfully" : "Cost center created successfully")
        router.push("/finance/cost-centers")
        router.refresh()
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to save cost center")
      }
    } catch (error) {
      console.error("Error saving cost center:", error)
      toast.error("Failed to save cost center")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the cost center details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="centerCode">Cost Center Code *</Label>
              <Input
                id="centerCode"
                placeholder="e.g., CC-001"
                value={formData.centerCode}
                onChange={(e) =>
                  setFormData({ ...formData, centerCode: e.target.value })
                }
                required
                disabled={!!costCenter}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="centerName">Cost Center Name *</Label>
              <Input
                id="centerName"
                placeholder="e.g., Marketing Department"
                value={formData.centerName}
                onChange={(e) =>
                  setFormData({ ...formData, centerName: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose of this cost center..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="centerId">Associated Center</Label>
              <Select
                value={formData.centerId || undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, centerId: value === "NONE" ? "" : value })
                }
              >
                <SelectTrigger id="centerId">
                  <SelectValue placeholder="Select center" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  {centers.map((center) => (
                    <SelectItem key={center.id} value={center.id}>
                      {center.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="managerId">Manager</Label>
              <Select
                value={formData.managerId || undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, managerId: value === "NONE" ? "" : value })
                }
              >
                <SelectTrigger id="managerId">
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Link href="/finance/cost-centers">
          <Button type="button" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : costCenter ? "Update Cost Center" : "Create Cost Center"}
        </Button>
      </div>
    </form>
  )
}
