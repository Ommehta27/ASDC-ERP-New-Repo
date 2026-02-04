import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "view_courses")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const where: any = {}

    if (status) where.status = status
    if (category) where.category = category
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ]
    }

    const courses = await prisma.courses.findMany({
      where,
      include: {
        centers: {
          select: {
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ message: "Failed to fetch courses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "create_courses")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const {
      code,
      name,
      description,
      category,
      difficulty,
      duration,
      fees,
      prerequisites,
      centerId,
    } = body

    // Basic validation
    if (!code || !name || !category || !duration || !fees) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Create course
    const newCourse = await prisma.courses.create({
      data: {
        id: randomUUID(),
        code,
        name,
        description,
        category,
        difficulty: difficulty || "BEGINNER",
        duration: parseInt(duration),
        fees: parseFloat(fees),
        prerequisites,
        centerId: centerId || undefined,
        status: "ACTIVE",
        updatedAt: new Date(),
      },
      include: {
        centers: true,
      },
    })

    return NextResponse.json(newCourse, { status: 201 })
  } catch (error: any) {
    console.error("Error creating course:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Course code already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: "Failed to create course" }, { status: 500 })
  }
}
