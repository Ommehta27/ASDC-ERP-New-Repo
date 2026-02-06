import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    if (!hasPermission(session.role, "view_employees")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const exitClearances = await prisma.exit_clearance.findMany({
      include: {
        employees: {
          include: {
            users: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { resignationDate: "desc" },
    })

    return NextResponse.json(exitClearances)
  } catch (error: any) {
    console.error("Error fetching exit clearances:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch exit clearances" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    if (!hasPermission(session.role, "process_exit")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { employeeId, resignationDate, lastWorkingDate, reason, exitType } = body

    const exitClearance = await prisma.exit_clearance.create({
      data: {
        id: `exit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        employeeId,
        resignationDate: new Date(resignationDate),
        lastWorkingDate: new Date(lastWorkingDate),
        reason: reason || null,
        exitType: exitType || "RESIGNATION",
        status: "INITIATED",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(exitClearance, { status: 201 })
  } catch (error: any) {
    console.error("Error creating exit clearance:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create exit clearance" },
      { status: 500 }
    )
  }
}
