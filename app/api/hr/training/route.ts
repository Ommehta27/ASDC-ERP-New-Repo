import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    if (!hasPermission(session.role, "view_training")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const training = await prisma.training_programs.findMany({
      orderBy: { startDate: "desc" },
    })

    return NextResponse.json(training)
  } catch (error: any) {
    console.error("Error fetching training programs:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch training programs" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    if (!hasPermission(session.role, "create_training")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()

    const training = await prisma.training_programs.create({
      data: {
        id: `train_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...body,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(training, { status: 201 })
  } catch (error: any) {
    console.error("Error creating training program:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create training program" },
      { status: 500 }
    )
  }
}
