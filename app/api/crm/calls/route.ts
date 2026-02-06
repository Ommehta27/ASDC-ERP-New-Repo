import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { CallType, CallStatus, CallSentiment, CallOutcome } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    
    const inquiryId = searchParams.get("inquiryId")
    const sentiment = searchParams.get("sentiment") as CallSentiment | null
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    
    const where: any = {}
    
    if (inquiryId) where.inquiryId = inquiryId
    if (sentiment) where.sentiment = sentiment
    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }
    
    const [calls, total] = await Promise.all([
      prisma.inquiry_calls.findMany({
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
          call_transcriptions: {
            orderBy: { startTime: "asc" },
          },
        },
        orderBy: { startTime: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inquiry_calls.count({ where }),
    ])
    
    return NextResponse.json({
      calls,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Error fetching calls:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch calls" },
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
      callType,
      callStatus,
      duration,
      startTime,
      endTime,
      recordingUrl,
      transcriptUrl,
      transcript,
      summary,
      sentiment,
      sentimentScore,
      keyTopics,
      concerns,
      objections,
      commitments,
      nextSteps,
      callQuality,
      outcome,
      notes,
      aiAnalysis,
    } = body
    
    // Create call record
    const call = await prisma.inquiry_calls.create({
      data: {
        id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        inquiryId,
        callType: callType || CallType.OUTBOUND,
        callStatus: callStatus || CallStatus.COMPLETED,
        duration,
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : null,
        recordingUrl,
        transcriptUrl,
        transcript,
        summary,
        sentiment,
        sentimentScore,
        keyTopics: keyTopics || [],
        concerns: concerns || [],
        objections: objections || [],
        commitments: commitments || [],
        nextSteps,
        callQuality,
        outcome,
        notes,
        aiAnalysis,
        recordedById: session.id,
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
    
    // Update inquiry stats
    await prisma.inquiries.update({
      where: { id: inquiryId },
      data: {
        lastContactedAt: new Date(),
        totalInteractions: {
          increment: 1,
        },
        updatedAt: new Date(),
      },
    })
    
    // Update lead score based on sentiment
    if (sentiment && sentimentScore) {
      const scoreChange = sentiment === "VERY_POSITIVE" ? 15 
        : sentiment === "POSITIVE" ? 10 
        : sentiment === "NEUTRAL" ? 0 
        : sentiment === "NEGATIVE" ? -10 
        : -15
      
      const inquiry = await prisma.inquiries.findUnique({
        where: { id: inquiryId },
        select: { leadScore: true },
      })
      
      if (inquiry) {
        const newScore = Math.max(0, Math.min(100, inquiry.leadScore + scoreChange))
        await prisma.inquiries.update({
          where: { id: inquiryId },
          data: {
            leadScore: newScore,
            leadTemperature: newScore >= 70 ? "HOT" : newScore >= 40 ? "WARM" : "COLD",
          },
        })
        
        // Log score change
        await prisma.lead_scoring_history.create({
          data: {
            id: `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            inquiryId,
            score: newScore,
            previousScore: inquiry.leadScore,
            change: scoreChange,
            reason: `Call sentiment: ${sentiment}`,
            factors: { sentiment, sentimentScore },
            calculatedBy: session.id,
          },
        })
      }
    }
    
    return NextResponse.json(call)
  } catch (error: any) {
    console.error("Error creating call:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create call" },
      { status: 500 }
    )
  }
}
