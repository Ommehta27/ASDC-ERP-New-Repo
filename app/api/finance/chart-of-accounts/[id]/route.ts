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
    
    if (!user || !hasPermission(user.role, "view_finance")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const account = await prisma.chart_of_accounts.findUnique({
      where: { id },
      include: {
        chart_of_accounts: {
          select: {
            id: true,
            accountCode: true,
            accountName: true,
          },
        },
        other_chart_of_accounts: {
          select: {
            id: true,
            accountCode: true,
            accountName: true,
          },
        },
      },
    })

    if (!account) {
      return NextResponse.json({ message: "Account not found" }, { status: 404 })
    }

    return NextResponse.json(account)
  } catch (error) {
    console.error("Error fetching account:", error)
    return NextResponse.json({ message: "Failed to fetch account" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "manage_finance")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Check if account exists
    const existingAccount = await prisma.chart_of_accounts.findUnique({
      where: { id },
    })

    if (!existingAccount) {
      return NextResponse.json({ message: "Account not found" }, { status: 404 })
    }

    // Check if it's a system account
    if (existingAccount.isSystemAccount) {
      return NextResponse.json(
        { message: "Cannot modify system accounts" },
        { status: 403 }
      )
    }

    // Basic validation
    if (!body.accountCode || !body.accountName || !body.accountType || !body.accountCategory) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Calculate level based on parent
    let level = existingAccount.level
    if (body.parentAccountId !== existingAccount.parentAccountId) {
      if (body.parentAccountId) {
        const parent = await prisma.chart_of_accounts.findUnique({
          where: { id: body.parentAccountId },
          select: { level: true },
        })
        level = parent ? parent.level + 1 : 0
      } else {
        level = 0
      }
    }

    // Update account
    const updatedAccount = await prisma.chart_of_accounts.update({
      where: { id },
      data: {
        accountCode: body.accountCode,
        accountName: body.accountName,
        accountType: body.accountType,
        accountCategory: body.accountCategory,
        accountSubCategory: body.accountSubCategory || null,
        parentAccountId: body.parentAccountId || null,
        level,
        description: body.description,
        
        // GST fields
        gstApplicable: body.gstApplicable || false,
        gstRate: body.gstRate || null,
        hsnSacCode: body.hsnSacCode || null,
        
        // TDS fields
        tdsApplicable: body.tdsApplicable || false,
        tdsSection: body.tdsSection || null,
        tdsRate: body.tdsRate || null,
        
        // TCS fields
        tcsApplicable: body.tcsApplicable || false,
        tcsSection: body.tcsSection || null,
        tcsRate: body.tcsRate || null,
        
        // Balance fields - only update opening balance if explicitly provided
        openingBalance: body.openingBalance !== undefined ? body.openingBalance : existingAccount.openingBalance,
        openingBalanceType: body.openingBalanceType || existingAccount.openingBalanceType,
        
        // Budget fields
        budgetAmount: body.budgetAmount || null,
        budgetPeriod: body.budgetPeriod || null,
        
        // Control fields
        isActive: body.isActive ?? existingAccount.isActive,
        isControlAccount: body.isControlAccount || false,
        allowPosting: body.allowPosting ?? true,
        requiresReconciliation: body.requiresReconciliation || false,
        
        updatedBy: user.id,
      },
    })

    return NextResponse.json(updatedAccount)
  } catch (error: any) {
    console.error("Error updating account:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Account code already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: "Failed to update account" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "manage_finance")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if account exists
    const existingAccount = await prisma.chart_of_accounts.findUnique({
      where: { id },
      include: {
        other_chart_of_accounts: true,
      },
    })

    if (!existingAccount) {
      return NextResponse.json({ message: "Account not found" }, { status: 404 })
    }

    // Check if it's a system account
    if (existingAccount.isSystemAccount) {
      return NextResponse.json(
        { message: "Cannot delete system accounts" },
        { status: 403 }
      )
    }

    // Check if it has child accounts
    if (existingAccount.other_chart_of_accounts.length > 0) {
      return NextResponse.json(
        { message: "Cannot delete account with sub-accounts. Delete sub-accounts first." },
        { status: 400 }
      )
    }

    // Check if account has transactions
    const hasTransactions = await prisma.budget_transactions.count({
      where: {
        accountId: id,
      },
    })

    if (hasTransactions > 0) {
      return NextResponse.json(
        { message: "Cannot delete account with existing transactions. Deactivate instead." },
        { status: 400 }
      )
    }

    // Soft delete by deactivating
    await prisma.chart_of_accounts.update({
      where: { id },
      data: {
        isActive: false,
        updatedBy: user.id,
      },
    })

    return NextResponse.json({ message: "Account deactivated successfully" })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ message: "Failed to delete account" }, { status: 500 })
  }
}
