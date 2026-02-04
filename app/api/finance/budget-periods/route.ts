import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { nanoid } from "nanoid"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "view_budgets")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const periods = await prisma.budget_periods.findMany({
      orderBy: [
        { fiscalYear: "desc" },
        { startDate: "desc" },
      ],
    })

    return NextResponse.json(periods)
  } catch (error) {
    console.error("Error fetching budget periods:", error)
    return NextResponse.json(
      { message: "Failed to fetch budget periods" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "manage_budget_periods")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Basic validation
    if (!body.periodName || !body.periodType || !body.startDate || !body.endDate || !body.fiscalYear) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check for overlapping periods
    const overlappingPeriod = await prisma.budget_periods.findFirst({
      where: {
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(body.startDate) } },
              { endDate: { gte: new Date(body.startDate) } },
            ],
          },
          {
            AND: [
              { startDate: { lte: new Date(body.endDate) } },
              { endDate: { gte: new Date(body.endDate) } },
            ],
          },
        ],
        isActive: true,
      },
    })

    if (overlappingPeriod) {
      return NextResponse.json(
        { message: "Budget period overlaps with existing period: " + overlappingPeriod.periodName },
        { status: 409 }
      )
    }

    // Create budget period
    const period = await prisma.budget_periods.create({
      data: {
        id: nanoid(),
        periodName: body.periodName,
        periodType: body.periodType,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        fiscalYear: parseInt(body.fiscalYear),
        quarter: body.quarter || null,
        month: body.month || null,
        description: body.description || null,
        isActive: body.isActive ?? true,
        createdBy: user.id,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(period, { status: 201 })
  } catch (error: any) {
    console.error("Error creating budget period:", error)
    return NextResponse.json(
      { message: error.message || "Failed to create budget period" },
      { status: 500 }
    )
  }
}
