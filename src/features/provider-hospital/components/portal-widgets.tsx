import { Building2, CheckCircle2, ChevronRight, Circle, ClipboardList, Lock, ShieldCheck, Stethoscope } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ConfirmDialog } from "@/components/shared/overlays"
import { EmptyState } from "@/components/shared/states"
import { VerificationBadge, VerificationExplainer } from "@/components/shared/verification-badge"
import { VERIFICATION_DESCRIPTIONS } from "@/lib/constants"
import { formatDate, formatRelative } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { ChangeRequest, ProviderType, Verification, VerificationCase } from "@/types"
import { canSubmitForVerification, completenessPercent, fieldLabel, type ChecklistItem } from "../lib/provider-workflow"

function ChecklistRow({ item }: { item: ChecklistItem }) {
  const Icon = item.done ? CheckCircle2 : Circle
  const content = (
    <>
      <Icon className={cn("size-4 shrink-0", item.done ? "text-success-text" : "text-muted-foreground")} aria-hidden="true" />
      <span className={cn("flex-1", item.done && "text-muted-foreground")}>{item.label}</span>
      <span className="sr-only">{item.done ? "(done)" : "(not done)"}</span>
      {!item.done && item.href && <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
    </>
  )
  return (
    <li>
      {!item.done && item.href ? (
        <Link to={item.href} className="-mx-2 flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
          {content}
        </Link>
      ) : (
        <div className="flex items-center gap-2.5 py-1.5 text-sm">{content}</div>
      )}
    </li>
  )
}

/** Progress bar + list of missing profile items with deep links. */
export function ProfileCompletenessCard({ items, className }: { items: ChecklistItem[]; className?: string }) {
  const percent = completenessPercent(items)
  const missing = items.filter((i) => !i.done)
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Profile completeness</CardTitle>
        <CardDescription>
          {items.length - missing.length} of {items.length} items complete
        </CardDescription>
        <CardAction>
          <span className="text-2xl font-semibold tabular-nums">{percent}%</span>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={percent} aria-label={`Profile ${percent}% complete`} />
        {missing.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-success-text">
            <CheckCircle2 className="size-4" aria-hidden="true" /> Your profile has every recommended section.
          </p>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-medium">Still missing</p>
            <ul aria-label="Missing profile items">
              {missing.map((item) => (
                <ChecklistRow key={item.label} item={item} />
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface VerificationChecklistCardProps {
  entityType: ProviderType
  verification: Verification
  steps: ChecklistItem[]
  latestCase?: VerificationCase
  canEdit: boolean
  onSubmit: (note?: string) => void
  className?: string
}

/** Verification status, step checklist and the (simulated) submit CTA. */
export function VerificationChecklistCard({ entityType, verification, steps, latestCase, canEdit, onSubmit, className }: VerificationChecklistCardProps) {
  const { status } = verification
  const submittable = canSubmitForVerification(status)
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" aria-hidden="true" /> Verification
        </CardTitle>
        <CardDescription>{VERIFICATION_DESCRIPTIONS[status]}</CardDescription>
        <CardAction>
          <VerificationBadge status={status} lastVerifiedAt={verification.lastVerifiedAt} />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {verification.note && (status === "rejected" || status === "expired") && (
          <p className="rounded-md bg-warning-soft p-3 text-sm text-warning-text">
            <span className="font-medium">Reviewer note:</span> {verification.note}
          </p>
        )}
        <ol aria-label="Verification steps">
          {steps.map((s) => (
            <ChecklistRow key={s.label} item={s} />
          ))}
        </ol>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 border-t">
        {submittable ? (
          <>
            <ConfirmDialog
              title="Submit for verification?"
              description="This opens a verification case with placeholder evidence references. No real documents are uploaded and the platform decides the outcome — submitting does not verify your profile."
              confirmLabel="Submit"
              withNote
              noteLabel="Note for the reviewer"
              onConfirm={(note) => onSubmit(note)}
              trigger={
                <Button disabled={!canEdit}>
                  <ClipboardList /> {status === "unverified" ? "Submit for verification" : "Resubmit for verification"}
                </Button>
              }
            />
            {!canEdit && <p className="text-xs text-muted-foreground">Only {entityType === "hospital" ? "hospital admins" : "the doctor"} can submit for verification.</p>}
          </>
        ) : status === "verified" ? (
          <p className="text-sm text-muted-foreground">
            Last verified {formatDate(verification.lastVerifiedAt)}
            {verification.reviewedBy ? ` by ${verification.reviewedBy}` : ""}. <VerificationExplainer />
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {latestCase ? `Case submitted ${formatRelative(latestCase.submittedAt)}. ` : ""}A platform reviewer will update the status. (Demo)
          </p>
        )}
      </CardFooter>
    </Card>
  )
}

/** Banner listing provider change requests awaiting platform review. */
export function PendingChangesNotice({ requests, verified, max = 3 }: { requests: ChangeRequest[]; verified: boolean; max?: number }) {
  if (requests.length === 0) return null
  const shown = requests.slice(0, max)
  return (
    <section aria-labelledby="pending-changes-title" className="rounded-xl border border-info-text/20 bg-info-soft p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info">Pending review</Badge>
        <h2 id="pending-changes-title" className="font-semibold text-info-text">
          {requests.length} change {requests.length === 1 ? "request" : "requests"} awaiting platform review
        </h2>
      </div>
      <p className="mt-1 text-muted-foreground">
        Changes are shown on your profile in this demo while the platform reviews them.
        {verified && " Your verification status is unchanged, but some changes may need re-verification."}
      </p>
      <ul className="mt-3 space-y-2">
        {shown.map((r) => (
          <li key={r.id} className="rounded-lg border bg-card p-3">
            <p className="font-medium">{r.summary}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {r.fields.map(fieldLabel).join(", ")} · {r.submittedBy} · <time dateTime={r.submittedAt}>{formatRelative(r.submittedAt)}</time>
            </p>
          </li>
        ))}
      </ul>
      {requests.length > max && <p className="mt-2 text-xs text-muted-foreground">+ {requests.length - max} more pending</p>}
    </section>
  )
}

/** Explains why controls are disabled for hospital staff. */
export function ReadOnlyNotice({ children }: { children?: ReactNode }) {
  return (
    <div role="note" className="flex items-start gap-3 rounded-xl border bg-muted/50 p-4 text-sm">
      <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <p className="text-muted-foreground">
        {children ?? (
          <>
            <span className="font-medium text-foreground">View only.</span> Profile edits are limited to hospital admins. As staff you can manage enquiries,
            appointments and availability.
          </>
        )}
      </p>
    </div>
  )
}

export function MissingProviderState({ kind }: { kind: ProviderType }) {
  return (
    <EmptyState
      icon={kind === "hospital" ? Building2 : Stethoscope}
      title={kind === "hospital" ? "No hospital linked to this account" : "No doctor profile linked to this account"}
      description={
        kind === "hospital"
          ? "Sign in with a hospital admin or staff demo account to manage a hospital listing."
          : "Sign in with a doctor demo account to manage a doctor profile."
      }
      action={
        <Button asChild variant="outline">
          <Link to="/account/login">Switch demo account</Link>
        </Button>
      }
    />
  )
}

/** Sticky bar shown while a draft differs from saved data. */
export function UnsavedChangesBar({ dirty, onSave, onDiscard, disabled, label = "Save changes" }: { dirty: boolean; onSave: () => void; onDiscard: () => void; disabled?: boolean; label?: string }) {
  return (
    <div
      className={cn(
        "sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between",
        !dirty && "hidden",
      )}
      aria-live="polite"
    >
      <p className="text-sm">
        <span className="font-medium">Unsaved changes.</span> <span className="text-muted-foreground">Saving sends them for platform review.</span>
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onDiscard}>
          Discard
        </Button>
        <Button onClick={onSave} disabled={disabled}>
          {label}
        </Button>
      </div>
    </div>
  )
}
