import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "view_employees")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const managersOnly = searchParams.get("managersOnly") === "true"

    const where: any = {}
    
    if (managersOnly) {
      where.employmentStatus = "ACTIVE"
    }

    const employees = await prisma.employees.findMany({
      where,
      include: {
        users: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        centers: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(employees)
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ message: "Failed to fetch employees" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "create_employees")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email || !body.phone || !body.password) {
      return NextResponse.json({ message: "Missing required user fields" }, { status: 400 })
    }

    if (!body.employeeCode || !body.designation || !body.department) {
      return NextResponse.json({ message: "Missing required employee fields" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: body.email },
    })

    if (existingUser) {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 })
    }

    // Check if employee code already exists
    const existingEmployee = await prisma.employees.findUnique({
      where: { employeeCode: body.employeeCode },
    })

    if (existingEmployee) {
      return NextResponse.json({ message: "Employee code already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10)

    // Create user first
    const newUser = await prisma.users.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        password: hashedPassword,
        role: "USER", // Default role
        isActive: true,
      },
    })

    // Create employee record
    const newEmployee = await prisma.employees.create({
      data: {
        employeeCode: body.employeeCode,
        userId: newUser.id,
        designation: body.designation,
        department: body.department,
        employmentType: body.employmentType || "FULL_TIME",
        employmentStatus: body.employmentStatus || "ACTIVE",
        dateOfJoining: body.dateOfJoining ? new Date(body.dateOfJoining) : new Date(),
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        gender: body.gender,
        bloodGroup: body.bloodGroup,
        reportingManagerId: body.reportingManagerId || undefined,
        primaryCenterId: body.primaryCenterId || undefined,
        approvalLimit: body.approvalLimit || 0,
        canApprovePOs: body.canApprovePOs || false,
        emergencyName: body.emergencyName,
        emergencyContact: body.emergencyContact,
        emergencyRelation: body.emergencyRelation,
        salary: body.salary,
        bankName: body.bankName,
        bankAccountNumber: body.bankAccountNumber,
        ifscCode: body.ifscCode,
        panNumber: body.panNumber,
        address: body.address,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        createdBy: user.id,
      },
      include: {
        users: true,
      },
    })

    return NextResponse.json(newEmployee, { status: 201 })
  } catch (error: any) {
    console.error("Error creating employee:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Email or employee code already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: "Failed to create employee" }, { status: 500 })
  }
}
