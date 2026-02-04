import { requireAuth } from "@/lib/session"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export const metadata = {
  title: "System Lists",
  description: "Manage dynamic system lists and statuses.",
}

export default async function SystemListsPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "manage_setup")) {
    return redirect("/auth/unauthorized")
  }

  const systemLists = await prisma.system_lists.findMany({
    include: {
      system_list_items: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { name: "asc" },
  })

  const categoryColors: Record<string, string> = {
    STUDENT_LIFECYCLE: "bg-blue-500",
    PROCUREMENT: "bg-green-500",
    FINANCE: "bg-purple-500",
    INVENTORY: "bg-orange-500",
    GENERAL: "bg-gray-500",
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Lists</h1>
          <p className="text-muted-foreground">
            Manage inquiry status, enrollment status, and other dynamic lists
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add List
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {systemLists.map((list) => (
          <Card key={list.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{list.name}</CardTitle>
                  <CardDescription>{list.description || list.code}</CardDescription>
                </div>
                <Badge 
                  variant="secondary" 
                  className={categoryColors[list.category] || "bg-gray-500"}
                >
                  {list.category.replace(/_/g, " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-medium">{list.system_list_items.length}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {list.system_list_items.map((item) => (
                    <Badge
                      key={item.id}
                      variant="outline"
                      className="text-xs"
                      style={{
                        backgroundColor: item.color ? `${item.color}20` : undefined,
                        borderColor: item.color || undefined,
                      }}
                    >
                      {item.label}
                      {item.isDefault && " ★"}
                    </Badge>
                  ))}
                </div>
                {list.isSystem && (
                  <div className="pt-2">
                    <Badge variant="secondary" className="text-xs">
                      System Protected
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {systemLists.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No system lists configured</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
