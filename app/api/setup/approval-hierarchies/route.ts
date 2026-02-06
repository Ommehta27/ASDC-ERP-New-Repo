import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    if (!hasPermission(session.role, "view_approval_hierarchies") && !hasPermission(session.role, "manage_setup")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const entityType = searchParams.get("entityType")
    const isActive = searchParams.get("isActive")

    const where: any = {}
    if (entityType) where.entityType = entityType
    if (isActive !== null) where.isActive = isActive === "true"

    const hierarchies = await prisma.approval_hierarchies.findMany({
      where,
      include: {
        approval_levels: {
          orderBy: { levelNumber: "asc" },
        },
        _count: {
          select: {
            approval_requests: true,
          },
        },
      },
      orderBy: [
        { isDefault: "desc" },
        { entityType: "asc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(hierarchies)
  } catch (error: any) {
    console.error("Error fetching approval hierarchies:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch approval hierarchies" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    if (!hasPermission(session.role, "create_approval_hierarchies") && !hasPermission(session.role, "manage_setup")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const {
      name,
      description,
      entityType,
      isActive,
      isDefault,
      conditions,
      levels,
    } = body

    // If this is set as default, unset other defaults for this entity type
    if (isDefault) {
      await prisma.approval_hierarchies.updateMany({
        where: {
          entityType,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })
    }

    // Create hierarchy with levels
    const hierarchy = await prisma.approval_hierarchies.create({
      data: {
        id: `hier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        description,
        entityType,
        isActive: isActive ?? true,
        isDefault: isDefault ?? false,
        conditions,
        createdBy: session.id,
        createdAt: new Date(),
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

    return NextResponse.json(hierarchy, { status: 201 })
  } catch (error: any) {
    console.error("Error creating approval hierarchy:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create approval hierarchy" },
      { status: 500 }
    )
  }
}
