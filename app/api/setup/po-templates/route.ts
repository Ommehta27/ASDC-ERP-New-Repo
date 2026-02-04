import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"

export async function GET() {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "manage_setup")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const templates = await prisma.po_templates.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("Error fetching PO templates:", error)
    return NextResponse.json({ message: "Failed to fetch PO templates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "manage_setup")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const {
      templateCode,
      name,
      description,
      paymentTerms,
      deliveryTerms,
      defaultTaxRate,
      termsConditions,
      notes,
      headerText,
      footerText,
      requiresApproval,
      autoApproveBelow,
    } = body

    // Basic validation
    if (!templateCode || !name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // If setting as default, unset other defaults
    if (body.isDefault) {
      await prisma.po_templates.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      })
    }

    // Create PO template
    const newTemplate = await prisma.po_templates.create({
      data: {
        templateCode,
        name,
        description,
        isDefault: body.isDefault || false,
        isActive: true,
        paymentTerms,
        deliveryTerms,
        defaultTaxRate: defaultTaxRate ? parseFloat(defaultTaxRate) : 0,
        includeTax: body.includeTax !== false,
        termsConditions,
        notes,
        headerText,
        footerText,
        requiresApproval: requiresApproval !== false,
        autoApproveBelow: autoApproveBelow ? parseFloat(autoApproveBelow) : undefined,
        notifyOnCreate: body.notifyOnCreate !== false,
        notifyOnApprove: body.notifyOnApprove !== false,
        notifyEmails: body.notifyEmails || [],
      },
    })

    return NextResponse.json(newTemplate, { status: 201 })
  } catch (error: any) {
    console.error("Error creating PO template:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Template code already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: "Failed to create PO template" }, { status: 500 })
  }
}
