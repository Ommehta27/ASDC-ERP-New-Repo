import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth()
    const { id } = await params
    
    if (!hasPermission(session.role, "view_approval_hierarchies") && !hasPermission(session.role, "manage_setup")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const hierarchy = await prisma.approval_hierarchies.findUnique({
      where: { id },
      include: {
        approval_levels: {
          orderBy: { levelNumber: "asc" },
        },
        approval_requests: {
          orderBy: { submittedAt: "desc" },
          take: 10,
        },
      },
    })

    if (!hierarchy) {
      return NextResponse.json({ error: "Hierarchy not found" }, { status: 404 })
    }

    return NextResponse.json(hierarchy)
  } catch (error: any) {
    console.error("Error fetching approval hierarchy:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch approval hierarchy" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth()
    const { id } = await params
    
    if (!hasPermission(session.role, "edit_approval_hierarchies") && !hasPermission(session.role, "manage_setup")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const {
      name,
      description,
      isActive,
      isDefault,
      conditions,
      levels,
    } = body

    // If this is set as default, unset other defaults for this entity type
    if (isDefault) {
      const hierarchy = await prisma.approval_hierarchies.findUnique({
        where: { id },
        select: { entityType: true },
      })

      if (hierarchy) {
        await prisma.approval_hierarchies.updateMany({
          where: {
            entityType: hierarchy.entityType,
            isDefault: true,
            id: { not: id },
          },
          data: {
            isDefault: false,
          },
        })
      }
    }

    // Delete existing levels
    await prisma.approval_levels.deleteMany({
      where: { hierarchyId: id },
    })

    // Update hierarchy with new levels
    const updated = await prisma.approval_hierarchies.update({
      where: { id },
      data: {
        name,
        description,
        isActive,
        isDefault,
        conditions,
        updatedAt: new Date(),
        approval_levels: {
          create: levels.map((level: any, index: number) => ({
            id: `level_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
            levelNumber: level.levelNumber || index + 1,
            levelName: level.levelName,
            description: level.description,
            approverType: level.approverType,
            approverRole: level.approverRole,
            specificApprovers: level.specificApprovers || [],
            minApprovals: level.minApprovals || 1,
            autoApproveAmount: level.autoApproveAmount,
            requiresAll: level.requiresAll ?? false,
            timeoutHours: level.timeoutHours,
            escalationUserId: level.escalationUserId,
            conditions: level.conditions,
            isActive: level.isActive ?? true,
            sortOrder: level.sortOrder || index,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
        },
      },
      include: {
        approval_levels: {
          orderBy: { levelNumber: "asc" },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("Error updating approval hierarchy:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update approval hierarchy" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth()
    const { id } = await params
    
    if (!hasPermission(session.role, "delete_approval_hierarchies") && !hasPermission(session.role, "manage_setup")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if hierarchy has any pending requests
    const pendingRequests = await prisma.approval_requests.count({
      where: {
        hierarchyId: id,
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
    })

    if (pendingRequests > 0) {
      return NextResponse.json(
        { error: "Cannot delete hierarchy with pending approval requests" },
        { status: 400 }
      )
    }

    await prisma.approval_hierarchies.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Hierarchy deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting approval hierarchy:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete approval hierarchy" },
      { status: 500 }
    )
  }
}
