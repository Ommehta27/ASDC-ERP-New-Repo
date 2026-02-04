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
  FormDescription,
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
import { Loader2, Plus, Trash2, Calculator } from "lucide-react"

const lineItemSchema = z.object({
  inventoryItemId: z.string().optional(),
  itemName: z.string().min(1, "Item name required"),
  description: z.string().optional(),
  hsnCode: z.string().optional(),
  quantity: z.string().min(1, "Quantity required"),
  unitPrice: z.string().min(1, "Unit price required"),
  cgstRate: z.string().optional(),
  sgstRate: z.string().optional(),
  igstRate: z.string().optional(),
  discount: z.string().optional(),
})

const formSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  centerId: z.string().min(1, "Center is required"),
  billNumber: z.string().optional(),
  billDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentStatus: z.string().optional(),
  notes: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one item required"),
})

type FormValues = z.infer<typeof formSchema>
type LineItem = z.infer<typeof lineItemSchema>

interface ManualPurchaseFormProps {
  vendors: Array<{ id: string; vendorCode: string; name: string }>
  centers: Array<{ id: string; code: string; name: string }>
  inventoryItems: Array<{ id: string; itemCode: string; name: string; estimatedPrice?: number | null }>
}

export function ManualPurchaseForm({ vendors, centers, inventoryItems }: ManualPurchaseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      inventoryItemId: "",
      itemName: "",
      description: "",
      hsnCode: "",
      quantity: "1",
      unitPrice: "0",
      cgstRate: "9",
      sgstRate: "9",
      igstRate: "0",
      discount: "0",
    },
  ])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendorId: "",
      centerId: "",
      billNumber: "",
      billDate: "",
      paymentMethod: "",
      paymentStatus: "PENDING",
      notes: "",
      lineItems: lineItems,
    },
  })

  const calculateLineTotal = (item: LineItem) => {
    const qty = parseFloat(item.quantity || "0")
    const price = parseFloat(item.unitPrice || "0")
    const discount = parseFloat(item.discount || "0")
    const cgstRate = parseFloat(item.cgstRate || "0")
    const sgstRate = parseFloat(item.sgstRate || "0")
    const igstRate = parseFloat(item.igstRate || "0")

    const subtotal = qty * price - discount
    const cgst = (subtotal * cgstRate) / 100
    const sgst = (subtotal * sgstRate) / 100
    const igst = (subtotal * igstRate) / 100
    const total = subtotal + cgst + sgst + igst

    return { subtotal, cgst, sgst, igst, total }
  }

  const calculateTotals = () => {
    let subtotal = 0
    let totalCgst = 0
    let totalSgst = 0
    let totalIgst = 0
    let totalAmount = 0

    lineItems.forEach((item) => {
      const calc = calculateLineTotal(item)
      subtotal += calc.subtotal
      totalCgst += calc.cgst
      totalSgst += calc.sgst
      totalIgst += calc.igst
      totalAmount += calc.total
    })

    return {
      subtotal: subtotal.toFixed(2),
      cgst: totalCgst.toFixed(2),
      sgst: totalSgst.toFixed(2),
      igst: totalIgst.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    }
  }

  const totals = calculateTotals()

  const addLineItem = () => {
    const newItem: LineItem = {
      inventoryItemId: "",
      itemName: "",
      description: "",
      hsnCode: "",
      quantity: "1",
      unitPrice: "0",
      cgstRate: "9",
      sgstRate: "9",
      igstRate: "0",
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
      const purchaseData = {
        ...data,
        lineItems: lineItems,
        subtotal: totals.subtotal,
        cgst: totals.cgst,
        sgst: totals.sgst,
        igst: totals.igst,
        totalAmount: totals.totalAmount,
      }

      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchaseData),
      })

      if (response.ok) {
        toast.success("Purchase recorded successfully")
        router.push("/procurement/purchases")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to record purchase")
      }
    } catch (error) {
      console.error("Error recording purchase:", error)
      toast.error("Failed to record purchase")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Purchase Details */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Information</CardTitle>
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
                name="billNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Number</FormLabel>
                    <FormControl>
                      <Input placeholder="INV-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                Purchased Items
              </CardTitle>
              <Button type="button" onClick={addLineItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="min-w-[200px]">Item</TableHead>
                    <TableHead className="min-w-[150px]">Description</TableHead>
                    <TableHead className="min-w-[100px]">HSN</TableHead>
                    <TableHead className="min-w-[80px]">Qty</TableHead>
                    <TableHead className="min-w-[100px]">Rate</TableHead>
                    <TableHead className="min-w-[80px]">CGST%</TableHead>
                    <TableHead className="min-w-[80px]">SGST%</TableHead>
                    <TableHead className="min-w-[80px]">IGST%</TableHead>
                    <TableHead className="min-w-[90px]">Disc.</TableHead>
                    <TableHead className="min-w-[120px] text-right">Amount</TableHead>
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
                          <Input
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => updateLineItem(index, "description", e.target.value)}
                            className="h-9"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="HSN"
                            value={item.hsnCode}
                            onChange={(e) => updateLineItem(index, "hsnCode", e.target.value)}
                            className="h-9"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
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
                            step="0.01"
                            value={item.cgstRate}
                            onChange={(e) => updateLineItem(index, "cgstRate", e.target.value)}
                            className="h-9"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.sgstRate}
                            onChange={(e) => updateLineItem(index, "sgstRate", e.target.value)}
                            className="h-9"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.igstRate}
                            onChange={(e) => updateLineItem(index, "igstRate", e.target.value)}
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
                  <span className="text-muted-foreground">CGST:</span>
                  <span className="font-medium">₹{totals.cgst}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SGST:</span>
                  <span className="font-medium">₹{totals.sgst}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IGST:</span>
                  <span className="font-medium">₹{totals.igst}</span>
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

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="CHEQUE">Cheque</SelectItem>
                        <SelectItem value="NEFT">NEFT</SelectItem>
                        <SelectItem value="RTGS">RTGS</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="CARD">Card</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="PARTIAL">Partial</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any additional notes..." {...field} />
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
            Record Purchase
          </Button>
        </div>
      </form>
    </Form>
  )
}
