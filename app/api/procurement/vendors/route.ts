import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "view_procurement")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const where: any = {}

    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { vendorCode: { contains: search, mode: "insensitive" } },
        { contactPerson: { contains: search, mode: "insensitive" } },
      ]
    }

    const vendors = await prisma.vendors.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(vendors)
  } catch (error) {
    console.error("Error fetching vendors:", error)
    return NextResponse.json({ message: "Failed to fetch vendors" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "manage_procurement")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const {
      vendorCode,
      name,
      contactPerson,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      gstin,
      pan,
      bankName,
      bankAccountNumber,
      ifscCode,
    } = body

    // Basic validation
    if (!vendorCode || !name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Create vendor
    const newVendor = await prisma.vendors.create({
      data: {
        id: randomUUID(),
        vendorCode,
        name,
        contactPerson,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        gstin,
        pan,
        bankName,
        bankAccountNumber,
        ifscCode,
        status: "ACTIVE",
        isActive: true,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(newVendor, { status: 201 })
  } catch (error: any) {
    console.error("Error creating vendor:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Vendor code already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: "Failed to create vendor" }, { status: 500 })
  }
}
