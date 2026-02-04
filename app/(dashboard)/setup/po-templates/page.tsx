import { requireAuth } from "@/lib/session"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus, Star } from "lucide-react"
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
  title: "PO Templates",
  description: "Manage purchase order templates.",
}

export default async function POTemplatesPage() {
  const user = await requireAuth()

  if (!hasPermission(user.role, "manage_setup")) {
    return redirect("/auth/unauthorized")
  }

  const templates = await prisma.po_templates.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PO Templates</h1>
          <p className="text-muted-foreground">
            Manage purchase order templates and configurations
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Template
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Tax Rate</TableHead>
              <TableHead>Approval Required</TableHead>
              <TableHead>Auto-Approve Below</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No PO templates found
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {template.isDefault && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                      {template.templateCode}
                    </div>
                  </TableCell>
                  <TableCell>{template.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {template.description || "-"}
                  </TableCell>
                  <TableCell>{template.defaultTaxRate}%</TableCell>
                  <TableCell>
                    {template.requiresApproval ? (
                      <Badge variant="outline" className="bg-orange-500/10">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {template.autoApproveBelow 
                      ? `₹${template.autoApproveBelow.toLocaleString()}` 
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? "Active" : "Inactive"}
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
