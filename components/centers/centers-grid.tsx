"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Search, MapPin, Users, Phone, Package } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

interface Center {
  id: string
  code: string
  name: string
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  email: string | null
  capacity: number
  status: string
  _count: {
    students: number
    enrollments: number
    employees: number
    center_inventories: number
  }
}

export function CentersGrid() {
  const [centers, setCenters] = useState<Center[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchCenters()
  }, [search])

  const fetchCenters = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      
      const response = await fetch(`/api/centers?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCenters(data)
      }
    } catch (error) {
      console.error("Error fetching centers:", error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-500",
    INACTIVE: "bg-gray-500",
    CLOSED: "bg-red-500",
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search centers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {centers.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No centers found
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {centers.map((center) => (
            <Card key={center.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{center.name}</CardTitle>
                    <CardDescription>{center.code}</CardDescription>
                  </div>
                  <Badge variant="secondary" className={statusColors[center.status]}>
                    {center.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div>{center.address}</div>
                      <div className="text-muted-foreground">
                        {center.city}, {center.state} - {center.pincode}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{center.phone}</span>
                  </div>
                  {center.email && (
                    <div className="text-sm text-muted-foreground">{center.email}</div>
                  )}
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Students</span>
                    </div>
                    <span className="font-medium">{center._count.students} / {center.capacity}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Enrollments</span>
                    <span className="font-medium">{center._count.enrollments}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Employees</span>
                    <span className="font-medium">{center._count.employees}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>Inventory Items</span>
                    </div>
                    <span className="font-medium">{center._count.center_inventories}</span>
                  </div>
                </div>

                <Link href={`/centers/${center.id}`} className="block">
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
