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
    
    if (!hasPermission(session.role, "view_employees")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const employee = await prisma.employees.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        centers: {
          select: {
            name: true,
            code: true,
          },
        },
        employees: {
          select: {
            users: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch (error: any) {
    console.error("Error fetching employee:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch employee" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth()
    const { id } = await params
    
    if (!hasPermission(session.role, "edit_employees")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()

    const employee = await prisma.employees.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(employee)
  } catch (error: any) {
    console.error("Error updating employee:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update employee" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth()
    const { id } = await params
    
    if (!hasPermission(session.role, "delete_employees")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.employees.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Employee deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting employee:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete employee" },
      { status: 500 }
    )
  }
}
