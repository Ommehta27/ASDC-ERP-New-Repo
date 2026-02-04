import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "manage_setup")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const where: any = {}
    if (category) where.category = category

    const systemLists = await prisma.system_lists.findMany({
      where,
      include: {
        system_list_items: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(systemLists)
  } catch (error) {
    console.error("Error fetching system lists:", error)
    return NextResponse.json({ message: "Failed to fetch system lists" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user || !hasPermission(user.role, "manage_setup")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const {
      code,
      name,
      description,
      category,
      items,
    } = body

    // Basic validation
    if (!code || !name || !category) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Create system list with items
    const newList = await prisma.system_lists.create({
      data: {
        code,
        name,
        description,
        category,
        isSystem: false,
        isActive: true,
        createdBy: user.id,
        system_list_items: {
          create: items?.map((item: any, index: number) => ({
            code: item.code,
            label: item.label,
            description: item.description,
            color: item.color,
            sortOrder: index,
            isDefault: item.isDefault || false,
            isActive: true,
            isSystem: false,
            createdBy: user.id,
          })) || [],
        },
      },
      include: {
        system_list_items: true,
      },
    })

    return NextResponse.json(newList, { status: 201 })
  } catch (error: any) {
    console.error("Error creating system list:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ message: "System list code already exists" }, { status: 409 })
    }
    return NextResponse.json({ message: "Failed to create system list" }, { status: 500 })
  }
}
