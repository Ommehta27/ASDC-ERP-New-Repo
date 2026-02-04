import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "view_budgets")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const budget = await prisma.budgets.findUnique({
      where: { id },
      include: {
        budget_periods: {
          select: {
            periodName: true,
            fiscalYear: true,
            startDate: true,
            endDate: true,
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
        budget_allocations: {
          orderBy: [
            { year: "asc" },
            { month: "asc" },
          ],
        },
      },
    })

    if (!budget) {
      return NextResponse.json({ message: "Budget not found" }, { status: 404 })
    }

    // Calculate variance
    const variance = budget.totalAmount - budget.actualAmount
    const variancePercent = (variance / budget.totalAmount) * 100

    return NextResponse.json({
      ...budget,
      variance,
      variancePercent,
    })
  } catch (error) {
    console.error("Error fetching budget:", error)
    return NextResponse.json(
      { message: "Failed to fetch budget" },
      { status: 500 }
    )
  }
}
