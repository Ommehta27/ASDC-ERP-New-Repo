import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    if (!hasPermission(session.role, "view_performance")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get("employeeId")

    const where: any = {}
    if (employeeId) where.employeeId = employeeId

    const reviews = await prisma.performance_reviews.findMany({
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
      orderBy: { reviewPeriodEnd: "desc" },
    })

    return NextResponse.json(reviews)
  } catch (error: any) {
    console.error("Error fetching performance reviews:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch performance reviews" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    if (!hasPermission(session.role, "create_performance_review")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()

    const review = await prisma.performance_reviews.create({
      data: {
        id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...body,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    console.error("Error creating performance review:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create performance review" },
      { status: 500 }
    )
  }
}
