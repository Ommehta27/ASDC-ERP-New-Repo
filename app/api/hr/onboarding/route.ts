import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    if (!hasPermission(session.role, "view_onboarding")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const onboarding = await prisma.employee_onboarding.findMany({
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
        onboarding_tasks: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(onboarding)
  } catch (error: any) {
    console.error("Error fetching onboarding records:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch onboarding records" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    if (!hasPermission(session.role, "manage_onboarding")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { employeeId, taskId } = body

    const onboarding = await prisma.employee_onboarding.create({
      data: {
        id: `onboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        employeeId,
        taskId,
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(onboarding, { status: 201 })
  } catch (error: any) {
    console.error("Error creating onboarding record:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create onboarding record" },
      { status: 500 }
    )
  }
}
