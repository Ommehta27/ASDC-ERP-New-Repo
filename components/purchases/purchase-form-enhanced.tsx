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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, Upload, Sparkles, FileText, AlertCircle, CheckCircle2, Plus, Trash2, Calculator } from "lucide-react"
import Image from "next/image"

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
  billImageUrl: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentStatus: z.string().optional(),
  notes: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one item required"),
})

type FormValues = z.infer<typeof formSchema>
type LineItem = z.infer<typeof lineItemSchema>

interface PurchaseFormEnhancedProps {
  vendors: Array<{ id: string; vendorCode: string; name: string }>
  centers: Array<{ id: string; code: string; name: string }>
  inventoryItems: Array<{ id: string; itemCode: string; name: string; estimatedPrice?: number | null }>
}

export function PurchaseFormEnhanced({ vendors, centers, inventoryItems }: PurchaseFormEnhancedProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [billPreview, setBillPreview] = useState("")
  const [billFileType, setBillFileType] = useState("")
  const [ocrResult, setOcrResult] = useState<any>(null)
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
      billImageUrl: "",
      paymentMethod: "",
      paymentStatus: "PENDING",
      notes: "",
      lineItems: lineItems,
    },
  })

  // Calculate line item total
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

    return {
      subtotal,
      cgst,
      sgst,
      igst,
      total,
    }
  }

  // Calculate overall totals
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
    
    // Auto-fill price when item is selected
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

  const handleBillUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Store file type for preview
      setBillFileType(file.type)
      
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload/bill", {
        method: "POST",
        body: formData,
      })

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json()
        form.setValue("billImageUrl", uploadData.url)
        setBillPreview(uploadData.url)
        toast.success("Bill uploaded successfully")

        await processBillWithOCR(uploadData.url)
      } else {
        const error = await uploadResponse.json()
        toast.error(error.message || "Failed to upload bill")
      }
    } catch (error) {
      console.error("Error uploading bill:", error)
      toast.error("Failed to upload bill")
    } finally {
      setUploading(false)
    }
  }

  const processBillWithOCR = async (imageUrl: string) => {
    setProcessing(true)
    try {
      const response = await fetch("/api/ocr/extract-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      })

      const ocrData = await response.json()
      
      if (ocrData.success) {
        setOcrResult(ocrData.data)
        
        // Auto-fill form fields with extracted data
        if (ocrData.data.billNumber) form.setValue("billNumber", ocrData.data.billNumber)
        if (ocrData.data.billDate) form.setValue("billDate", ocrData.data.billDate)
        
        toast.success(ocrData.message || `Bill data extracted with ${ocrData.data.confidence.toFixed(0)}% confidence`, {
          description: ocrData.data.confidence < 70 ? "Please verify the extracted data" : "Review and submit"
        })
      } else {
        // OCR failed or low confidence
        setOcrResult(ocrData.data || {
          confidence: 0,
          rawText: ocrData.message || "Failed to extract data",
        })
        toast.warning(ocrData.message || "Could not extract bill data", {
          description: "Please enter the details manually below"
        })
      }
    } catch (error) {
      console.error("Error processing OCR:", error)
      setOcrResult({
        confidence: 0,
        rawText: "OCR processing failed",
      })
      toast.error("OCR processing failed. Please enter details manually.")
    } finally {
      setProcessing(false)
    }
  }

  async function onSubmit(data: FormValues) {
    setLoading(true)
    try {
      // Prepare purchase with line items
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
        toast.success("Purchase created successfully")
        router.push("/procurement/purchases")
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to create purchase")
      }
    } catch (error) {
      console.error("Error creating purchase:", error)
      toast.error("Failed to create purchase")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Bill Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Bill / Invoice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {billPreview && (
              <div className="space-y-2">
                {billFileType === "application/pdf" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>PDF Document Preview</span>
                  </div>
                )}
                <div className="flex justify-center">
                  {billFileType === "application/pdf" ? (
                    <div className="w-full max-w-4xl border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
                      <iframe
                        src={billPreview}
                        className="w-full h-[600px]"
                        title="Bill Preview"
                      />
                    </div>
                  ) : (
                    <div className="relative w-full max-w-md border rounded-lg overflow-hidden bg-white">
                      <Image
                        src={billPreview}
                        alt="Bill Preview"
                        width={500}
                        height={300}
                        className="object-contain w-full h-auto"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                onChange={handleBillUpload}
                disabled={uploading || processing}
                className="flex-1"
              />
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </div>
              )}
              {processing && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Extracting...
                </div>
              )}
            </div>

            {ocrResult && (
              <Alert className={
                ocrResult.confidence === 0 
                  ? "border-orange-500 bg-orange-50" 
                  : ocrResult.confidence > 70 
                    ? "border-green-500 bg-green-50" 
                    : "border-yellow-500 bg-yellow-50"
              }>
                {ocrResult.confidence === 0 ? (
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                ) : ocrResult.confidence > 70 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                <AlertTitle>
                  {ocrResult.confidence === 0 
                    ? "Could Not Extract Data" 
                    : `OCR ${ocrResult.confidence > 70 ? "Successful" : "Partial"}`
                  }
                </AlertTitle>
                <AlertDescription className="text-sm space-y-2">
                  {ocrResult.confidence === 0 ? (
                    <>
                      <p>The bill could not be processed automatically. This may be due to:</p>
                      <ul className="list-disc list-inside text-xs space-y-1 mt-2">
                        <li>Poor image quality or low resolution</li>
                        <li>Unclear or handwritten text</li>
                        <li>Unusual bill format</li>
                      </ul>
                      <p className="font-medium mt-2">
                        💡 Tip: Use{" "}
                        <a 
                          href="/procurement/purchases/manual" 
                          className="underline text-blue-600 hover:text-blue-800"
                          target="_blank"
                        >
                          Manual Entry
                        </a>
                        {" "}for faster data capture, or enter details below.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        Confidence: <strong>{ocrResult.confidence.toFixed(0)}%</strong>
                        {ocrResult.confidence < 70 && " - Please verify all extracted data"}
                      </p>
                      {ocrResult.billNumber && (
                        <p className="text-xs">
                          ✅ Extracted: Bill #{ocrResult.billNumber}
                          {ocrResult.billDate && ` • Date: ${ocrResult.billDate}`}
                          {ocrResult.totalAmount && ` • Total: ₹${ocrResult.totalAmount.toLocaleString()}`}
                        </p>
                      )}
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Purchase Details */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Details</CardTitle>
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

        {/* Line Items - NetSuite Style */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Line Items
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
                    <TableHead className="w-[150px]">Description</TableHead>
                    <TableHead className="w-[100px]">HSN</TableHead>
                    <TableHead className="w-[80px]">Qty</TableHead>
                    <TableHead className="w-[100px]">Rate</TableHead>
                    <TableHead className="w-[80px]">CGST%</TableHead>
                    <TableHead className="w-[80px]">SGST%</TableHead>
                    <TableHead className="w-[80px]">IGST%</TableHead>
                    <TableHead className="w-[90px]">Disc.</TableHead>
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
                              <SelectValue placeholder="Select or enter" />
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

            {/* Totals Summary - NetSuite Style */}
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

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || uploading || processing}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Purchase
          </Button>
        </div>
      </form>
    </Form>
  )
}
