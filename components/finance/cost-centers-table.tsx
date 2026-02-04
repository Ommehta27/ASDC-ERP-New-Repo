"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"

interface CostCenter {
  id: string
  centerCode: string
  centerName: string
  description: string | null
  parentCenterId: string | null
  centerId: string | null
  isActive: boolean
  createdAt: string
}

export function CostCentersTable() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // This will be replaced with actual API call
    setLoading(false)
    // Placeholder data
    setCostCenters([])
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (costCenters.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No cost centers found. Create your first cost center to get started.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {costCenters.map((center) => (
            <TableRow key={center.id}>
              <TableCell className="font-mono">{center.centerCode}</TableCell>
              <TableCell className="font-medium">{center.centerName}</TableCell>
              <TableCell className="max-w-md truncate">{center.description || "-"}</TableCell>
              <TableCell>
                <Badge variant={center.isActive ? "default" : "secondary"}>
                  {center.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/finance/cost-centers/${center.id}`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
