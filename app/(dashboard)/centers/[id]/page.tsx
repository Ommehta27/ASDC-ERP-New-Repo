import { requireAuth } from "@/lib/session"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, Phone, Mail, Users, BookOpen, Package, ArrowLeft } from "lucide-react"

export default async function CenterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()

  if (!hasPermission(user.role, "view_centers")) {
    return redirect("/auth/unauthorized")
  }

  const { id } = await params

  const center = await prisma.centers.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          students: true,
          enrollments: true,
          employees: true,
          center_inventories: true,
        },
      },
      center_inventories: {
        include: {
          inventory_items: {
            select: {
              name: true,
              itemCode: true,
              category: true,
              estimatedPrice: true,
            },
          },
        },
      },
    },
  })

  if (!center) {
    return redirect("/centers")
  }

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-500",
    INACTIVE: "bg-gray-500",
    CLOSED: "bg-red-500",
  }

  // Calculate inventory totals
  const inventoryTotal = center.center_inventories.reduce((sum, item) => {
    const price = item.purchasePrice || item.inventory_items.estimatedPrice || 0
    return sum + (price * item.quantity)
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/centers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Centers
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{center.name}</h1>
            <p className="text-muted-foreground">{center.code}</p>
          </div>
        </div>
        <Badge variant="secondary" className={statusColors[center.status]}>
          {center.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {center._count.students} / {center.capacity}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((center._count.students / center.capacity) * 100)}% capacity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{center._count.enrollments}</div>
            <p className="text-xs text-muted-foreground">Active enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{inventoryTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {center._count.center_inventories} items
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Address</div>
                <div className="text-sm text-muted-foreground">
                  {center.address}
                  <br />
                  {center.city}, {center.state} - {center.pincode}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Phone</div>
                <div className="text-sm text-muted-foreground">{center.phone}</div>
              </div>
            </div>
            {center.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-muted-foreground">{center.email}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Items</span>
                <span className="font-medium">{center._count.center_inventories}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Value</span>
                <span className="font-medium">₹{inventoryTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Quantity</span>
                <span className="font-medium">
                  {center.center_inventories.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {center.center_inventories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {center.center_inventories.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">{item.inventory_items.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.inventory_items.itemCode} • {item.inventory_items.category}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Qty: {item.quantity}</div>
                    <div className="text-sm text-muted-foreground">
                      ₹{((item.purchasePrice || item.inventory_items.estimatedPrice || 0) * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
