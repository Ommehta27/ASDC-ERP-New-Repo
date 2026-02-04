import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"

export async function GET() {
  try {
    const companyInfo = await prisma.company_info.findFirst({
      orderBy: { createdAt: "desc" },
    })

    if (!companyInfo) {
      return NextResponse.json({
        companyName: "ASDC Vantage",
        logo: null,
      })
    }

    return NextResponse.json({
      companyName: companyInfo.companyName,
      logo: companyInfo.logo,
      tagline: companyInfo.tagline,
    })
  } catch (error) {
    console.error("Error fetching company info:", error)
    return NextResponse.json({ companyName: "ASDC Vantage", logo: null })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "manage_setup")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const existingCompany = await prisma.company_info.findFirst()

    if (existingCompany) {
      // Update existing
      const updatedCompany = await prisma.company_info.update({
        where: { id: existingCompany.id },
        data: {
          ...body,
          updatedBy: user.id,
        },
      })
      return NextResponse.json(updatedCompany)
    } else {
      // Create new
      const newCompany = await prisma.company_info.create({
        data: {
          ...body,
          createdBy: user.id,
        },
      })
      return NextResponse.json(newCompany, { status: 201 })
    }
  } catch (error) {
    console.error("Error saving company info:", error)
    return NextResponse.json({ message: "Failed to save company info" }, { status: 500 })
  }
}
