import { Suspense } from "react"
import { requireAuth } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { Plus, Upload, Edit } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
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
import { formatDate } from "@/lib/utils"

export default async function PurchasesPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "view_procurement")) {
    return redirect("/auth/unauthorized")
  }

  const purchases = await prisma.purchases.findMany({
    include: {
      vendors: {
        select: {
          name: true,
          vendorCode: true,
        },
      },
      centers: {
        select: {
          name: true,
          code: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  })

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-500",
    SUBMITTED: "bg-blue-500",
    APPROVED: "bg-green-500",
    REJECTED: "bg-red-500",
    POSTED: "bg-purple-500",
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
          <p className="text-muted-foreground">
            Record purchases with Bill Capture OCR or Manual Entry
          </p>
        </div>
        {hasPermission(user.role, "manage_procurement") && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/procurement/purchases/manual">
              <Button variant="outline" className="w-full sm:w-auto">
                <Edit className="mr-2 h-4 w-4" />
                Manual Entry
              </Button>
            </Link>
            <Link href="/procurement/purchases/new">
              <Button className="w-full sm:w-auto">
                <Upload className="mr-2 h-4 w-4" />
                Bill Capture (OCR)
              </Button>
            </Link>
          </div>
        )}
      </div>

      <Suspense fallback={<Skeleton className="h-96" />}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Purchase #</TableHead>
                <TableHead>Bill #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Center</TableHead>
                <TableHead>Bill Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No purchases found
                  </TableCell>
                </TableRow>
              ) : (
                purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.purchaseNumber}</TableCell>
                    <TableCell>{purchase.billNumber || "-"}</TableCell>
                    <TableCell>{purchase.vendors.name}</TableCell>
                    <TableCell>{purchase.centers.name}</TableCell>
                    <TableCell>{purchase.billDate ? formatDate(purchase.billDate) : "-"}</TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{purchase.totalAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {purchase.paymentStatus || "PENDING"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[purchase.status]}>
                        {purchase.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Suspense>
    </div>
  )
}
