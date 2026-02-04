import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "view_students")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const centerId = searchParams.get("centerId")
    const search = searchParams.get("search")

    const where: any = {}

    if (status) where.status = status
    if (centerId) where.centerId = centerId
    if (search) {
      where.OR = [
        { placementNumber: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { jobTitle: { contains: search, mode: "insensitive" } },
        { students: { users: { firstName: { contains: search, mode: "insensitive" } } } },
        { students: { users: { lastName: { contains: search, mode: "insensitive" } } } },
      ]
    }

    // For non-super-admin, filter by center
    if (user.role !== "SUPER_ADMIN" && user.centerId) {
      where.centerId = user.centerId
    }

    const placements = await prisma.placements.findMany({
      where,
      include: {
        students: {
          include: {
            users: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        centers: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(placements)
  } catch (error) {
    console.error("Error fetching placements:", error)
    return NextResponse.json({ message: "Failed to fetch placements" }, { status: 500 })
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
      companyName,
      companyType,
      jobTitle,
      jobDescription,
      location,
      salary,
      joiningDate,
      centerId,
    } = body

    // Basic validation
    if (!studentId || !companyName || !companyType || !jobTitle || !location || !centerId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Generate placement number
    const lastPlacement = await prisma.placements.findFirst({
      orderBy: { createdAt: "desc" },
      select: { placementNumber: true },
    })

    let placementNumber = "PLC-0001"
    if (lastPlacement) {
      const lastNumber = parseInt(lastPlacement.placementNumber.split("-")[1])
      placementNumber = `PLC-${String(lastNumber + 1).padStart(4, "0")}`
    }

    // Create placement
    const newPlacement = await prisma.placements.create({
      data: {
        placementNumber,
        studentId,
        companyName,
        companyType,
        jobTitle,
        jobDescription,
        location,
        salary: salary ? parseFloat(salary) : undefined,
        joiningDate: joiningDate ? new Date(joiningDate) : undefined,
        centerId,
        status: "IN_PROGRESS",
        createdById: user.id,
      },
      include: {
        students: {
          include: {
            users: true,
          },
        },
        centers: true,
      },
    })

    return NextResponse.json(newPlacement, { status: 201 })
  } catch (error: any) {
    console.error("Error creating placement:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Placement number already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: "Failed to create placement" }, { status: 500 })
  }
}
