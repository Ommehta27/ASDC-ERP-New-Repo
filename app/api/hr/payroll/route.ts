import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    if (!hasPermission(session.role, "view_payroll")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get("employeeId")
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    const where: any = {}
    if (employeeId) where.employeeId = employeeId
    if (month) where.month = parseInt(month)
    if (year) where.year = parseInt(year)

    const payroll = await prisma.payroll.findMany({
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
      orderBy: [{ year: "desc" }, { month: "desc" }],
    })

    return NextResponse.json(payroll)
  } catch (error: any) {
    console.error("Error fetching payroll:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch payroll" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    if (!hasPermission(session.role, "process_payroll")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const {
      employeeId,
      month,
      year,
      basicSalary,
      allowances = 0,
      deductions = 0,
      taxDeducted = 0,
      pfDeduction = 0,
      esiDeduction = 0,
    } = body

    const grossSalary = basicSalary + allowances
    const totalDeductions = deductions + taxDeducted + pfDeduction + esiDeduction
    const netSalary = grossSalary - totalDeductions

    const payroll = await prisma.payroll.create({
      data: {
        id: `payroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        payrollNumber: `PAY-${year}-${month}-${Date.now()}`,
        employeeId,
        month,
        year,
        basicSalary,
        allowances,
        deductions,
        grossSalary,
        netSalary,
        taxDeducted,
        pfDeduction,
        esiDeduction,
        status: "DRAFT",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(payroll, { status: 201 })
  } catch (error: any) {
    console.error("Error processing payroll:", error)
    return NextResponse.json(
      { error: error.message || "Failed to process payroll" },
      { status: 500 }
    )
  }
}
