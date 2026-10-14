import { Flag } from "lucide-react"
import { useState, type ReactNode } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { EntityFormDialog } from "@/components/shared/overlays"
import { useDemoStore } from "@/hooks/use-demo-store"
import { createId, nowISO } from "@/lib/mock-storage"
import type { ReportedContent } from "@/types"

const REASONS: { value: ReportedContent["reason"]; label: string }[] = [
  { value: "inaccurate_information", label: "Inaccurate or outdated information" },
  { value: "inappropriate_content", label: "Inappropriate or abusive content" },
  { value: "spam", label: "Spam or advertising" },
  { value: "impersonation", label: "Impersonation or fake profile" },
  { value: "other", label: "Something else" },
]

interface ReportDialogProps {
  entityType: ReportedContent["entityType"]
  entityId: string
  entityName: string
  trigger?: ReactNode
}

/** Lets anyone flag a profile or review. Creates a local moderation item. */
export function ReportDialog({ entityType, entityId, entityName, trigger }: ReportDialogProps) {
  const { create, update, data, currentUser, logAudit, notify } = useDemoStore()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ReportedContent["reason"]>(entityType === "review" ? "inappropriate_content" : "inaccurate_information")
  const [details, setDetails] = useState("")

  const submit = () => {
    if (details.trim().length < 5) {
      toast.error("Please add a short description (at least 5 characters)")
      return false
    }
    const item = create("reportedContent", {
      id: createId("rc"),
      entityType,
      entityId,
      reason,
      details: details.trim(),
      reportedBy: currentUser?.name ?? "Anonymous visitor (demo)",
      createdAt: nowISO(),
      status: "open",
    })
    if (entityType === "review") {
      const review = data.reviews.find((r) => r.id === entityId)
      if (review) update("reviews", entityId, { reportCount: review.reportCount + 1 })
    }
    logAudit({ action: "content.reported", entityType, entityId, summary: `Report filed for ${entityName}` })
    notify({
      type: "moderation_alert",
      title: "New content report",
      message: `${entityName} was reported: ${REASONS.find((r) => r.value === reason)?.label}.`,
      audience: "platform_admin",
      link: "/admin/reported-content",
    })
    toast.success("Report submitted", { description: `Reference ${item.id}. Platform moderators will review it (simulated).` })
    setDetails("")
  }

  return (
    <>
      <span onClick={() => setOpen(true)} className="contents">
        {trigger ?? (
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Flag /> Report
          </Button>
        )}
      </span>
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title={entityType === "review" ? "Report this review" : "Report inaccurate profile"}
        description={`Tell us what's wrong with “${entityName}”. Reports are reviewed by the platform team (demo).`}
        submitLabel="Submit report"
        onSubmit={submit}
      >
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">Reason</legend>
          <RadioGroup value={reason} onValueChange={(v) => setReason(v as ReportedContent["reason"])}>
            {REASONS.map((r) => (
              <div key={r.value} className="flex items-center gap-2">
                <RadioGroupItem id={`reason-${r.value}`} value={r.value} />
                <Label htmlFor={`reason-${r.value}`} className="font-normal">
                  {r.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </fieldset>
        <div className="space-y-2">
          <Label htmlFor="report-details">Details</Label>
          <Textarea id="report-details" rows={3} maxLength={500} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="e.g. The phone number listed is no longer in service." />
          <p className="text-xs text-muted-foreground">Do not include personal health information.</p>
        </div>
      </EntityFormDialog>
    </>
  )
}
