import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import path from "path"
import fs from "fs"
import { createWorker } from "tesseract.js"

// OCR extraction using regex patterns
function extractBillData(text: string) {
  // Common Indian bill patterns
  const patterns = {
    // Invoice/Bill Number patterns
    billNumber: [
      /(?:invoice|bill|receipt)[\s#:]*([A-Z0-9\-\/]+)/i,
      /(?:no|number|num|#)[\s:]*([A-Z0-9\-\/]+)/i,
    ],
    // Date patterns (DD/MM/YYYY, DD-MM-YYYY, etc.)
    date: [
      /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/,
      /date[\s:]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
    ],
    // Amount patterns
    total: [
      /total[\s:]*(?:rs\.?|₹|inr)?[\s]*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      /grand\s*total[\s:]*(?:rs\.?|₹|inr)?[\s]*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      /amount[\s:]*(?:rs\.?|₹|inr)?[\s]*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
    ],
    cgst: [/cgst[\s:@]*(?:rs\.?|₹|inr)?[\s]*(\d+(?:\.\d{2})?)/i],
    sgst: [/sgst[\s:@]*(?:rs\.?|₹|inr)?[\s]*(\d+(?:\.\d{2})?)/i],
    igst: [/igst[\s:@]*(?:rs\.?|₹|inr)?[\s]*(\d+(?:\.\d{2})?)/i],
    // GST Number patterns
    gstin: [/gstin?[\s:]*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})/i],
  }

  const extracted: any = {
    confidence: 0,
    rawText: text,
  }

  // Extract bill number
  for (const pattern of patterns.billNumber) {
    const match = text.match(pattern)
    if (match) {
      extracted.billNumber = match[1].trim()
      break
    }
  }

  // Extract date
  for (const pattern of patterns.date) {
    const match = text.match(pattern)
    if (match) {
      // Normalize date format to YYYY-MM-DD
      const dateStr = match[1]
      const parts = dateStr.split(/[-\/]/)
      if (parts.length === 3) {
        let [day, month, year] = parts
        // Handle 2-digit years
        if (year.length === 2) {
          year = `20${year}`
        }
        extracted.billDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
      }
      break
    }
  }

  // Extract total
  for (const pattern of patterns.total) {
    const match = text.match(pattern)
    if (match) {
      const amount = match[1].replace(/,/g, "")
      extracted.totalAmount = parseFloat(amount)
      break
    }
  }

  // Extract CGST
  for (const pattern of patterns.cgst) {
    const match = text.match(pattern)
    if (match) {
      extracted.cgst = parseFloat(match[1])
      break
    }
  }

  // Extract SGST
  for (const pattern of patterns.sgst) {
    const match = text.match(pattern)
    if (match) {
      extracted.sgst = parseFloat(match[1])
      break
    }
  }

  // Extract IGST
  for (const pattern of patterns.igst) {
    const match = text.match(pattern)
    if (match) {
      extracted.igst = parseFloat(match[1])
      break
    }
  }

  // Extract GSTIN
  for (const pattern of patterns.gstin) {
    const match = text.match(pattern)
    if (match) {
      extracted.gstin = match[1]
      break
    }
  }

  // Calculate subtotal if we have total and taxes
  if (extracted.totalAmount) {
    const taxes = (extracted.cgst || 0) + (extracted.sgst || 0) + (extracted.igst || 0)
    extracted.subtotal = extracted.totalAmount - taxes
  }

  // Calculate confidence based on fields extracted
  const fieldsExtracted = Object.keys(extracted).filter(k => k !== 'confidence' && k !== 'rawText' && extracted[k]).length
  extracted.confidence = Math.min((fieldsExtracted / 7) * 100, 95) // Max 95% for regex-based extraction

  return extracted
}

// Process PDF to extract text
async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    // Dynamic import for CommonJS module
    const pdfParse = require("pdf-parse")
    const dataBuffer = fs.readFileSync(filePath)
    const data = await pdfParse(dataBuffer)
    return data.text
  } catch (error) {
    console.error("Error extracting text from PDF:", error)
    throw new Error("Failed to extract text from PDF")
  }
}

// Process image using Tesseract OCR
async function extractTextFromImage(filePath: string): Promise<string> {
  const worker = await createWorker("eng")
  try {
    const { data: { text } } = await worker.recognize(filePath)
    await worker.terminate()
    return text
  } catch (error) {
    await worker.terminate()
    console.error("Error extracting text from image:", error)
    throw new Error("Failed to extract text from image")
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { imageUrl, text } = body

    // If text is provided, use it directly (for testing or manual entry)
    if (text) {
      const extracted = extractBillData(text)
      return NextResponse.json({
        success: true,
        data: extracted,
        message: "Bill data extracted successfully",
      })
    }

    // If imageUrl is provided, process the file
    if (imageUrl) {
      const filePath = path.join(process.cwd(), "public", imageUrl)
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { message: "File not found", success: false },
          { status: 404 }
        )
      }

      const fileExtension = path.extname(imageUrl).toLowerCase()
      let extractedText = ""

      try {
        // Process based on file type
        if (fileExtension === ".pdf") {
          console.log("Processing PDF:", filePath)
          extractedText = await extractTextFromPDF(filePath)
        } else if ([".png", ".jpg", ".jpeg", ".webp"].includes(fileExtension)) {
          console.log("Processing Image with Tesseract:", filePath)
          extractedText = await extractTextFromImage(filePath)
        } else {
          return NextResponse.json(
            { 
              message: "Unsupported file type. Please upload PNG, JPG, WebP, or PDF.",
              success: false 
            },
            { status: 400 }
          )
        }

        console.log("Extracted text length:", extractedText.length)
        console.log("First 200 chars:", extractedText.substring(0, 200))

        // Parse the extracted text
        const extracted = extractBillData(extractedText)

        if (extracted.confidence === 0) {
          return NextResponse.json({
            success: false,
            message: "Could not extract bill data. Please check the image quality or enter manually.",
            data: extracted,
          })
        }

        return NextResponse.json({
          success: true,
          data: extracted,
          message: `Bill data extracted with ${extracted.confidence.toFixed(0)}% confidence`,
        })

      } catch (error: any) {
        console.error("Error processing file:", error)
        return NextResponse.json({
          success: false,
          message: error.message || "Failed to process file",
          data: {
            confidence: 0,
            rawText: "",
          },
        })
      }
    }

    return NextResponse.json({ message: "No image URL or text provided" }, { status: 400 })
  } catch (error: any) {
    console.error("Error processing OCR:", error)
    return NextResponse.json(
      { message: error.message || "Failed to process OCR" },
      { status: 500 }
    )
  }
}
