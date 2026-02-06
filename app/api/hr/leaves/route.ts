import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    if (!hasPermission(session.role, "view_leave")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get("employeeId")
    const status = searchParams.get("status")

    const where: any = {}
    if (employeeId) where.employeeId = employeeId
    if (status) where.status = status

    const leaves = await prisma.leave_applications.findMany({
      where,
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
        leave_types: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: { appliedDate: "desc" },
    })

    return NextResponse.json(leaves)
  } catch (error: any) {
    console.error("Error fetching leave applications:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch leave applications" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    if (!hasPermission(session.role, "apply_leave")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { employeeId, leaveTypeId, startDate, endDate, days, reason } = body

    const leave = await prisma.leave_applications.create({
      data: {
        id: `leave_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        applicationCode: `LEAVE-${Date.now()}`,
        employeeId,
        leaveTypeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days,
        reason,
        status: "PENDING",
        appliedDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(leave, { status: 201 })
  } catch (error: any) {
    console.error("Error creating leave application:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create leave application" },
      { status: 500 }
    )
  }
}
