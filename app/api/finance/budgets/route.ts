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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const periodId = searchParams.get("periodId")

    const budgets = await prisma.budgets.findMany({
      where: {
        ...(status && { status }),
        ...(periodId && { periodId }),
      },
      include: {
        budget_periods: {
          select: {
            periodName: true,
            fiscalYear: true,
          },
        },
        cost_centers: {
          select: {
            centerCode: true,
            centerName: true,
          },
        },
        chart_of_accounts: {
          select: {
            accountCode: true,
            accountName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(budgets)
  } catch (error) {
    console.error("Error fetching budgets:", error)
    return NextResponse.json(
      { message: "Failed to fetch budgets" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "create_budgets")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Basic validation
    if (!body.budgetName || !body.budgetPeriodId || !body.accountId || !body.totalAmount) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Generate budget number
    const year = new Date().getFullYear()
    const count = await prisma.budgets.count()
    const budgetNumber = `BUD-${year}-${String(count + 1).padStart(4, "0")}`

    // Create budget
    const budget = await prisma.budgets.create({
      data: {
        id: nanoid(),
        budgetNumber,
        budgetName: body.budgetName,
        budgetType: body.budgetType || "ANNUAL",
        periodId: body.budgetPeriodId,
        costCenterId: body.costCenterId || null,
        accountId: body.accountId,
        totalAmount: parseFloat(body.totalAmount),
        allocatedAmount: 0,
        committedAmount: 0,
        actualAmount: 0,
        variance: 0,
        variancePercent: 0,
        notes: body.notes || null,
        status: "DRAFT",
        approvalLevel: 0,
        createdBy: user.id,
        updatedAt: new Date(),
      },
      include: {
        budget_periods: true,
        cost_centers: true,
        chart_of_accounts: true,
      },
    })

    // Create budget allocations if provided
    if (body.monthlyAllocations && Array.isArray(body.monthlyAllocations)) {
      const allocations = body.monthlyAllocations.map((allocation: any) => ({
        id: nanoid(),
        budgetId: budget.id,
        month: allocation.month,
        year: allocation.year,
        allocatedAmount: parseFloat(allocation.amount) || 0,
        actualAmount: 0,
        variance: 0,
        notes: null,
        updatedAt: new Date(),
      }))

      await prisma.budget_allocations.createMany({
        data: allocations,
      })
    }

    return NextResponse.json(budget, { status: 201 })
  } catch (error: any) {
    console.error("Error creating budget:", error)
    return NextResponse.json(
      { message: error.message || "Failed to create budget" },
      { status: 500 }
    )
  }
}
