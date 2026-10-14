import { toast } from "sonner"
import { useDemoStore } from "@/hooks/use-demo-store"
import { createId, nowISO } from "@/lib/mock-storage"
import type { ProviderType, Verification } from "@/types"
import {
  VERIFICATION_CHECKLIST,
  VERIFICATION_EVIDENCE,
  canSubmitForVerification,
  getLatestCase,
  getPendingChanges,
} from "./lib/provider-workflow"

export interface ProviderRef {
  id: string
  name: string
  verification: Verification
}

export interface RecordChangeOptions {
  /** Changed field keys (see FIELD_LABELS). */
  fields: string[]
  summary: string
  /** Audit action, e.g. "hospital.profile_updated". */
  action: string
  /** Material changes create a pending change request for platform review. */
  material?: boolean
  toastTitle?: string
}

/**
 * Shared change-request / verification-case workflow for both provider
 * portals. Verification status is only ever moved to "submitted" here.
 */
export function useProviderWorkflow(entityType: ProviderType, entity: ProviderRef | undefined) {
  const store = useDemoStore()
  const { data, currentUser, create, update, logAudit, notify } = store
  const pendingChanges = getPendingChanges(data, entityType, entity?.id)
  const latestCase = getLatestCase(data, entityType, entity?.id)
  const actor = currentUser?.name ?? "Provider (demo)"
  const collection = entityType === "hospital" ? "hospitals" : "doctors"
  const adminLink = entityType === "hospital" ? "/admin/hospitals" : "/admin/doctors"

  /** Call after the record itself has been patched locally. */
  const recordChange = ({ fields, summary, action, material = true, toastTitle = "Changes saved" }: RecordChangeOptions) => {
    if (!entity) return
    logAudit({ action, entityType, entityId: entity.id, summary: `${summary} — ${entity.name}` })
    if (material) {
      create("changeRequests", {
        id: createId("cr"),
        entityType,
        entityId: entity.id,
        summary,
        fields,
        status: "pending",
        submittedBy: actor,
        submittedAt: nowISO(),
      })
      notify({
        type: "profile_approval",
        title: "Profile change request",
        message: `${entity.name}: ${summary}`,
        audience: "platform_admin",
        link: adminLink,
      })
      toast.success(`${toastTitle} — pending review`, {
        description:
          entity.verification.status === "verified"
            ? "Shown on your profile locally. The platform will review it; some changes may need re-verification. (Demo)"
            : "Shown on your profile locally and sent for platform review. (Demo)",
      })
    } else {
      toast.success(toastTitle, { description: "Saved locally in this demo." })
    }
  }

  const submitForVerification = (note?: string) => {
    if (!entity || !canSubmitForVerification(entity.verification.status)) return
    const at = nowISO()
    const caseId = createId("vc")
    const patchVerification = (v: Verification): Verification => ({ ...v, status: "submitted", note: undefined })
    if (collection === "hospitals") update("hospitals", entity.id, (prev) => ({ ...prev, verification: patchVerification(prev.verification), updatedAt: at }))
    else update("doctors", entity.id, (prev) => ({ ...prev, verification: patchVerification(prev.verification), updatedAt: at }))
    create("verificationCases", {
      id: caseId,
      entityType,
      entityId: entity.id,
      entityName: entity.name,
      status: "submitted",
      submittedAt: at,
      evidence: VERIFICATION_EVIDENCE[entityType].map((label, i) => ({
        id: createId("ev"),
        label: `${label} (placeholder)`,
        reference: `EVIDENCE-PLACEHOLDER-${caseId.slice(-4).toUpperCase()}${i + 1}`,
      })),
      checklist: VERIFICATION_CHECKLIST[entityType].map((label) => ({ label, done: false })),
      history: [{ id: createId("ev"), at, label: "Case submitted", actor, note }],
      notes: note,
    })
    logAudit({ action: "verification.submitted", entityType, entityId: entity.id, summary: `Verification submitted for ${entity.name}.` })
    notify({
      type: "verification_update",
      title: "New verification case",
      message: `${entity.name} submitted placeholder evidence for verification.`,
      audience: "platform_admin",
      link: "/admin/verifications",
    })
    toast.success("Submitted for verification", {
      description: "A platform reviewer will check your placeholder evidence. No real documents are uploaded in this demo.",
    })
  }

  return { ...store, pendingChanges, latestCase, recordChange, submitForVerification }
}
