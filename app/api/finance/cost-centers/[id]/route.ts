import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth()
    const { id } = await params
    
    if (!hasPermission(session.role, "view_finance")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const costCenter = await prisma.cost_centers.findUnique({
      where: { id },
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

    if (!costCenter) {
      return NextResponse.json({ error: "Cost center not found" }, { status: 404 })
    }

    return NextResponse.json(costCenter)
  } catch (error: any) {
    console.error("Error fetching cost center:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch cost center" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth()
    const { id } = await params
    
    if (!hasPermission(session.role, "manage_finance")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const {
      centerName,
      description,
      centerId,
      managerId,
      isActive,
    } = body

    const costCenter = await prisma.cost_centers.update({
      where: { id },
      data: {
        centerName,
        description: description || null,
        centerId: centerId || null,
        managerId: managerId || null,
        isActive: isActive ?? true,
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

    return NextResponse.json(costCenter)
  } catch (error: any) {
    console.error("Error updating cost center:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update cost center" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth()
    const { id } = await params
    
    if (!hasPermission(session.role, "manage_finance")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if cost center has associated budgets
    const budgets = await prisma.budgets.count({
      where: { costCenterId: id },
    })

    if (budgets > 0) {
      return NextResponse.json(
        { error: "Cannot delete cost center with associated budgets" },
        { status: 400 }
      )
    }

    await prisma.cost_centers.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Cost center deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting cost center:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete cost center" },
      { status: 500 }
    )
  }
}
