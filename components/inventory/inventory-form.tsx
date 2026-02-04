"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
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
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  itemCode: z.string().min(1, "Item code is required"),
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  model: z.string().optional(),
  uomId: z.string().optional(),
  specifications: z.string().optional(),
  estimatedPrice: z.string().optional(),
  warrantyPeriodMonths: z.string().optional(),
  maintenanceIntervalDays: z.string().optional(),
  minQuantityPerCenter: z.string().optional(),
  defaultSupplier: z.string().optional(),
  initialStock: z.string().optional(),
  initialCost: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface InventoryFormProps {
  uoms: Array<{ id: string; name: string; abbreviation: string }>
}

export function InventoryForm({ uoms }: InventoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemCode: "",
      name: "",
      description: "",
      category: "COMPUTER",
      brand: "",
      model: "",
      uomId: "",
      specifications: "",
      estimatedPrice: "",
      warrantyPeriodMonths: "",
      maintenanceIntervalDays: "",
      minQuantityPerCenter: "5",
      defaultSupplier: "",
      initialStock: "0",
      initialCost: "",
    },
  })

  async function onSubmit(data: FormValues) {
    setLoading(true)
    try {
      const response = await fetch("/api/inventory/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Inventory item created successfully")
        router.push("/inventory")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to create inventory item")
      }
    } catch (error) {
      console.error("Error creating inventory item:", error)
      toast.error("Failed to create inventory item")
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
            name="itemCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Code *</FormLabel>
                <FormControl>
                  <Input placeholder="ITM-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Desktop Computer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="COMPUTER">Computer</SelectItem>
                    <SelectItem value="FURNITURE">Furniture</SelectItem>
                    <SelectItem value="STATIONERY">Stationery</SelectItem>
                    <SelectItem value="LAB_EQUIPMENT">Lab Equipment</SelectItem>
                    <SelectItem value="ELECTRONICS">Electronics</SelectItem>
                    <SelectItem value="BOOKS">Books</SelectItem>
                    <SelectItem value="SOFTWARE">Software</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="uomId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit of Measure</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select UOM" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {uoms.map((uom) => (
                      <SelectItem key={uom.id} value={uom.id}>
                        {uom.name} ({uom.abbreviation})
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
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="Dell" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input placeholder="OptiPlex 7090" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estimatedPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="50000.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="warrantyPeriodMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warranty Period (Months)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maintenanceIntervalDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maintenance Interval (Days)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="90" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minQuantityPerCenter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Quantity per Center</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="defaultSupplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Supplier</FormLabel>
                <FormControl>
                  <Input placeholder="Supplier Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="initialStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Initial Stock (Unallocated)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground">
                  Stock will be added to central warehouse for allocation
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="initialCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Initial Unit Cost</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Item description" rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specifications"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Specifications</FormLabel>
                <FormControl>
                  <Textarea placeholder="Technical specifications" rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Item
          </Button>
        </div>
      </form>
    </Form>
  )
}
