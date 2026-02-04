import { NextRequest, NextResponse } from "next/server"
import { getUnallocatedStock } from "@/lib/inventory"
import { requireAuth } from "@/lib/session"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    
    // Get unallocated stock for the item
    const quantity = await getUnallocatedStock(id)

    return NextResponse.json({ 
      itemId: id,
      quantity,
      available: quantity > 0
    })
  } catch (error: any) {
    console.error("Error fetching unallocated stock:", error)
    return NextResponse.json(
      { message: error.message || "Failed to fetch unallocated stock" },
      { status: 500 }
    )
  }
}
