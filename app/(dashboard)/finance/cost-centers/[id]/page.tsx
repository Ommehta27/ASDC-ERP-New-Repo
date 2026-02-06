import { CostCenterForm } from "@/components/finance/cost-center-form"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditCostCenterPage({ params }: PageProps) {
  const { id } = await params

  const costCenter = await prisma.cost_centers.findUnique({
    where: { id },
  })

  if (!costCenter) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Cost Center</h1>
        <p className="text-muted-foreground mt-1">
          Update cost center details and configuration
        </p>
      </div>

      <CostCenterForm costCenter={costCenter} />
    </div>
  )
}
