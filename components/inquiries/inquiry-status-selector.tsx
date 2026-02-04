"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface InquiryStatusSelectorProps {
  inquiryId: string
  currentStatus: string
  currentPriority: string
  onUpdate: () => void
}

const statusOptions = [
  { value: "NEW", label: "New", color: "bg-blue-500" },
  { value: "CONTACTED", label: "Contacted", color: "bg-cyan-500" },
  { value: "FOLLOW_UP", label: "Follow Up", color: "bg-yellow-500" },
  { value: "QUALIFIED", label: "Qualified", color: "bg-green-500" },
  { value: "CONVERTED", label: "Converted", color: "bg-purple-500" },
  { value: "LOST", label: "Lost", color: "bg-red-500" },
]

const priorityOptions = [
  { value: "LOW", label: "Low", color: "bg-gray-500" },
  { value: "MEDIUM", label: "Medium", color: "bg-blue-500" },
  { value: "HIGH", label: "High", color: "bg-orange-500" },
  { value: "URGENT", label: "Urgent", color: "bg-red-500" },
]

export function InquiryStatusSelector({
  inquiryId,
  currentStatus,
  currentPriority,
  onUpdate,
}: InquiryStatusSelectorProps) {
  const [updating, setUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === "CONVERTED") {
      const confirmed = confirm(
        "Converting this inquiry will automatically create a student record. Continue?"
      )
      if (!confirmed) return
    }

    setUpdating(true)
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success(
          newStatus === "CONVERTED"
            ? "Inquiry converted to student successfully"
            : "Status updated successfully"
        )
        onUpdate()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    } finally {
      setUpdating(false)
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      })

      if (response.ok) {
        toast.success("Priority updated successfully")
        onUpdate()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to update priority")
      }
    } catch (error) {
      console.error("Error updating priority:", error)
      toast.error("Failed to update priority")
    } finally {
      setUpdating(false)
    }
  }

  const currentStatusOption = statusOptions.find((opt) => opt.value === currentStatus)
  const currentPriorityOption = priorityOptions.find((opt) => opt.value === currentPriority)

  return (
    <div className="flex gap-2">
      <Select
        value={currentStatus}
        onValueChange={handleStatusChange}
        disabled={updating}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue>
            <Badge variant="secondary" className={currentStatusOption?.color}>
              {currentStatusOption?.label}
            </Badge>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <Badge variant="secondary" className={option.color}>
                {option.label}
              </Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentPriority}
        onValueChange={handlePriorityChange}
        disabled={updating}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue>
            <Badge variant="outline" className={currentPriorityOption?.color}>
              {currentPriorityOption?.label}
            </Badge>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {priorityOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <Badge variant="outline" className={option.color}>
                {option.label}
              </Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
