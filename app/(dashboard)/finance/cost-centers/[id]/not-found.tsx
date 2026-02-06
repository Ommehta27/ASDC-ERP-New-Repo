import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileX, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CostCenterNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <FileX className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-center">Cost Center Not Found</CardTitle>
          <CardDescription className="text-center">
            The cost center you're looking for doesn't exist or has been deleted.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href="/finance/cost-centers">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cost Centers
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
