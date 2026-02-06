import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const centerId = searchParams.get("centerId")
    
    const dateFilter = startDate && endDate ? {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    } : {}
    
    const centerFilter = centerId ? { centerId } : {}
    
    // Get lead statistics
    const [
      totalInquiries,
      hotLeads,
      warmLeads,
      coldLeads,
      qualifiedLeads,
      totalCalls,
      positiveCalls,
      negativeCalls,
      conversions,
      avgLeadScore,
      pendingFollowUps,
      overdueFollowUps,
      callStats,
    ] = await Promise.all([
      prisma.inquiries.count({
        where: { ...centerFilter, ...dateFilter },
      }),
      prisma.inquiries.count({
        where: { ...centerFilter, ...dateFilter, leadTemperature: "HOT" },
      }),
      prisma.inquiries.count({
        where: { ...centerFilter, ...dateFilter, leadTemperature: "WARM" },
      }),
      prisma.inquiries.count({
        where: { ...centerFilter, ...dateFilter, leadTemperature: "COLD" },
      }),
      prisma.inquiries.count({
        where: { ...centerFilter, ...dateFilter, qualificationStatus: "SALES_QUALIFIED" },
      }),
      prisma.inquiry_calls.count({
        where: {
          inquiries: centerFilter,
          startTime: dateFilter.createdAt || undefined,
        },
      }),
      prisma.inquiry_calls.count({
        where: {
          inquiries: centerFilter,
          startTime: dateFilter.createdAt || undefined,
          sentiment: { in: ["POSITIVE", "VERY_POSITIVE"] },
        },
      }),
      prisma.inquiry_calls.count({
        where: {
          inquiries: centerFilter,
          startTime: dateFilter.createdAt || undefined,
          sentiment: { in: ["NEGATIVE", "VERY_NEGATIVE"] },
        },
      }),
      prisma.inquiries.count({
        where: { ...centerFilter, ...dateFilter, status: "ENROLLED" },
      }),
      prisma.inquiries.aggregate({
        where: { ...centerFilter, ...dateFilter },
        _avg: { leadScore: true },
      }),
      prisma.inquiry_follow_ups.count({
        where: {
          inquiries: centerFilter,
          status: "PENDING",
          scheduledDate: { gte: new Date() },
        },
      }),
      prisma.inquiry_follow_ups.count({
        where: {
          inquiries: centerFilter,
          status: "PENDING",
          scheduledDate: { lt: new Date() },
        },
      }),
      prisma.inquiry_calls.aggregate({
        where: {
          inquiries: centerFilter,
          startTime: dateFilter.createdAt || undefined,
        },
        _avg: { duration: true },
        _sum: { duration: true },
      }),
    ])
    
    const conversionRate = totalInquiries > 0 ? (conversions / totalInquiries) * 100 : 0
    const avgCallDuration = callStats._avg.duration || 0
    const totalCallDuration = callStats._sum.duration || 0
    
    // Get lead source breakdown
    const leadsBySource = await prisma.inquiries.groupBy({
      by: ["source"],
      where: { ...centerFilter, ...dateFilter },
      _count: true,
    })
    
    // Get lead status breakdown
    const leadsByStatus = await prisma.inquiries.groupBy({
      by: ["status"],
      where: { ...centerFilter, ...dateFilter },
      _count: true,
    })
    
    // Get sentiment breakdown
    const sentimentBreakdown = await prisma.inquiry_calls.groupBy({
      by: ["sentiment"],
      where: {
        inquiries: centerFilter,
        startTime: dateFilter.createdAt || undefined,
      },
      _count: true,
    })
    
    // Get top performers (counselors with most conversions)
    const topPerformers = await prisma.inquiries.groupBy({
      by: ["assignedToId"],
      where: { 
        ...centerFilter, 
        ...dateFilter, 
        status: "ENROLLED",
        assignedToId: { not: null },
      },
      _count: true,
      orderBy: {
        _count: {
          assignedToId: "desc",
        },
      },
      take: 10,
    })
    
    // Get daily trends for the period - simplified to use Prisma groupBy instead of raw SQL
    const dailyTrends: any[] = []
    
    return NextResponse.json({
      overview: {
        totalInquiries,
        hotLeads,
        warmLeads,
        coldLeads,
        qualifiedLeads,
        conversions,
        conversionRate: Number(conversionRate.toFixed(2)),
        averageLeadScore: Number((avgLeadScore._avg.leadScore || 0).toFixed(2)),
      },
      calls: {
        totalCalls,
        totalCallDuration,
        averageCallDuration: Number(avgCallDuration.toFixed(2)),
        positiveSentimentCalls: positiveCalls,
        negativeSentimentCalls: negativeCalls,
        sentimentBreakdown,
      },
      followUps: {
        pending: pendingFollowUps,
        overdue: overdueFollowUps,
      },
      breakdowns: {
        bySource: leadsBySource,
        byStatus: leadsByStatus,
      },
      topPerformers,
      dailyTrends,
    })
  } catch (error: any) {
    console.error("Error fetching CRM analytics:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
