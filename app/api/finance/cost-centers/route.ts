import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    if (!hasPermission(session.role, "view_finance")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const costCenters = await prisma.cost_centers.findMany({
      include: {
        centers: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(costCenters)
  } catch (error: any) {
    console.error("Error fetching cost centers:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch cost centers" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    if (!hasPermission(session.role, "manage_finance")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const {
      centerCode,
      centerName,
      description,
      centerId,
      managerId,
      isActive,
    } = body

    // Check if cost center code already exists
    const existing = await prisma.cost_centers.findUnique({
      where: { centerCode },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Cost center code already exists" },
        { status: 400 }
      )
    }

    const costCenter = await prisma.cost_centers.create({
      data: {
        id: `cc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        centerCode,
        centerName,
        description: description || null,
        centerId: centerId || null,
        managerId: managerId || null,
        isActive: isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        centers: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    return NextResponse.json(costCenter, { status: 201 })
  } catch (error: any) {
    console.error("Error creating cost center:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create cost center" },
      { status: 500 }
    )
  }
}
