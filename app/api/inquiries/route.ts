import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"

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
    const limit = searchParams.get("limit")

    const where: any = {
      status: {
        notIn: ["CONVERTED", "ENROLLED"], // Exclude converted and enrolled inquiries
      },
    }

    if (status) where.status = status
    if (centerId) where.centerId = centerId
    if (search) {
      where.OR = [
        { inquiryNumber: { contains: search, mode: "insensitive" } },
        { students: { users: { firstName: { contains: search, mode: "insensitive" } } } },
        { students: { users: { lastName: { contains: search, mode: "insensitive" } } } },
      ]
    }

    // For non-super-admin, filter by center
    if (user.role !== "SUPER_ADMIN" && user.centerId) {
      where.centerId = user.centerId
    }

    const inquiries = await prisma.inquiries.findMany({
      where,
      include: {
        students: {
          include: {
            users: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        centers: {
          select: {
            name: true,
            code: true,
          },
        },
        users_inquiries_createdByIdTousers: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        users_inquiries_assignedToIdTousers: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit ? parseInt(limit) : undefined,
    })

    return NextResponse.json(inquiries)
  } catch (error) {
    console.error("Error fetching inquiries:", error)
    return NextResponse.json({ message: "Failed to fetch inquiries" }, { status: 500 })
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
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      pincode,
      qualification,
      interestedCourses,
      source,
      centerId,
    } = body

    // Basic validation
    if (!email || !firstName || !lastName || !dateOfBirth || !gender || !centerId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Generate inquiry number
    const lastInquiry = await prisma.inquiries.findFirst({
      orderBy: { createdAt: "desc" },
      select: { inquiryNumber: true },
    })

    let inquiryNumber = "INQ-0001"
    if (lastInquiry) {
      const lastNumber = parseInt(lastInquiry.inquiryNumber.split("-")[1])
      inquiryNumber = `INQ-${String(lastNumber + 1).padStart(4, "0")}`
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

    // Create user first (for inquiry stage)
    const newUser = await prisma.users.create({
      data: {
        email,
        password: "", // Will be set when converted to student
        firstName,
        lastName,
        phone,
        role: "STUDENT",
        status: "ACTIVE",
      },
    })

    // Create student record with INQUIRY status
    const newStudent = await prisma.students.create({
      data: {
        userId: newUser.id,
        studentId,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        address: address || "",
        city: city || "",
        state: state || "",
        pincode: pincode || "",
        qualification: qualification || "",
        centerId,
        status: "INQUIRY",
      },
    })

    // Create inquiry
    const newInquiry = await prisma.inquiries.create({
      data: {
        inquiryNumber,
        studentId: newStudent.id,
        source: source || "DIRECT",
        status: "NEW",
        priority: "MEDIUM",
        interestedCourses: interestedCourses || [],
        centerId,
        createdById: user.id,
      },
      include: {
        students: {
          include: {
            users: true,
          },
        },
        centers: true,
      },
    })

    return NextResponse.json(newInquiry, { status: 201 })
  } catch (error: any) {
    console.error("Error creating inquiry:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: "Failed to create inquiry" }, { status: 500 })
  }
}
