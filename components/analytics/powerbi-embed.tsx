"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface PowerBIEmbedProps {
  embedUrl?: string
  title?: string
}

export function PowerBIEmbed({ embedUrl: initialUrl, title = "PowerBI Dashboard" }: PowerBIEmbedProps) {
  const [embedUrl, setEmbedUrl] = useState(initialUrl || "")
  const [tempUrl, setTempUrl] = useState(initialUrl || "")
  const [loading, setLoading] = useState(false)

  const handleEmbed = () => {
    setLoading(true)
    setEmbedUrl(tempUrl)
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PowerBI Configuration</CardTitle>
          <CardDescription>
            Enter your PowerBI embed URL to display reports and dashboards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="embedUrl">PowerBI Embed URL</Label>
            <div className="flex gap-2">
              <Input
                id="embedUrl"
                placeholder="https://app.powerbi.com/reportEmbed?..."
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleEmbed} disabled={loading || !tempUrl}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Load Report
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get the embed URL from PowerBI Service → File → Embed → Publish to web
            </p>
          </div>
        </CardContent>
      </Card>

      {embedUrl ? (
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={embedUrl}
                className="absolute top-0 left-0 w-full h-full border-0 rounded-lg"
                allowFullScreen
                title={title}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">No PowerBI report configured</p>
              <p className="text-sm">Enter an embed URL above to display your PowerBI dashboard</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
