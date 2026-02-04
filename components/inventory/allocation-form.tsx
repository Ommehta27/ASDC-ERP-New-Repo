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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Loader2, AlertTriangle, Package, ShoppingCart } from "lucide-react"

const formSchema = z.object({
  itemId: z.string().min(1, "Item is required"),
  centerId: z.string().min(1, "Center is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unitCost: z.string().min(1, "Unit cost is required"),
  condition: z.string().min(1, "Condition is required"),
  location: z.string().optional(),
  purchaseDate: z.string().optional(),
  serialNumbers: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AllocationFormProps {
  items: Array<{ id: string; itemCode: string; name: string }>
  centers: Array<{ id: string; name: string; code: string }>
}

export function AllocationForm({ items, centers }: AllocationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [unallocatedStock, setUnallocatedStock] = useState<number | null>(null)
  const [checkingStock, setCheckingStock] = useState(false)
  const [selectedItemName, setSelectedItemName] = useState("")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemId: "",
      centerId: "",
      quantity: "",
      unitCost: "",
      condition: "NEW",
      location: "",
      purchaseDate: "",
      serialNumbers: "",
      notes: "",
    },
  })

  const selectedItemId = form.watch("itemId")
  const requestedQuantity = form.watch("quantity")

  // Check unallocated stock when item is selected
  useEffect(() => {
    async function checkUnallocatedStock() {
      if (!selectedItemId) {
        setUnallocatedStock(null)
        setSelectedItemName("")
        return
      }

      setCheckingStock(true)
      try {
        const response = await fetch(`/api/inventory/unallocated/${selectedItemId}`)
        if (response.ok) {
          const data = await response.json()
          setUnallocatedStock(data.quantity)
          
          // Get item name
          const item = items.find(i => i.id === selectedItemId)
          setSelectedItemName(item?.name || "")
        }
      } catch (error) {
        console.error("Error checking stock:", error)
      } finally {
        setCheckingStock(false)
      }
    }

    checkUnallocatedStock()
  }, [selectedItemId, items])

  const hasInsufficientStock = 
    unallocatedStock !== null && 
    requestedQuantity && 
    parseInt(requestedQuantity) > unallocatedStock

  const hasNoStock = unallocatedStock !== null && unallocatedStock === 0

  async function onSubmit(data: FormValues) {
    setLoading(true)
    try {
      const response = await fetch("/api/inventory/allocations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Allocation created successfully")
        router.push("/inventory")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to create allocation")
      }
    } catch (error) {
      console.error("Error creating allocation:", error)
      toast.error("Failed to create allocation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Stock Status Alert */}
        {selectedItemId && (
          <>
            {checkingStock && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle>Checking Stock...</AlertTitle>
                <AlertDescription>
                  Verifying unallocated inventory availability...
                </AlertDescription>
              </Alert>
            )}

            {!checkingStock && hasNoStock && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No Unallocated Stock Available!</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>
                    <strong>{selectedItemName}</strong> has <strong>0 units</strong> in unallocated inventory.
                  </p>
                  <p className="text-sm">
                    You cannot allocate this item to a center. Please:
                  </p>
                  <ul className="list-disc list-inside text-sm ml-2 space-y-1">
                    <li>Purchase new stock, or</li>
                    <li>Add initial stock to this item, or</li>
                    <li>Return items from other centers</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {!checkingStock && !hasNoStock && hasInsufficientStock && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Insufficient Unallocated Stock!</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>
                    <strong>{selectedItemName}</strong> has only <strong>{unallocatedStock} units</strong> available in unallocated inventory.
                  </p>
                  <p className="text-sm">
                    You are requesting <strong>{requestedQuantity} units</strong>, which exceeds available stock.
                  </p>
                  <p className="text-sm font-medium">
                    Please reduce quantity or purchase additional stock.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {!checkingStock && !hasNoStock && !hasInsufficientStock && unallocatedStock !== null && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <Package className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 dark:text-green-200">Stock Available</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  <strong>{unallocatedStock} units</strong> of <strong>{selectedItemName}</strong> available in unallocated inventory.
                  {requestedQuantity && parseInt(requestedQuantity) > 0 && (
                    <span className="block mt-1 text-sm">
                      After allocation: <strong>{unallocatedStock - parseInt(requestedQuantity)} units</strong> will remain.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="itemId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inventory Item *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.itemCode})
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select center" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {centers.map((center) => (
                      <SelectItem key={center.id} value={center.id}>
                        {center.name} ({center.code})
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
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unitCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Cost *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="5000.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="GOOD">Good</SelectItem>
                    <SelectItem value="FAIR">Fair</SelectItem>
                    <SelectItem value="POOR">Poor</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Room 101, Floor 2" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serialNumbers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serial Numbers</FormLabel>
                <FormControl>
                  <Input placeholder="SN001, SN002, SN003 (comma-separated)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Additional notes" rows={3} {...field} />
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
          <Button 
            type="submit" 
            disabled={loading || hasNoStock || hasInsufficientStock || checkingStock}
            className={hasNoStock || hasInsufficientStock ? "opacity-50 cursor-not-allowed" : ""}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {hasNoStock || hasInsufficientStock ? (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Purchase Stock First
              </>
            ) : (
              "Allocate to Center"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
