import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"

export async function GET() {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "manage_setup")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const uoms = await prisma.units_of_measure.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(uoms)
  } catch (error) {
    console.error("Error fetching UOMs:", error)
    return NextResponse.json({ message: "Failed to fetch UOMs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "manage_setup")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const {
      code,
      name,
      abbreviation,
      type,
      description,
      baseUnit,
      conversionFactor,
    } = body

    // Basic validation
    if (!code || !name || !abbreviation || !type) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Create UOM
    const newUOM = await prisma.units_of_measure.create({
      data: {
        code,
        name,
        abbreviation,
        type,
        description,
        baseUnit,
        conversionFactor: conversionFactor ? parseFloat(conversionFactor) : undefined,
        isActive: true,
      },
    })

    return NextResponse.json(newUOM, { status: 201 })
  } catch (error: any) {
    console.error("Error creating UOM:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ message: "UOM code already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: "Failed to create UOM" }, { status: 500 })
  }
}
