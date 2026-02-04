import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "view_batches")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const centerId = searchParams.get("centerId")
    const courseId = searchParams.get("courseId")

    const where: any = { isActive: true }
    
    if (status) where.status = status
    if (centerId) where.centerId = centerId
    if (courseId) where.courseId = courseId

    const batches = await prisma.batches.findMany({
      where,
      include: {
        courses: {
          select: {
            name: true,
            code: true,
          },
        },
        centers: {
          select: {
            name: true,
            code: true,
          },
        },
        employees: {
          select: {
            users: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            batch_students: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    })

    return NextResponse.json(batches)
  } catch (error) {
    console.error("Error fetching batches:", error)
    return NextResponse.json({ message: "Failed to fetch batches" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "create_batches")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.batchCode || !body.batchName || !body.courseId || !body.centerId || !body.startDate) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if batch code already exists
    const existingBatch = await prisma.batches.findUnique({
      where: { batchCode: body.batchCode },
    })

    if (existingBatch) {
      return NextResponse.json({ message: "Batch code already exists" }, { status: 409 })
    }

    // Create batch
    const newBatch = await prisma.batches.create({
      data: {
        batchCode: body.batchCode,
        batchName: body.batchName,
        courseId: body.courseId,
        centerId: body.centerId,
        instructorId: body.instructorId === "none" ? null : body.instructorId || null,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        capacity: body.capacity || 30,
        status: body.status || "UPCOMING",
        timing: body.timing,
        days: body.days,
        description: body.description,
        createdBy: user.id,
      },
      include: {
        courses: true,
        centers: true,
        employees: {
          include: {
            users: true,
          },
        },
      },
    })

    return NextResponse.json(newBatch, { status: 201 })
  } catch (error: any) {
    console.error("Error creating batch:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Batch code already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: "Failed to create batch" }, { status: 500 })
  }
}
