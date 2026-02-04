"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Search } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

interface InventoryItem {
  id: string
  itemCode: string
  name: string
  category: string
  brand: string | null
  model: string | null
  estimatedPrice: number | null
  units_of_measure: {
    name: string
    abbreviation: string
  } | null
  _count: {
    center_inventories: number
  }
}

export function InventoryTable() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchItems()
  }, [search])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      
      const response = await fetch(`/api/inventory/items?${params}`)
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error("Error fetching inventory items:", error)
    } finally {
      setLoading(false)
    }
  }

  const categoryColors: Record<string, string> = {
    FURNITURE: "bg-blue-500",
    ELECTRONICS: "bg-purple-500",
    EQUIPMENT: "bg-green-500",
    STATIONERY: "bg-yellow-500",
    SUPPLIES: "bg-orange-500",
    VEHICLES: "bg-red-500",
    OTHER: "bg-gray-500",
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>UOM</TableHead>
              <TableHead>Est. Price</TableHead>
              <TableHead>Allocations</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No inventory items found
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.itemCode}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={categoryColors[item.category]}>
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.brand || "-"}</TableCell>
                  <TableCell>{item.model || "-"}</TableCell>
                  <TableCell>
                    {item.units_of_measure 
                      ? `${item.units_of_measure.name} (${item.units_of_measure.abbreviation})`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {item.estimatedPrice ? `₹${item.estimatedPrice.toLocaleString()}` : "-"}
                  </TableCell>
                  <TableCell>{item._count.center_inventories} centers</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/inventory/${item.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
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
