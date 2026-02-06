import { NextRequest, NextResponse } from "next/server"

// Placeholder route - OCR functionality is available at /api/ocr/extract-bill
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: "Use /api/ocr/extract-bill for OCR functionality" },
    { status: 404 }
  )
}
