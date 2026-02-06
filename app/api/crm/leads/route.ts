import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { LeadTemperature, QualificationStatus } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(req.url)
    
    const temperature = searchParams.get("temperature") as LeadTemperature | null
    const status = searchParams.get("status")
    const qualification = searchParams.get("qualification") as QualificationStatus | null
    const centerId = searchParams.get("centerId")
    const assignedToId = searchParams.get("assignedToId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    
    const where: any = {}
    
    if (temperature) where.leadTemperature = temperature
    if (status) where.status = status
    if (qualification) where.qualificationStatus = qualification
    if (centerId) where.centerId = centerId
    if (assignedToId) where.assignedToId = assignedToId
    
    const [inquiries, total] = await Promise.all([
      prisma.inquiries.findMany({
        where,
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
          users_inquiries_assignedToIdTousers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          centers: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          inquiry_calls: {
            orderBy: { startTime: "desc" },
            take: 1,
          },
          inquiry_activities: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          inquiry_follow_ups: {
            where: { status: "PENDING" },
            orderBy: { scheduledDate: "asc" },
            take: 1,
          },
        },
        orderBy: [
          { leadScore: "desc" },
          { updatedAt: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inquiries.count({ where }),
    ])
    
    return NextResponse.json({
      inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Error fetching leads:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch leads" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    const { inquiryId, leadScore, leadTemperature, qualificationStatus, conversionProbability } = body
    
    const updated = await prisma.inquiries.update({
      where: { id: inquiryId },
      data: {
        leadScore,
        leadTemperature,
        qualificationStatus,
        conversionProbability,
        updatedAt: new Date(),
      },
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
    })
    
    // Log scoring history
    await prisma.lead_scoring_history.create({
      data: {
        id: `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        inquiryId,
        score: leadScore,
        previousScore: leadScore - 10, // You should pass the actual previous score
        change: 10,
        reason: "Manual update",
        calculatedBy: session.id,
        calculatedAt: new Date(),
      },
    })
    
    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("Error updating lead:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update lead" },
      { status: 500 }
    )
  }
}
