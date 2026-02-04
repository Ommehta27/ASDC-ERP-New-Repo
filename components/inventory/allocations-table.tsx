import prisma from "@/lib/prisma"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Package, MapPin, Calendar, DollarSign } from "lucide-react"
import { formatDate } from "@/lib/utils"

export async function AllocationsTable() {
  const allocations = await prisma.center_inventories.findMany({
    include: {
      inventory_items: {
        select: {
          itemCode: true,
          name: true,
          category: true,
          brand: true,
          model: true,
        },
      },
      centers: {
        select: {
          code: true,
          name: true,
          city: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  if (allocations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No allocations found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Start by allocating inventory items to centers.
        </p>
      </div>
    )
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "NEW":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
      case "GOOD":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
      case "FAIR":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
      case "POOR":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
      case "IN_USE":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
      case "MAINTENANCE":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
      case "DAMAGED":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
      case "DISPOSED":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "COMPUTER":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
      case "FURNITURE":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
      case "ELECTRONICS":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
      case "LAB_EQUIPMENT":
        return "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
    }
  }

  // Calculate totals
  const totalQuantity = allocations.reduce((sum, allocation) => sum + allocation.quantity, 0)
  const totalValue = allocations.reduce(
    (sum, allocation) => sum + allocation.quantity * (allocation.purchasePrice || 0),
    0
  )
  const uniqueCenters = new Set(allocations.map(a => a.centerId)).size
  const uniqueItems = new Set(allocations.map(a => a.itemId)).size

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            Total Allocations
          </div>
          <p className="mt-2 text-2xl font-bold">{allocations.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            Total Quantity
          </div>
          <p className="mt-2 text-2xl font-bold">{totalQuantity}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Centers
          </div>
          <p className="mt-2 text-2xl font-bold">{uniqueCenters}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            Total Value
          </div>
          <p className="mt-2 text-2xl font-bold">₹{totalValue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Details</TableHead>
              <TableHead>Center</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Purchase Price</TableHead>
              <TableHead>Purchase Date</TableHead>
              <TableHead>Allocated On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allocations.map((allocation) => (
              <TableRow key={allocation.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{allocation.inventory_items.name}</p>
                      <Badge variant="outline" className={getCategoryColor(allocation.inventory_items.category)}>
                        {allocation.inventory_items.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {allocation.inventory_items.itemCode}
                    </p>
                    {(allocation.inventory_items.brand || allocation.inventory_items.model) && (
                      <p className="text-xs text-muted-foreground">
                        {allocation.inventory_items.brand} {allocation.inventory_items.model}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{allocation.centers.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {allocation.centers.code} • {allocation.centers.city}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{allocation.quantity}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getConditionColor(allocation.condition)}>
                    {allocation.condition}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(allocation.status)}>
                    {allocation.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {allocation.location ? (
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {allocation.location}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {allocation.purchasePrice ? (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">
                        ₹{allocation.purchasePrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {allocation.purchaseDate ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {formatDate(allocation.purchaseDate)}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(allocation.createdAt)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
