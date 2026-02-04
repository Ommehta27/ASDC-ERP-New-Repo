"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  UserPlus, 
  GraduationCap, 
  Package, 
  FileText, 
  Building2,
  ShoppingCart,
  ArrowRight,
} from "lucide-react"

export function QuickActions() {
  const actions = [
    {
      title: "New Inquiry",
      description: "Register a new student inquiry",
      icon: UserPlus,
      href: "/inquiries/new",
      color: "bg-blue-500",
    },
    {
      title: "Add Student",
      description: "Enroll a new student",
      icon: GraduationCap,
      href: "/students/new",
      color: "bg-green-500",
    },
    {
      title: "Create Enrollment",
      description: "Enroll student in course",
      icon: GraduationCap,
      href: "/enrollments/new",
      color: "bg-purple-500",
    },
    {
      title: "Add Center",
      description: "Register a new center",
      icon: Building2,
      href: "/centers/new",
      color: "bg-cyan-500",
    },
    {
      title: "Inventory Item",
      description: "Add new inventory item",
      icon: Package,
      href: "/inventory/new",
      color: "bg-orange-500",
    },
    {
      title: "Purchase Order",
      description: "Create new PO",
      icon: FileText,
      href: "/procurement/purchase-orders",
      color: "bg-pink-500",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href} href={action.href}>
                <Button
                  variant="outline"
                  className="h-auto flex flex-col items-start p-4 gap-2 hover:bg-accent transition-all group"
                >
                  <div className={`p-2 rounded-lg ${action.color} bg-opacity-10 transition-transform group-hover:scale-110`}>
                    <Icon className={`h-5 w-5 ${action.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm flex items-center gap-1">
                      {action.title}
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
