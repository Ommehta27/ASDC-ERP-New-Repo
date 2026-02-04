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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, Upload, Sparkles, FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import Image from "next/image"

const formSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  centerId: z.string().min(1, "Center is required"),
  billNumber: z.string().optional(),
  billDate: z.string().optional(),
  billImageUrl: z.string().optional(),
  subtotal: z.string().optional(),
  cgst: z.string().optional(),
  sgst: z.string().optional(),
  igst: z.string().optional(),
  totalAmount: z.string().min(1, "Total amount is required"),
  paymentMethod: z.string().optional(),
  paymentStatus: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface PurchaseFormProps {
  vendors: Array<{ id: string; vendorCode: string; name: string }>
  centers: Array<{ id: string; code: string; name: string }>
}

export function PurchaseForm({ vendors, centers }: PurchaseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [billPreview, setBillPreview] = useState("")
  const [ocrResult, setOcrResult] = useState<any>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendorId: "",
      centerId: "",
      billNumber: "",
      billDate: "",
      billImageUrl: "",
      subtotal: "",
      cgst: "",
      sgst: "",
      igst: "",
      totalAmount: "",
      paymentMethod: "",
      paymentStatus: "PENDING",
      notes: "",
    },
  })

  const handleBillUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Upload file
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

        // Trigger OCR processing
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

      if (response.ok) {
        const ocrData = await response.json()
        
        if (ocrData.success) {
          setOcrResult(ocrData.data)
          
          // Auto-fill form with extracted data
          if (ocrData.data.billNumber) form.setValue("billNumber", ocrData.data.billNumber)
          if (ocrData.data.billDate) form.setValue("billDate", ocrData.data.billDate)
          if (ocrData.data.subtotal) form.setValue("subtotal", ocrData.data.subtotal.toString())
          if (ocrData.data.cgst) form.setValue("cgst", ocrData.data.cgst.toString())
          if (ocrData.data.sgst) form.setValue("sgst", ocrData.data.sgst.toString())
          if (ocrData.data.igst) form.setValue("igst", ocrData.data.igst.toString())
          if (ocrData.data.totalAmount) form.setValue("totalAmount", ocrData.data.totalAmount.toString())
          
          toast.success(`Bill data extracted with ${ocrData.data.confidence.toFixed(0)}% confidence`)
        } else {
          toast.info(ocrData.message || "Manual entry required")
        }
      }
    } catch (error) {
      console.error("Error processing OCR:", error)
      toast.error("OCR processing failed. Please enter details manually.")
    } finally {
      setProcessing(false)
    }
  }

  async function onSubmit(data: FormValues) {
    setLoading(true)
    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
        {/* Bill Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Bill / Invoice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {billPreview && (
              <div className="flex justify-center">
                <div className="relative w-full max-w-md border rounded-lg overflow-hidden">
                  <Image
                    src={billPreview}
                    alt="Bill Preview"
                    width={500}
                    height={300}
                    className="object-contain"
                  />
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

            {/* OCR Result */}
            {ocrResult && (
              <Alert className={ocrResult.confidence > 70 ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"}>
                {ocrResult.confidence > 70 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                <AlertTitle>
                  OCR Extraction {ocrResult.confidence > 70 ? "Successful" : "Partial"}
                </AlertTitle>
                <AlertDescription>
                  <p className="text-sm">
                    Extracted data with <strong>{ocrResult.confidence.toFixed(0)}%</strong> confidence.
                    {ocrResult.confidence < 70 && " Please verify and complete missing fields."}
                  </p>
                  {ocrResult.rawText && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer hover:underline">View raw text</summary>
                      <pre className="text-xs mt-2 p-2 bg-white dark:bg-gray-900 rounded border overflow-auto max-h-32">
                        {ocrResult.rawText.substring(0, 500)}
                      </pre>
                    </details>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <p className="text-sm text-muted-foreground">
              <FileText className="inline h-3 w-3 mr-1" />
              Upload a bill/invoice image. Our AI will automatically extract details.
            </p>
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

        {/* Amount Details */}
        <Card>
          <CardHeader>
            <CardTitle>Amount Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subtotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtotal</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cgst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CGST</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sgst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SGST</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="igst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IGST</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormDescription>
                      Final amount including all taxes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                          <SelectValue placeholder="Select payment method" />
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
