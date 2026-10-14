import { useCallback } from "react"
import { toast } from "sonner"
import { useDemoStore } from "@/hooks/use-demo-store"
import { VERIFICATION_LABELS } from "@/lib/constants"
import { createId, nowISO } from "@/lib/mock-storage"
import type { ProviderType, Verification, VerificationCase, VerificationStatus } from "@/types"
import { actorName, getProvider, latestCase } from "../lib/admin-helpers"
import { useProviderNotify } from "./use-provider-notify"

export type VerificationDecision = "start_review" | "approve" | "reject" | "request_changes" | "mark_expired"

interface DecisionConfig {
  status: VerificationStatus
  label: string
  /** Title used in confirmation dialogs. */
  verb: string
  audit: string
  noteRequired: boolean
  destructive: boolean
}

export const VERIFICATION_DECISIONS: Record<VerificationDecision, DecisionConfig> = {
  start_review: { status: "under_review", label: "Review started", verb: "Start review", audit: "verification.review_started", noteRequired: false, destructive: false },
  approve: { status: "verified", label: "Verification approved", verb: "Approve verification", audit: "verification.approved", noteRequired: false, destructive: false },
  reject: { status: "rejected", label: "Verification rejected", verb: "Reject verification", audit: "verification.rejected", noteRequired: true, destructive: true },
  request_changes: { status: "submitted", label: "Changes requested", verb: "Request changes", audit: "verification.info_requested", noteRequired: true, destructive: false },
  mark_expired: { status: "expired", label: "Marked as needs reverification", verb: "Mark needs reverification", audit: "verification.expired", noteRequired: false, destructive: true },
}

/** Which decisions make sense from a given status. */
export function availableDecisions(status: VerificationStatus): VerificationDecision[] {
  switch (status) {
    case "unverified":
    case "submitted":
      return ["start_review", "approve", "reject", "request_changes"]
    case "under_review":
      return ["approve", "reject", "request_changes"]
    case "verified":
      return ["mark_expired", "reject"]
    case "rejected":
      return ["start_review", "approve"]
    case "expired":
      return ["start_review", "approve", "reject"]
  }
}

const DEFAULT_EVIDENCE: Record<ProviderType, string[]> = {
  hospital: ["Registration certificate", "Accreditation certificate", "Authorised signatory letter"],
  doctor: ["Medical council registration", "Degree certificate", "Hospital affiliation letter"],
}

const DEFAULT_CHECKLIST: Record<ProviderType, string[]> = {
  hospital: ["Registration placeholder matches listing name", "Address and pincode confirmed", "Authorised contact confirmed"],
  doctor: ["Registration placeholder matches doctor name", "Qualifications cross-checked", "Affiliation confirmed with hospital"],
}

export function buildNewCase(type: ProviderType, entityId: string, entityName: string, actor: string): VerificationCase {
  const caseId = createId("vc")
  const at = nowISO()
  return {
    id: caseId,
    entityType: type,
    entityId,
    entityName,
    status: "submitted",
    submittedAt: at,
    evidence: DEFAULT_EVIDENCE[type].map((label, i) => ({
      id: createId("ev"),
      label: `${label} (placeholder)`,
      reference: `EVIDENCE-PLACEHOLDER-${caseId.slice(3, 9).toUpperCase()}${i + 1}`,
    })),
    checklist: DEFAULT_CHECKLIST[type].map((label) => ({ label, done: false })),
    history: [{ id: createId("ev"), at, label: "Case opened", actor }],
  }
}

/**
 * Single place for verification decisions. Keeps the provider's `verification`
 * field and its verification case in sync, writes the audit log, notifies the
 * linked provider account and shows a toast. All local and simulated.
 */
export function useVerificationActions() {
  const { data, update, create, logAudit, currentUser } = useDemoStore()
  const notifyProvider = useProviderNotify()
  const actor = actorName(currentUser)

  const decide = useCallback(
    (type: ProviderType, id: string, decision: VerificationDecision, note?: string) => {
      const provider = getProvider(data, type, id)
      if (!provider) return
      const cfg = VERIFICATION_DECISIONS[decision]
      const at = nowISO()
      const prev = provider.verification
      const caseNote = decision === "request_changes" ? `Changes requested: ${note ?? ""}`.trim() : note

      const verification: Verification =
        decision === "approve"
          ? { status: "verified", lastVerifiedAt: at, reviewedBy: actor, note }
          : decision === "start_review"
            ? { ...prev, status: "under_review", reviewedBy: actor }
            : { ...prev, status: cfg.status, reviewedBy: actor, note: caseNote }

      if (type === "hospital") update("hospitals", id, { verification, updatedAt: at })
      else update("doctors", id, { verification, updatedAt: at })

      const event = { id: createId("ev"), at, label: cfg.label, actor, note: caseNote }
      const existing = latestCase(data, type, id)
      if (existing) {
        update("verificationCases", existing.id, (c) => ({
          ...c,
          status: cfg.status,
          reviewer: actor,
          reviewedAt: decision === "start_review" ? c.reviewedAt : at,
          notes: caseNote ?? c.notes,
          history: [...c.history, event],
        }))
      } else {
        const fresh = buildNewCase(type, id, provider.name, actor)
        create("verificationCases", {
          ...fresh,
          status: cfg.status,
          reviewer: actor,
          reviewedAt: decision === "start_review" ? undefined : at,
          notes: caseNote,
          history: [...fresh.history, event],
        })
      }

      logAudit({
        action: cfg.audit,
        entityType: type,
        entityId: id,
        summary: `${provider.name}: ${cfg.label.toLowerCase()} (${VERIFICATION_LABELS[cfg.status]})${caseNote ? ` — ${caseNote}` : ""}.`,
      })
      notifyProvider(type, id, {
        type: "verification_update",
        title: `Verification: ${VERIFICATION_LABELS[cfg.status]}`,
        message: `${cfg.label} for ${provider.name}${caseNote ? `: ${caseNote}` : ""}. No documents were actually reviewed in this demo.`,
      })
      toast.success(`${provider.name}: ${cfg.label.toLowerCase()}`, {
        description: "Demo action — verification is simulated and no documents are stored.",
      })
    },
    [actor, create, data, logAudit, notifyProvider, update],
  )

  const toggleChecklistItem = useCallback(
    (caseId: string, index: number) => {
      update("verificationCases", caseId, (c) => ({
        ...c,
        checklist: c.checklist.map((item, i) => (i === index ? { ...item, done: !item.done } : item)),
      }))
    },
    [update],
  )

  return { decide, toggleChecklistItem }
}
