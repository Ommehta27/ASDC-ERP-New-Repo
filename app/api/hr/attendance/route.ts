import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    if (!hasPermission(session.role, "view_attendance")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get("employeeId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {}
    if (employeeId) where.employeeId = employeeId
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const attendance = await prisma.attendance.findMany({
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
      },
      orderBy: { date: "desc" },
    })

    return NextResponse.json(attendance)
  } catch (error: any) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch attendance" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    if (!hasPermission(session.role, "mark_attendance")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { employeeId, date, checkIn, checkOut, status, remarks } = body

    const attendance = await prisma.attendance.create({
      data: {
        id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        employeeId,
        date: new Date(date),
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        status: status || "PRESENT",
        remarks: remarks || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(attendance, { status: 201 })
  } catch (error: any) {
    console.error("Error marking attendance:", error)
    return NextResponse.json(
      { error: error.message || "Failed to mark attendance" },
      { status: 500 }
    )
  }
}
