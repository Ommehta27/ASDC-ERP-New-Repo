import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "view_students")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const centerId = searchParams.get("centerId")
    const search = searchParams.get("search")

    const where: any = {
      status: {
        not: "INQUIRY", // Exclude inquiry status students
      },
    }

    if (status) where.status = status
    if (centerId) where.centerId = centerId
    if (search) {
      where.OR = [
        { studentId: { contains: search, mode: "insensitive" } },
        { users: { firstName: { contains: search, mode: "insensitive" } } },
        { users: { lastName: { contains: search, mode: "insensitive" } } },
      ]
    }

    // For non-super-admin, filter by center
    if (user.role !== "SUPER_ADMIN" && user.centerId) {
      where.centerId = user.centerId
    }

    const students = await prisma.students.findMany({
      where,
      include: {
        users: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
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

    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ message: "Failed to fetch students" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "create_students")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      fatherName,
      motherName,
      guardianPhone,
      bloodGroup,
      emergencyContact,
      aadharNumber,
      address,
      city,
      state,
      pincode,
      qualification,
      university,
      yearOfPassing,
      percentage,
      centerId,
    } = body

    // Basic validation
    if (!email || !password || !firstName || !lastName || !dateOfBirth || !gender || !centerId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Generate student ID
    const lastStudent = await prisma.students.findFirst({
      orderBy: { createdAt: "desc" },
      select: { studentId: true },
    })

    let studentId = "STU-0001"
    if (lastStudent) {
      const lastNumber = parseInt(lastStudent.studentId.split("-")[1])
      studentId = `STU-${String(lastNumber + 1).padStart(4, "0")}`
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user first
    const newUser = await prisma.users.create({
      data: {
        id: randomUUID(),
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: "STUDENT",
        status: "ACTIVE",
        updatedAt: new Date(),
      },
    })

    // Create student
    const newStudent = await prisma.students.create({
      data: {
        id: randomUUID(),
        userId: newUser.id,
        studentId,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        fatherName,
        motherName,
        guardianPhone,
        bloodGroup,
        emergencyContact,
        aadharNumber,
        address,
        city,
        state,
        pincode,
        qualification,
        university,
        yearOfPassing: yearOfPassing ? parseInt(yearOfPassing) : undefined,
        percentage: percentage ? parseFloat(percentage) : undefined,
        centerId,
        status: "ENROLLED",
        updatedAt: new Date(),
      },
      include: {
        users: true,
        centers: true,
      },
    })

    return NextResponse.json(newStudent, { status: 201 })
  } catch (error: any) {
    console.error("Error creating student:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Email or student ID already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: "Failed to create student" }, { status: 500 })
  }
}
