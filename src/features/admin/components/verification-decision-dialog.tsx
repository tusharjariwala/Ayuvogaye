import { ConfirmDialog } from "@/components/shared/overlays"
import { VERIFICATION_LABELS } from "@/lib/constants"
import type { ProviderType } from "@/types"
import { VERIFICATION_DECISIONS, useVerificationActions, type VerificationDecision } from "../hooks/use-verification-actions"

export interface PendingDecision {
  type: ProviderType
  ids: { id: string; name: string }[]
  decision: VerificationDecision
}

const DESCRIPTIONS: Record<VerificationDecision, string> = {
  start_review: "The case moves to Under review and you are recorded as the reviewer.",
  approve:
    "Selected details are marked as checked against the submitted evidence placeholders. Verification is not a ranking or an assessment of clinical quality.",
  reject: "The provider is told the submitted information could not be confirmed and may correct and resubmit.",
  request_changes: "The case is returned to the provider (status: Submitted) with your note describing the changes needed.",
  mark_expired: "The badge changes to Needs reverification until the provider renews their evidence.",
}

/** Confirmation for any verification decision (single or bulk). */
export function VerificationDecisionDialog({ pending, onClose }: { pending: PendingDecision | null; onClose: () => void }) {
  const { decide } = useVerificationActions()
  const cfg = pending ? VERIFICATION_DECISIONS[pending.decision] : null
  const subject = pending ? (pending.ids.length === 1 ? pending.ids[0].name : `${pending.ids.length} providers`) : ""
  return (
    <ConfirmDialog
      open={!!pending}
      onOpenChange={(o) => !o && onClose()}
      title={cfg ? `${cfg.verb}: ${subject}?` : ""}
      description={
        pending && cfg
          ? `${DESCRIPTIONS[pending.decision]} New status: ${VERIFICATION_LABELS[cfg.status]}. This is a simulated, local-only change.`
          : ""
      }
      confirmLabel={cfg?.verb ?? "Confirm"}
      destructive={cfg?.destructive}
      withNote
      noteLabel={pending?.decision === "request_changes" ? "Changes needed" : pending?.decision === "reject" ? "Reason" : "Reviewer note"}
      noteRequired={cfg?.noteRequired}
      onConfirm={(note) => {
        if (pending) pending.ids.forEach(({ id }) => decide(pending.type, id, pending.decision, note))
        onClose()
      }}
    />
  )
}
