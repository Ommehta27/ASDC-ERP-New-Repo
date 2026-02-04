import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "create_students")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, priority } = body

    // Check if status is CONVERTED - handle auto-conversion
    if (status === "CONVERTED") {
      // Use a transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // Get the inquiry with student data
        const inquiry = await tx.inquiries.findUnique({
          where: { id },
          include: {
            students: true,
          },
        })

        if (!inquiry) {
          throw new Error("Inquiry not found")
        }

        // Update student status to ENROLLED
        await tx.students.update({
          where: { id: inquiry.studentId },
          data: { status: "ENROLLED" },
        })

        // Update inquiry status
        const updatedInquiry = await tx.inquiries.update({
          where: { id },
          data: {
            status: "CONVERTED",
            updatedAt: new Date(),
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

        return updatedInquiry
      })

      return NextResponse.json(result)
    }

    // Regular status/priority update
    const updateData: any = {
      updatedAt: new Date(),
    }
    
    if (status) updateData.status = status
    if (priority) updateData.priority = priority

    const updatedInquiry = await prisma.inquiries.update({
      where: { id },
      data: updateData,
      include: {
        students: {
          include: {
            users: true,
          },
        },
        centers: true,
      },
    })

    return NextResponse.json(updatedInquiry)
  } catch (error: any) {
    console.error("Error updating inquiry:", error)
    return NextResponse.json({ message: error.message || "Failed to update inquiry" }, { status: 500 })
  }
}
