import { requireAuth } from "@/lib/session"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Units of Measure",
  description: "Manage units of measure for inventory and procurement.",
}

export default async function UOMPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "manage_setup")) {
    return redirect("/auth/unauthorized")
  }

  const uoms = await prisma.units_of_measure.findMany({
    orderBy: {
      name: "asc",
    },
  })

  const typeColors: Record<string, string> = {
    QUANTITY: "bg-blue-500",
    WEIGHT: "bg-green-500",
    LENGTH: "bg-purple-500",
    VOLUME: "bg-orange-500",
    TIME: "bg-yellow-500",
    AREA: "bg-cyan-500",
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Units of Measure</h1>
          <p className="text-muted-foreground">
            Manage measurement units for inventory and procurement
          </p>
        </div>
        <Link href="/setup/uom/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add UOM
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Abbreviation</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Base Unit</TableHead>
              <TableHead>Conversion Factor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uoms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No units of measure found
                </TableCell>
              </TableRow>
            ) : (
              uoms.map((uom) => (
                <TableRow key={uom.id}>
                  <TableCell className="font-medium">{uom.code}</TableCell>
                  <TableCell>{uom.name}</TableCell>
                  <TableCell>{uom.abbreviation}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={typeColors[uom.type]}>
                      {uom.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{uom.baseUnit || "-"}</TableCell>
                  <TableCell>{uom.conversionFactor || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={uom.isActive ? "default" : "secondary"}>
                      {uom.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
