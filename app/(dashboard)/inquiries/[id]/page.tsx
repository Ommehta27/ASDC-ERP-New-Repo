import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { InquiryDetailClient } from "@/components/inquiries/inquiry-detail-client"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InquiryDetailPage({ params }: PageProps) {
  const session = await requireAuth()
  const { id } = await params

  const inquiry = await prisma.inquiries.findUnique({
    where: { id },
    include: {
      students: {
        include: {
          users: true,
        },
      },
      centers: true,
      users_inquiries_assignedToIdTousers: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      users_inquiries_createdByIdTousers: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      inquiry_notes: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      inquiry_calls: {
        orderBy: { startTime: "desc" },
        include: {
          call_transcriptions: {
            orderBy: { startTime: "asc" },
          },
        },
      },
      inquiry_activities: {
        orderBy: { createdAt: "desc" },
      },
      inquiry_follow_ups: {
        orderBy: { scheduledDate: "asc" },
      },
      lead_scoring_history: {
        orderBy: { calculatedAt: "desc" },
        take: 10,
      },
    },
  })

  if (!inquiry) {
    notFound()
  }

  return <InquiryDetailClient inquiry={inquiry} currentUserId={session.id} />
}
