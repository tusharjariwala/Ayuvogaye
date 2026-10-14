import { getManagedHospital } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { nowISO } from "@/lib/mock-storage"
import type { Hospital } from "@/types"
import { useProviderWorkflow, type RecordChangeOptions } from "./use-provider-workflow"

export interface SaveHospitalOptions extends RecordChangeOptions {
  /** Platform-verified field groups that this edit invalidates (e.g. "facilities"). */
  invalidateGroups?: string[]
}

/** The hospital managed by the signed-in hospital admin / staff user, plus portal helpers. */
export function useManagedHospital() {
  const { data, currentUser } = useDemoStore()
  const hospital = getManagedHospital(data, currentUser)
  const workflow = useProviderWorkflow("hospital", hospital)
  const { update } = workflow
  /** Profile-type edits are restricted to hospital admins; staff manage leads. */
  const canEdit = currentUser?.role === "hospital_admin"

  const saveHospital = (patch: Partial<Hospital>, { invalidateGroups = [], ...opts }: SaveHospitalOptions) => {
    if (!hospital) return
    update("hospitals", hospital.id, (prev) => ({
      ...prev,
      ...patch,
      // Never touch `verification` here — only verifiedFields that are no longer accurate are dropped.
      verifiedFields: prev.verifiedFields.filter((g) => !invalidateGroups.includes(g)),
      updatedAt: nowISO(),
    }))
    workflow.recordChange(opts)
  }

  return { ...workflow, hospital, canEdit, saveHospital }
}
