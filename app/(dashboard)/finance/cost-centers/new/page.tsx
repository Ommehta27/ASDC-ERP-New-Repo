import { CostCenterForm } from "@/components/finance/cost-center-form"

export default function NewCostCenterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Cost Center</h1>
        <p className="text-muted-foreground mt-1">
          Add a new cost center for budget tracking and allocation
        </p>
      </div>

      <CostCenterForm />
    </div>
  )
}
