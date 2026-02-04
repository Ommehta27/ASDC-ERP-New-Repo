import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CostCentersTable } from "@/components/finance/cost-centers-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function CostCentersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cost Centers</h1>
          <p className="text-muted-foreground mt-1">
            Manage organizational cost centers for budget allocation
          </p>
        </div>
        <Link href="/finance/cost-centers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Cost Center
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Centers</CardTitle>
          <CardDescription>
            Cost centers help track and allocate budgets across departments and centers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CostCentersTable />
        </CardContent>
      </Card>
    </div>
  )
}
