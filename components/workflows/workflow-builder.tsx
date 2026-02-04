"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Save, Play, Zap, Settings, Trash2 } from "lucide-react"

export function WorkflowBuilder() {
  const [workflowName, setWorkflowName] = useState("")
  const [description, setDescription] = useState("")
  const [trigger, setTrigger] = useState("")
  const [steps, setSteps] = useState<any[]>([])

  const triggers = [
    { value: "MANUAL", label: "Manual Trigger" },
    { value: "SCHEDULE", label: "Scheduled (Cron)" },
    { value: "WEBHOOK", label: "Webhook URL" },
    { value: "NEW_STUDENT", label: "New Student Enrolled" },
    { value: "NEW_INQUIRY", label: "New Inquiry Created" },
    { value: "NEW_ENROLLMENT", label: "New Enrollment" },
    { value: "PAYMENT_RECEIVED", label: "Payment Received" },
    { value: "BUDGET_ALERT", label: "Budget Alert" },
    { value: "FORM_SUBMISSION", label: "Form Submission" },
  ]

  const actions = [
    { value: "send_whatsapp", label: "Send WhatsApp Message", provider: "WHATSAPP" },
    { value: "send_email", label: "Send Email", provider: "GMAIL" },
    { value: "post_facebook", label: "Post to Facebook", provider: "FACEBOOK" },
    { value: "post_instagram", label: "Post to Instagram", provider: "INSTAGRAM" },
    { value: "create_calendar_event", label: "Create Calendar Event", provider: "GOOGLE_CALENDAR" },
    { value: "add_to_sheets", label: "Add Row to Google Sheets", provider: "GOOGLE_SHEETS" },
    { value: "upload_to_drive", label: "Upload to Google Drive", provider: "GOOGLE_DRIVE" },
  ]

  const addStep = () => {
    setSteps([...steps, { id: Date.now(), type: "ACTION", action: "", config: {} }])
  }

  const removeStep = (stepId: number) => {
    setSteps(steps.filter(step => step.id !== stepId))
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left Panel - Configuration */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Settings</CardTitle>
            <CardDescription>Basic configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workflow Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Welcome New Students"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What does this workflow do?"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trigger">Trigger *</Label>
              <Select value={trigger} onValueChange={setTrigger}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  {triggers.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {trigger === "SCHEDULE" && (
              <div className="space-y-2">
                <Label htmlFor="schedule">Cron Expression</Label>
                <Input
                  id="schedule"
                  placeholder="0 9 * * *"
                />
                <p className="text-xs text-muted-foreground">
                  Run daily at 9 AM
                </p>
              </div>
            )}

            {trigger === "WEBHOOK" && (
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  value="https://your-domain.com/api/webhook/..."
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  This URL will be generated after saving
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Available workflow actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {actions.map((action) => (
                <Button
                  key={action.value}
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => addStep()}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Visual Builder */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Steps</CardTitle>
            <CardDescription>
              Build your workflow by adding and configuring steps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Trigger Block */}
            <div className="border-2 border-dashed border-primary rounded-lg p-4 bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary">
                  <Zap className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium">Trigger</p>
                  <p className="text-sm text-muted-foreground">
                    {trigger ? triggers.find(t => t.value === trigger)?.label : "Not configured"}
                  </p>
                </div>
              </div>
            </div>

            {/* Steps */}
            {steps.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No steps added yet
                </p>
                <Button onClick={addStep}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Step
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="relative">
                    {/* Connector Line */}
                    {index > 0 && (
                      <div className="absolute left-6 -top-4 w-0.5 h-4 bg-border" />
                    )}
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              <Settings className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">Step {index + 1}</p>
                              <p className="text-sm text-muted-foreground">Configure action</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(step.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <Label>Action</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select action" />
                            </SelectTrigger>
                            <SelectContent>
                              {actions.map((action) => (
                                <SelectItem key={action.value} value={action.value}>
                                  {action.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Connection</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select API connection" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="conn1">WhatsApp Business</SelectItem>
                              <SelectItem value="conn2">Gmail Account</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Configuration</Label>
                          <Textarea
                            placeholder="Action specific settings (JSON)"
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={addStep}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Step
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline">
            Cancel
          </Button>
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save as Draft
          </Button>
          <Button>
            <Play className="mr-2 h-4 w-4" />
            Save & Activate
          </Button>
        </div>
      </div>
    </div>
  )
}
