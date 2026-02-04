"use client"

import { useEffect, useState, useRef } from "react"
import QRCode from "qrcode"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, QrCode, Smartphone } from "lucide-react"
import { toast } from "sonner"

export function InquiryQRDialog() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [open, setOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (open) {
      generateQRCode()
    }
  }, [open])

  const generateQRCode = async () => {
    try {
      const baseUrl = window.location.origin
      const publicFormUrl = `${baseUrl}/public/inquiry`

      const url = await QRCode.toDataURL(publicFormUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })

      setQrCodeUrl(url)

      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, publicFormUrl, {
          width: 400,
          margin: 2,
        })
      }
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast.error("Failed to generate QR code")
    }
  }

  const handleDownload = () => {
    if (!qrCodeUrl) return

    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = "inquiry-form-qr-code.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("QR code downloaded")
  }

  const handlePrint = () => {
    if (!qrCodeUrl) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inquiry Form QR Code</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .container {
              text-align: center;
              max-width: 500px;
            }
            h1 {
              font-size: 28px;
              margin-bottom: 10px;
              color: #000;
            }
            .subtitle {
              font-size: 16px;
              color: #666;
              margin-bottom: 30px;
            }
            img {
              max-width: 400px;
              height: auto;
              margin: 20px 0;
              border: 4px solid #000;
            }
            .url {
              font-size: 14px;
              color: #333;
              word-break: break-all;
              margin-top: 20px;
              font-weight: 600;
            }
            .instructions {
              font-size: 14px;
              color: #666;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>ASDC Vantage</h1>
            <p class="subtitle">Student Inquiry Form</p>
            <img src="${qrCodeUrl}" alt="QR Code" />
            <p class="instructions">Scan this QR code with your phone camera to fill the inquiry form</p>
            <p class="url">${window.location.origin}/public/inquiry</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 250)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <QrCode className="mr-2 h-4 w-4" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Student Inquiry QR Code</DialogTitle>
          <DialogDescription>
            Share this QR code for students to access the inquiry form on mobile
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center p-6 bg-white rounded-lg border-2">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Inquiry Form QR Code"
                className="w-full max-w-sm"
              />
            ) : (
              <div className="w-full max-w-sm aspect-square bg-muted animate-pulse rounded" />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
            <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 dark:text-blue-100">
              Students can scan with their phone camera or visit the URL below
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground break-all">
              {typeof window !== "undefined" && `${window.location.origin}/public/inquiry`}
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={handlePrint} className="flex-1">
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
