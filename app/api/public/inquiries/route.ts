import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
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
    } = body

    // Basic validation
    if (!email || !firstName || !lastName || !dateOfBirth || !gender) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Get default center (or first active center)
    const defaultCenter = await prisma.centers.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
    })

    if (!defaultCenter) {
      return NextResponse.json({ message: "No active center found" }, { status: 400 })
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

    // Create user
    const newUser = await prisma.users.create({
      data: {
        email,
        password: "", // Will be set when converted to enrolled student
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
        centerId: defaultCenter.id,
        status: "INQUIRY",
      },
    })

    // Create inquiry
    const newInquiry = await prisma.inquiries.create({
      data: {
        inquiryNumber,
        studentId: newStudent.id,
        source: "WEBSITE",
        status: "NEW",
        priority: "MEDIUM",
        interestedCourses: interestedCourses || [],
        centerId: defaultCenter.id,
        createdById: newUser.id, // Self-created
      },
    })

    return NextResponse.json({
      message: "Inquiry submitted successfully",
      inquiryNumber,
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating public inquiry:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: "Failed to submit inquiry" }, { status: 500 })
  }
}
