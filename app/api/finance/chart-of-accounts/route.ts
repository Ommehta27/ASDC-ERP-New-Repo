import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "view_finance")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const accountType = searchParams.get("accountType")
    const accountCategory = searchParams.get("accountCategory")
    const search = searchParams.get("search")
    const isActive = searchParams.get("isActive")

    const where: any = {}

    if (accountType) where.accountType = accountType
    if (accountCategory) where.accountCategory = accountCategory
    if (isActive !== null) where.isActive = isActive === "true"
    if (search) {
      where.OR = [
        { accountCode: { contains: search, mode: "insensitive" } },
        { accountName: { contains: search, mode: "insensitive" } },
      ]
    }

    const accounts = await prisma.chart_of_accounts.findMany({
      where,
      orderBy: [
        { accountCode: "asc" },
      ],
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error("Error fetching chart of accounts:", error)
    return NextResponse.json({ message: "Failed to fetch accounts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "manage_finance")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Basic validation
    if (!body.accountCode || !body.accountName || !body.accountType || !body.accountCategory) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Calculate level based on parent
    let level = 0
    if (body.parentAccountId) {
      const parent = await prisma.chart_of_accounts.findUnique({
        where: { id: body.parentAccountId },
        select: { level: true },
      })
      level = parent ? parent.level + 1 : 0
    }

    // Create account
    const newAccount = await prisma.chart_of_accounts.create({
      data: {
        id: crypto.randomUUID(),
        accountCode: body.accountCode,
        accountName: body.accountName,
        accountType: body.accountType,
        accountCategory: body.accountCategory,
        accountSubCategory: body.accountSubCategory || undefined,
        parentAccountId: body.parentAccountId || undefined,
        level,
        description: body.description,
        
        // GST fields
        gstApplicable: body.gstApplicable || false,
        gstRate: body.gstRate,
        hsnSacCode: body.hsnSacCode,
        
        // TDS fields
        tdsApplicable: body.tdsApplicable || false,
        tdsSection: body.tdsSection,
        tdsRate: body.tdsRate,
        
        // TCS fields
        tcsApplicable: body.tcsApplicable || false,
        tcsSection: body.tcsSection,
        tcsRate: body.tcsRate,
        
        // Balance fields
        openingBalance: body.openingBalance || 0,
        openingBalanceType: body.openingBalanceType || "DEBIT",
        currentBalance: body.openingBalance || 0,
        
        // Budget fields
        budgetAmount: body.budgetAmount,
        budgetPeriod: body.budgetPeriod,
        
        // Control fields
        isActive: body.isActive ?? true,
        isControlAccount: body.isControlAccount || false,
        allowPosting: body.allowPosting ?? true,
        requiresReconciliation: body.requiresReconciliation || false,
        
        createdBy: user.id,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(newAccount, { status: 201 })
  } catch (error: any) {
    console.error("Error creating account:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Account code already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: "Failed to create account" }, { status: 500 })
  }
}
