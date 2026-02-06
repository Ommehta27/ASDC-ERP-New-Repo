import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "view_students")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const centerId = searchParams.get("centerId")
    const courseId = searchParams.get("courseId")
    const search = searchParams.get("search")

    const where: any = {}

    if (status) where.status = status
    if (centerId) where.centerId = centerId
    if (courseId) where.courseId = courseId
    if (search) {
      where.OR = [
        { enrollmentNumber: { contains: search, mode: "insensitive" } },
        { students: { users: { firstName: { contains: search, mode: "insensitive" } } } },
        { students: { users: { lastName: { contains: search, mode: "insensitive" } } } },
      ]
    }

    // For non-super-admin, filter by center
    if (user.role !== "SUPER_ADMIN" && user.centerId) {
      where.centerId = user.centerId
    }

    const enrollments = await prisma.enrollments.findMany({
      where,
      include: {
        students: {
          include: {
            users: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
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
        batches: {
          select: {
            batchName: true,
            batchCode: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error("Error fetching enrollments:", error)
    return NextResponse.json({ message: "Failed to fetch enrollments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "create_students")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const {
      studentId,
      courseId,
      batchId,
      centerId,
      totalFees,
      paidAmount,
      paymentStatus,
      startDate,
    } = body

    // Basic validation
    if (!studentId || !courseId || !centerId || !totalFees) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Generate enrollment number
    const lastEnrollment = await prisma.enrollments.findFirst({
      orderBy: { createdAt: "desc" },
      select: { enrollmentNumber: true },
    })

    let enrollmentNumber = "ENR-0001"
    if (lastEnrollment) {
      const lastNumber = parseInt(lastEnrollment.enrollmentNumber.split("-")[1])
      enrollmentNumber = `ENR-${String(lastNumber + 1).padStart(4, "0")}`
    }

    // Create enrollment
    const newEnrollment = await prisma.enrollments.create({
      data: {
        id: randomUUID(),
        enrollmentNumber,
        studentId,
        courseId,
        batchId: batchId || null,
        centerId,
        status: "ACTIVE",
        totalFees: parseFloat(totalFees),
        paidAmount: paidAmount ? parseFloat(paidAmount) : 0,
        paymentStatus: paymentStatus || "PENDING",
        startDate: startDate ? new Date(startDate) : null,
        createdById: user.id,
        updatedAt: new Date(),
      },
      include: {
        students: {
          include: {
            users: true,
          },
        },
        courses: true,
        centers: true,
        batches: true,
      },
    })

    return NextResponse.json(newEnrollment, { status: 201 })
  } catch (error: any) {
    console.error("Error creating enrollment:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Enrollment number already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: "Failed to create enrollment" }, { status: 500 })
  }
}
