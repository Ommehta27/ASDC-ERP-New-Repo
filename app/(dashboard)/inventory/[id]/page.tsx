import { notFound, redirect } from "next/navigation"
import { requireAuth } from "@/lib/session"
import { hasPermission } from "@/lib/permissions"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Package, 
  DollarSign, 
  MapPin, 
  Calendar,
  Edit,
  Trash2,
  ArrowLeft,
  TrendingUp,
  Building2,
  Wrench
} from "lucide-react"
import Link from "next/link"

interface ItemDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const user = await requireAuth()

  if (!hasPermission(user.role, "view_inventory")) {
    return redirect("/auth/unauthorized")
  }

  const { id } = await params

  const item = await prisma.inventory_items.findUnique({
    where: {
      id,
    },
    include: {
      units_of_measure: {
        select: {
          name: true,
          abbreviation: true,
        },
      },
      center_inventories: {
        include: {
          centers: {
            select: {
              id: true,
              name: true,
              code: true,
              city: true,
            },
          },
        },
        orderBy: {
          quantity: "desc",
        },
      },
      _count: {
        select: {
          center_inventories: true,
          inventory_consumption: true,
          inventory_transfers: true,
          maintenance_records: true,
        },
      },
    },
  })

  if (!item) {
    notFound()
  }

  // Calculate totals
  const totalQuantity = item.center_inventories.reduce((sum, ci) => sum + ci.quantity, 0)
  const totalValue = item.center_inventories.reduce((sum, ci) => sum + (ci.purchasePrice || 0) * ci.quantity, 0)
  const avgUnitCost = totalQuantity > 0 ? totalValue / totalQuantity : 0

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const categoryLabels: Record<string, string> = {
    COMPUTER: "Computer",
    FURNITURE: "Furniture",
    STATIONERY: "Stationery",
    LAB_EQUIPMENT: "Lab Equipment",
    ELECTRONICS: "Electronics",
    BOOKS: "Books",
    SOFTWARE: "Software",
    OTHER: "Other",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>
              <Badge variant="secondary">{categoryLabels[item.category]}</Badge>
            </div>
            <p className="text-lg text-muted-foreground">{item.itemCode}</p>
            {item.brand && (
              <p className="text-sm text-muted-foreground">
                Brand: <span className="font-medium">{item.brand}</span>
                {item.model && <span> • Model: {item.model}</span>}
              </p>
            )}
          </div>
          
          {hasPermission(user.role, "edit_inventory") && (
            <div className="flex gap-2">
              <Link href={`/inventory/${item.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              {hasPermission(user.role, "delete_inventory") && (
                <Button variant="outline" size="sm" className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity}</div>
            <p className="text-xs text-muted-foreground">
              {item.units_of_measure ? item.units_of_measure.abbreviation : "units"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalValue.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ₹{avgUnitCost.toFixed(2)}/unit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item._count.center_inventories}</div>
            <p className="text-xs text-muted-foreground">centers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {item.estimatedPrice ? `₹${item.estimatedPrice.toLocaleString("en-IN")}` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">per unit</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Item Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.description && (
                <>
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                  <Separator />
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Category</h3>
                  <Badge variant="outline">{categoryLabels[item.category]}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Unit of Measure</h3>
                  <p className="text-muted-foreground">
                    {item.units_of_measure ? 
                      `${item.units_of_measure.name} (${item.units_of_measure.abbreviation})` : 
                      "Not specified"}
                  </p>
                </div>
              </div>

              {(item.brand || item.model) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    {item.brand && (
                      <div>
                        <h3 className="font-semibold mb-1">Brand</h3>
                        <p className="text-muted-foreground">{item.brand}</p>
                      </div>
                    )}
                    {item.model && (
                      <div>
                        <h3 className="font-semibold mb-1">Model</h3>
                        <p className="text-muted-foreground">{item.model}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {item.specifications && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Specifications</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{item.specifications}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                {item.warrantyPeriodMonths && (
                  <div>
                    <h3 className="font-semibold mb-1">Warranty Period</h3>
                    <p className="text-muted-foreground">{item.warrantyPeriodMonths} months</p>
                  </div>
                )}
                {item.maintenanceIntervalDays && (
                  <div>
                    <h3 className="font-semibold mb-1">Maintenance Interval</h3>
                    <p className="text-muted-foreground">{item.maintenanceIntervalDays} days</p>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold mb-1">Min Qty per Center</h3>
                  <p className="text-muted-foreground">{item.minQuantityPerCenter} units</p>
                </div>
                {item.defaultSupplier && (
                  <div>
                    <h3 className="font-semibold mb-1">Default Supplier</h3>
                    <p className="text-muted-foreground">{item.defaultSupplier}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold mb-1">Created</h3>
                  <p className="text-muted-foreground">{formatDate(item.createdAt)}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Last Updated</h3>
                  <p className="text-muted-foreground">{formatDate(item.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Center-wise Stock */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Stock by Center
              </CardTitle>
              <CardDescription>Current stock levels across all centers</CardDescription>
            </CardHeader>
            <CardContent>
              {item.center_inventories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No stock allocated to any center yet
                </p>
              ) : (
                <div className="space-y-3">
                  {item.center_inventories.map((centerInventory) => (
                    <div
                      key={centerInventory.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{centerInventory.centers.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {centerInventory.centers.code}
                          {centerInventory.centers.city && ` • ${centerInventory.centers.city}`}
                        </p>
                        {centerInventory.location && (
                          <p className="text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {centerInventory.location}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{centerInventory.quantity}</div>
                        <Badge
                          variant={centerInventory.condition === "NEW" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {centerInventory.condition}
                        </Badge>
                        {centerInventory.purchasePrice && (
                          <p className="text-xs text-muted-foreground mt-1">
                            ₹{centerInventory.purchasePrice.toLocaleString("en-IN")}/unit
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Consumption Records</span>
                <span className="font-medium">{item._count.inventory_consumption}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transfers</span>
                <span className="font-medium">{item._count.inventory_transfers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Maintenance Records</span>
                <span className="font-medium">{item._count.maintenance_records}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {hasPermission(user.role, "allocate_inventory") && (
                <Link href={`/inventory/allocations/new?itemId=${item.id}`}>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <MapPin className="mr-2 h-4 w-4" />
                    Allocate to Center
                  </Button>
                </Link>
              )}
              <Link href={`/inventory?search=${item.itemCode}`}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  View in Inventory List
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
