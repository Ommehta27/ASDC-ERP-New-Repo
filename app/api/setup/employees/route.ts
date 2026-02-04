import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "manage_setup")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const department = searchParams.get("department")

    const where: any = {}
    if (status) where.employmentStatus = status
    if (department) where.department = department

    const employees = await prisma.employees.findMany({
      where,
      include: {
        users: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
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
    
    if (!user || !hasPermission(user.role, "manage_setup")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const {
      userId,
      employeeCode,
      designation,
      department,
      employmentType,
      dateOfJoining,
      primaryCenterId,
      salary,
    } = body

    // Basic validation
    if (!userId || !employeeCode || !designation || !department) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Create employee
    const newEmployee = await prisma.employees.create({
      data: {
        userId,
        employeeCode,
        designation,
        department,
        employmentType: employmentType || "FULL_TIME",
        employmentStatus: "ACTIVE",
        dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : new Date(),
        primaryCenterId,
        salary: salary ? parseFloat(salary) : undefined,
        createdBy: user.id,
      },
      include: {
        users: true,
        centers: true,
      },
    })

    return NextResponse.json(newEmployee, { status: 201 })
  } catch (error: any) {
    console.error("Error creating employee:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Employee code already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: "Failed to create employee" }, { status: 500 })
  }
}
