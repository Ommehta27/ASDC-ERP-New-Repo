import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { FollowUpType, FollowUpStatus, InquiryPriority } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    
    const inquiryId = searchParams.get("inquiryId")
    const status = searchParams.get("status") as FollowUpStatus | null
    const assignedToId = searchParams.get("assignedToId")
    const overdue = searchParams.get("overdue") === "true"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    
    const where: any = {}
    
    if (inquiryId) where.inquiryId = inquiryId
    if (status) where.status = status
    if (assignedToId) where.assignedToId = assignedToId
    if (overdue) {
      where.status = "PENDING"
      where.scheduledDate = { lt: new Date() }
    }
    
    const [followUps, total] = await Promise.all([
      prisma.inquiry_follow_ups.findMany({
        where,
        include: {
          inquiries: {
            include: {
              students: {
                include: {
                  users: {
                    select: {
                      firstName: true,
                      lastName: true,
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: [
          { scheduledDate: "asc" },
          { priority: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inquiry_follow_ups.count({ where }),
    ])
    
    return NextResponse.json({
      followUps,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Error fetching follow-ups:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch follow-ups" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    
    const {
      inquiryId,
      followUpType,
      priority,
      scheduledDate,
      assignedToId,
      notes,
    } = body
    
    const followUp = await prisma.inquiry_follow_ups.create({
      data: {
        id: `followup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        inquiryId,
        followUpType: followUpType || FollowUpType.CALL,
        priority: priority || InquiryPriority.MEDIUM,
        scheduledDate: new Date(scheduledDate),
        assignedToId: assignedToId || session.id,
        notes,
        status: FollowUpStatus.PENDING,
        createdById: session.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        inquiries: {
          include: {
            students: {
              include: {
                users: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    })
    
    // Update inquiry follow-up date
    await prisma.inquiries.update({
      where: { id: inquiryId },
      data: {
        followUpDate: new Date(scheduledDate),
        updatedAt: new Date(),
      },
    })
    
    return NextResponse.json(followUp)
  } catch (error: any) {
    console.error("Error creating follow-up:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create follow-up" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    const { followUpId, status, outcome, nextFollowUpDate } = body
    
    const followUp = await prisma.inquiry_follow_ups.update({
      where: { id: followUpId },
      data: {
        status: status || FollowUpStatus.COMPLETED,
        completedDate: new Date(),
        outcome,
        nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
        updatedAt: new Date(),
      },
      include: {
        inquiries: true,
      },
    })
    
    // Update inquiry next follow-up date if provided
    if (nextFollowUpDate) {
      await prisma.inquiries.update({
        where: { id: followUp.inquiryId },
        data: {
          followUpDate: new Date(nextFollowUpDate),
          updatedAt: new Date(),
        },
      })
    }
    
    return NextResponse.json(followUp)
  } catch (error: any) {
    console.error("Error updating follow-up:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update follow-up" },
      { status: 500 }
    )
  }
}
