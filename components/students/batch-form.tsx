"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const formSchema = z.object({
  batchCode: z.string().min(1, "Batch code is required"),
  batchName: z.string().min(2, "Batch name must be at least 2 characters"),
  courseId: z.string().min(1, "Course is required"),
  centerId: z.string().min(1, "Center is required"),
  instructorId: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  capacity: z.string().min(1, "Capacity is required"),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED", "ON_HOLD"]),
  timing: z.string().optional(),
  days: z.string().optional(),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface BatchFormProps {
  initialData?: any
  courses: any[]
  centers: any[]
  instructors: any[]
}

export function BatchForm({ initialData, courses, centers, instructors }: BatchFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batchCode: initialData?.batchCode || "",
      batchName: initialData?.batchName || "",
      courseId: initialData?.courseId || "",
      centerId: initialData?.centerId || "",
      instructorId: initialData?.instructorId || undefined,
      startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
      endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : undefined,
      capacity: initialData?.capacity?.toString() || "30",
      status: initialData?.status || "UPCOMING",
      timing: initialData?.timing || undefined,
      days: initialData?.days || undefined,
      description: initialData?.description || undefined,
    },
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        capacity: parseInt(data.capacity),
      }

      const url = initialData
        ? `/api/students/batches/${initialData.id}`
        : "/api/students/batches"
      
      const method = initialData ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to save batch")
      }

      toast.success(initialData ? "Batch updated successfully!" : "Batch created successfully!")
      router.push("/students/batches")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="batchCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch Code *</FormLabel>
                <FormControl>
                  <Input placeholder="BATCH001" {...field} className="font-mono" />
                </FormControl>
                <FormDescription>Unique identifier for the batch</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="batchName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Python - Morning Batch" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="centerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Center *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select center" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {centers.map((center) => (
                      <SelectItem key={center.id} value={center.id}>
                        {center.code} - {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instructorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructor</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select instructor (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {instructors.map((instructor) => (
                      <SelectItem key={instructor.id} value={instructor.id}>
                        {instructor.users.firstName} {instructor.users.lastName} ({instructor.employeeCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="30" {...field} />
                </FormControl>
                <FormDescription>Maximum number of students</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                    <SelectItem value="ONGOING">Ongoing</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timing"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timing</FormLabel>
                <FormControl>
                  <Input placeholder="9:00 AM - 12:00 PM" {...field} />
                </FormControl>
                <FormDescription>Class timings</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Days</FormLabel>
                <FormControl>
                  <Input placeholder="Mon, Wed, Fri" {...field} />
                </FormControl>
                <FormDescription>Class days</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter batch description, special notes, or instructions..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? "Saving..." : initialData ? "Update Batch" : "Create Batch"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
