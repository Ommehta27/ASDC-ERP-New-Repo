import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { ActivityType, ActivityStatus } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    
    const inquiryId = searchParams.get("inquiryId")
    const activityType = searchParams.get("activityType") as ActivityType | null
    const status = searchParams.get("status") as ActivityStatus | null
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    
    const where: any = {}
    
    if (inquiryId) where.inquiryId = inquiryId
    if (activityType) where.activityType = activityType
    if (status) where.status = status
    
    const [activities, total] = await Promise.all([
      prisma.inquiry_activities.findMany({
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
          { scheduledAt: "desc" },
          { createdAt: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inquiry_activities.count({ where }),
    ])
    
    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Error fetching activities:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch activities" },
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
      activityType,
      title,
      description,
      duration,
      outcome,
      scheduledAt,
      completedAt,
      status,
      metadata,
    } = body
    
    const activity = await prisma.inquiry_activities.create({
      data: {
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        inquiryId,
        activityType: activityType || ActivityType.CALL,
        title,
        description,
        duration,
        outcome,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        completedAt: completedAt ? new Date(completedAt) : null,
        status: status || ActivityStatus.PENDING,
        createdById: session.id,
        completedById: completedAt ? session.id : null,
        metadata,
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
    
    // Update inquiry interaction count
    await prisma.inquiries.update({
      where: { id: inquiryId },
      data: {
        totalInteractions: {
          increment: 1,
        },
        lastContactedAt: new Date(),
        updatedAt: new Date(),
      },
    })
    
    return NextResponse.json(activity)
  } catch (error: any) {
    console.error("Error creating activity:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create activity" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    const { activityId, status, outcome, completedAt } = body
    
    const activity = await prisma.inquiry_activities.update({
      where: { id: activityId },
      data: {
        status,
        outcome,
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        completedById: session.id,
        updatedAt: new Date(),
      },
      include: {
        inquiries: true,
      },
    })
    
    return NextResponse.json(activity)
  } catch (error: any) {
    console.error("Error updating activity:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update activity" },
      { status: 500 }
    )
  }
}
