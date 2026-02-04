import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "view_centers")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const state = searchParams.get("state")
    const search = searchParams.get("search")

    const where: any = {}

    if (status) where.status = status
    if (state) where.state = state
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ]
    }

    const centers = await prisma.centers.findMany({
      where,
      include: {
        _count: {
          select: {
            students: true,
            enrollments: true,
            employees: true,
            center_inventories: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(centers)
  } catch (error) {
    console.error("Error fetching centers:", error)
    return NextResponse.json({ message: "Failed to fetch centers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "create_centers")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const {
      code,
      name,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      capacity,
    } = body

    // Basic validation
    if (!code || !name || !address || !city || !state || !pincode || !phone || !capacity) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Create center
    const newCenter = await prisma.centers.create({
      data: {
        id: randomUUID(),
        code,
        name,
        address,
        city,
        state,
        pincode,
        phone,
        email,
        capacity: parseInt(capacity),
        status: "ACTIVE",
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(newCenter, { status: 201 })
  } catch (error: any) {
    console.error("Error creating center:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Center code already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: "Failed to create center" }, { status: 500 })
  }
}
