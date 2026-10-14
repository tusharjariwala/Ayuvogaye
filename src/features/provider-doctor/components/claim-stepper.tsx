import { BadgeCheck, CheckCircle2, Circle, CircleDot, FileText, Hand, Send, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/shared/overlays"
import { cn } from "@/lib/utils"
import type { Doctor, VerificationCase } from "@/types"

type StepState = "done" | "current" | "todo"

const STATE_TEXT: Record<StepState, string> = { done: "Complete", current: "In progress", todo: "Not started" }

/** Claim → evidence → submitted → review stepper for doctor profiles. */
export function ClaimStepper({ doctor, latestCase, canEdit, onClaim }: { doctor: Doctor; latestCase?: VerificationCase; canEdit: boolean; onClaim: () => void }) {
  const status = doctor.verification.status
  const inFlight = status === "submitted" || status === "under_review" || status === "verified"
  const steps: { label: string; description: string; icon: typeof Hand; state: StepState }[] = [
    {
      label: "Claim profile",
      description: doctor.claimed ? "You manage this profile" : "Confirm this listing is yours",
      icon: Hand,
      state: doctor.claimed ? "done" : "current",
    },
    {
      label: "Evidence",
      description: latestCase ? `${latestCase.evidence.length} placeholder references` : "Placeholder references only",
      icon: FileText,
      state: latestCase && inFlight ? "done" : doctor.claimed ? "current" : "todo",
    },
    {
      label: "Submitted",
      description: "Sent to the platform",
      icon: Send,
      state: inFlight ? "done" : "todo",
    },
    {
      label: "Review",
      description: status === "verified" ? "Verified by the platform" : status === "under_review" ? "Reviewer checking" : "Awaiting reviewer",
      icon: ShieldCheck,
      state: status === "verified" ? "done" : inFlight ? "current" : "todo",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile claim</CardTitle>
        <CardDescription>
          {doctor.claimed ? "Your profile is claimed. Verification is decided by the platform." : "Claim your listing to manage it and start verification."}
        </CardDescription>
        <CardAction>
          {doctor.claimed ? (
            <Badge variant="success">
              <BadgeCheck aria-hidden="true" /> Claimed
            </Badge>
          ) : (
            <Badge variant="muted">Unclaimed</Badge>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-5">
        <ol className="grid gap-4 sm:grid-cols-4" aria-label="Claim and verification progress">
          {steps.map((s, i) => {
            const StateIcon = s.state === "done" ? CheckCircle2 : s.state === "current" ? CircleDot : Circle
            return (
              <li key={s.label} className="relative flex gap-3 sm:flex-col sm:gap-2" aria-current={s.state === "current" ? "step" : undefined}>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full border",
                      s.state === "done" && "border-transparent bg-success-soft text-success-text",
                      s.state === "current" && "border-primary bg-primary/10 text-primary",
                      s.state === "todo" && "text-muted-foreground",
                    )}
                  >
                    <StateIcon className="size-4" aria-hidden="true" />
                  </span>
                  {i < steps.length - 1 && <span className="hidden h-px flex-1 bg-border sm:block" aria-hidden="true" />}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {i + 1}. {s.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                  <p className="sr-only">Status: {STATE_TEXT[s.state]}</p>
                </div>
              </li>
            )
          })}
        </ol>
        {!doctor.claimed && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <ConfirmDialog
              title="Claim this profile?"
              description="Claiming opens a verification case with placeholder evidence references. No documents are uploaded and claiming does not verify the profile."
              confirmLabel="Claim profile"
              onConfirm={onClaim}
              trigger={
                <Button disabled={!canEdit}>
                  <Hand /> Claim profile
                </Button>
              }
            />
            <p className="text-xs text-muted-foreground">Demo only — ownership is not checked.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
