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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, Plus, Trash2, Calculator, FileText } from "lucide-react"

const lineItemSchema = z.object({
  inventoryItemId: z.string().optional(),
  itemName: z.string().min(1, "Item name required"),
  description: z.string().optional(),
  specifications: z.string().optional(),
  quantity: z.string().min(1, "Quantity required"),
  unitPrice: z.string().min(1, "Unit price required"),
  taxRate: z.string().optional(),
  discount: z.string().optional(),
})

const formSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  centerId: z.string().min(1, "Center is required"),
  priority: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
  termsConditions: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one item required"),
})

type FormValues = z.infer<typeof formSchema>
type LineItem = z.infer<typeof lineItemSchema>

interface POFormProps {
  vendors: Array<{ id: string; vendorCode: string; name: string }>
  centers: Array<{ id: string; code: string; name: string }>
  inventoryItems: Array<{ 
    id: string
    itemCode: string
    name: string
    estimatedPrice?: number | null
    specifications?: string | null
  }>
}

export function POForm({ vendors, centers, inventoryItems }: POFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      inventoryItemId: "",
      itemName: "",
      description: "",
      specifications: "",
      quantity: "1",
      unitPrice: "0",
      taxRate: "18",
      discount: "0",
    },
  ])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendorId: "",
      centerId: "",
      priority: "MEDIUM",
      expectedDeliveryDate: "",
      paymentTerms: "",
      deliveryAddress: "",
      notes: "",
      termsConditions: "",
      lineItems: lineItems,
    },
  })

  const calculateLineTotal = (item: LineItem) => {
    const qty = parseFloat(item.quantity || "0")
    const price = parseFloat(item.unitPrice || "0")
    const discount = parseFloat(item.discount || "0")
    const taxRate = parseFloat(item.taxRate || "0")

    const subtotal = qty * price - discount
    const tax = (subtotal * taxRate) / 100
    const total = subtotal + tax

    return {
      subtotal,
      tax,
      total,
    }
  }

  const calculateTotals = () => {
    let subtotal = 0
    let totalTax = 0
    let totalAmount = 0

    lineItems.forEach((item) => {
      const calc = calculateLineTotal(item)
      subtotal += calc.subtotal
      totalTax += calc.tax
      totalAmount += calc.total
    })

    return {
      subtotal: subtotal.toFixed(2),
      taxAmount: totalTax.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    }
  }

  const totals = calculateTotals()

  const addLineItem = () => {
    const newItem: LineItem = {
      inventoryItemId: "",
      itemName: "",
      description: "",
      specifications: "",
      quantity: "1",
      unitPrice: "0",
      taxRate: "18",
      discount: "0",
    }
    setLineItems([...lineItems, newItem])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    } else {
      toast.error("At least one line item is required")
    }
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    
    if (field === "inventoryItemId" && value) {
      const item = inventoryItems.find(i => i.id === value)
      if (item) {
        updated[index].itemName = item.name
        updated[index].specifications = item.specifications || ""
        if (item.estimatedPrice) {
          updated[index].unitPrice = item.estimatedPrice.toString()
        }
      }
    }
    
    setLineItems(updated)
  }

  async function onSubmit(data: FormValues) {
    setLoading(true)
    try {
      const poData = {
        ...data,
        lineItems: lineItems,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount,
      }

      const response = await fetch("/api/procurement/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(poData),
      })

      if (response.ok) {
        toast.success("Purchase Order created successfully")
        router.push("/procurement/purchase-orders")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to create PO")
      }
    } catch (error) {
      console.error("Error creating PO:", error)
      toast.error("Failed to create PO")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* PO Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Purchase Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vendorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name} ({vendor.vendorCode})
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
                    <FormLabel>Delivery Center *</FormLabel>
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
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedDeliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Delivery Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Net 30, COD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Complete delivery address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Items to Order
              </CardTitle>
              <Button type="button" onClick={addLineItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[200px]">Item</TableHead>
                    <TableHead className="w-[200px]">Description/Specs</TableHead>
                    <TableHead className="w-[80px]">Qty</TableHead>
                    <TableHead className="w-[100px]">Unit Price</TableHead>
                    <TableHead className="w-[80px]">Tax %</TableHead>
                    <TableHead className="w-[90px]">Discount</TableHead>
                    <TableHead className="w-[120px] text-right">Amount</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, index) => {
                    const lineTotal = calculateLineTotal(item)
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Select
                            value={item.inventoryItemId}
                            onValueChange={(value) => updateLineItem(index, "inventoryItemId", value)}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {inventoryItems.map((invItem) => (
                                <SelectItem key={invItem.id} value={invItem.id}>
                                  {invItem.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {!item.inventoryItemId && (
                            <Input
                              placeholder="Item name"
                              value={item.itemName}
                              onChange={(e) => updateLineItem(index, "itemName", e.target.value)}
                              className="mt-1 h-9"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Textarea
                            placeholder="Description"
                            value={item.specifications}
                            onChange={(e) => updateLineItem(index, "specifications", e.target.value)}
                            className="h-9 min-h-[36px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                            className="h-9"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(index, "unitPrice", e.target.value)}
                            className="h-9"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={item.taxRate}
                            onChange={(e) => updateLineItem(index, "taxRate", e.target.value)}
                            className="h-9"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.discount}
                            onChange={(e) => updateLineItem(index, "discount", e.target.value)}
                            className="h-9"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{lineTotal.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(index)}
                            disabled={lineItems.length === 1}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="mt-4 flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">₹{totals.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="font-medium">₹{totals.taxAmount}</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-primary">₹{totals.totalAmount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Internal notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="termsConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terms & Conditions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Terms and conditions for this PO..." 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Purchase Order
          </Button>
        </div>
      </form>
    </Form>
  )
}
