import { toast } from "sonner"
import { getManagedDoctor } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { nowISO } from "@/lib/mock-storage"
import type { Doctor } from "@/types"
import { canSubmitForVerification } from "@/features/provider-hospital/lib/provider-workflow"
import { useProviderWorkflow, type RecordChangeOptions } from "@/features/provider-hospital/use-provider-workflow"

/** The doctor profile linked to the signed-in doctor user, plus portal helpers. */
export function useManagedDoctor() {
  const { data, currentUser } = useDemoStore()
  const doctor = getManagedDoctor(data, currentUser)
  const workflow = useProviderWorkflow("doctor", doctor)
  const { update, logAudit } = workflow

  const saveDoctor = (patch: Partial<Doctor>, opts: RecordChangeOptions) => {
    if (!doctor) return
    update("doctors", doctor.id, (prev) => ({ ...prev, ...patch, updatedAt: nowISO() }))
    workflow.recordChange(opts)
  }

  /** Claim the profile; opens a "submitted" verification case when eligible. */
  const claimProfile = () => {
    if (!doctor || doctor.claimed) return
    update("doctors", doctor.id, (prev) => ({ ...prev, claimed: true, updatedAt: nowISO() }))
    logAudit({ action: "doctor.claimed", entityType: "doctor", entityId: doctor.id, summary: `${doctor.name} claimed their profile.` })
    if (canSubmitForVerification(doctor.verification.status)) workflow.submitForVerification("Opened from profile claim")
    else toast.success("Profile claimed", { description: "Saved locally in this demo." })
  }

  return { ...workflow, doctor, canEdit: currentUser?.role === "doctor", saveDoctor, claimProfile }
}
