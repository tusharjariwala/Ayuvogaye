import { Building2, CalendarDays, ExternalLink, Link2, Plus, Unlink } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/shared/overlays"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/states"
import { StatusBadge } from "@/components/shared/status-badge"
import { VerificationBadge } from "@/components/shared/verification-badge"
import { getHospital } from "@/data/selectors"
import { AffiliationDialog } from "@/features/provider-hospital/components/affiliation-dialog"
import { MissingProviderState } from "@/features/provider-hospital/components/portal-widgets"
import { WEEKDAY_SHORT, validateAffiliation, type AffiliationDraft, type AffiliationErrors } from "@/features/provider-hospital/lib/provider-workflow"
import { createId } from "@/lib/mock-storage"
import type { Affiliation } from "@/types"
import { useManagedDoctor } from "../use-managed-doctor"

const EMPTY: AffiliationDraft = { targetId: "", role: "", days: [] }
const ORDER: Record<Affiliation["status"], number> = { active: 0, pending: 1, ended: 2 }

export default function AffiliationsPage() {
  const { doctor, data, create, update, logAudit } = useManagedDoctor()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<AffiliationDraft>(EMPTY)
  const [errors, setErrors] = useState<AffiliationErrors>({})

  if (!doctor) return <MissingProviderState kind="doctor" />

  const affiliations = data.affiliations.filter((a) => a.doctorId === doctor.id).sort((a, b) => ORDER[a.status] - ORDER[b.status])
  const linked = new Set(affiliations.filter((a) => a.status !== "ended").map((a) => a.hospitalId))
  const candidates = data.hospitals.filter((h) => !linked.has(h.id) && h.status === "active").sort((a, b) => a.name.localeCompare(b.name))

  const submit = () => {
    const e = validateAffiliation(draft, true)
    setErrors(e)
    if (Object.keys(e).length > 0) return false
    const hospital = getHospital(data, draft.targetId)
    create("affiliations", { id: createId("aff"), doctorId: doctor.id, hospitalId: draft.targetId, role: draft.role.trim(), days: draft.days, status: "pending" })
    logAudit({ action: "affiliation.requested", entityType: "doctor", entityId: doctor.id, summary: `${doctor.name} requested an affiliation with ${hospital?.name ?? "a hospital"}.` })
    toast.success("Affiliation requested (demo)", { description: `It stays pending until ${hospital?.name ?? "the hospital"} confirms it.` })
  }

  const end = (a: Affiliation) => {
    const hospital = getHospital(data, a.hospitalId)
    update("affiliations", a.id, { status: "ended" })
    logAudit({ action: "affiliation.ended", entityType: "doctor", entityId: doctor.id, summary: `${doctor.name} ended the affiliation with ${hospital?.name ?? "a hospital"}.` })
    toast.success(a.status === "pending" ? "Request withdrawn" : "Affiliation ended", { description: "Saved locally in this demo." })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Affiliations"
        description="Hospitals where you consult. New affiliations stay pending until the hospital confirms them."
        actions={
          <Button
            disabled={candidates.length === 0}
            onClick={() => {
              setDraft(EMPTY)
              setErrors({})
              setOpen(true)
            }}
          >
            <Plus /> Request affiliation
          </Button>
        }
      />

      {affiliations.length === 0 ? (
        <EmptyState icon={Link2} title="No affiliations yet" description="Request an affiliation with a hospital where you consult." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {affiliations.map((a) => {
            const hospital = getHospital(data, a.hospitalId)
            return (
              <li key={a.id}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>
                      <h2 className="flex items-start gap-2">
                        <Building2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                        {hospital?.name ?? "Unknown hospital"}
                      </h2>
                    </CardTitle>
                    <CardDescription>
                      {a.role}
                      {hospital ? ` · ${hospital.city}` : ""}
                    </CardDescription>
                    <CardAction>
                      <StatusBadge status={a.status} />
                    </CardAction>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3 text-sm">
                    <p className="flex items-center gap-2">
                      <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
                      {a.days.map((d) => WEEKDAY_SHORT[d]).join(", ") || "No days set"}
                    </p>
                    {hospital && <VerificationBadge status={hospital.verification.status} lastVerifiedAt={hospital.verification.lastVerifiedAt} />}
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2 border-t">
                    {hospital && (
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/hospital/${hospital.slug}`}>
                          <ExternalLink /> View hospital
                        </Link>
                      </Button>
                    )}
                    {a.status !== "ended" && (
                      <ConfirmDialog
                        title={a.status === "pending" ? "Withdraw affiliation request?" : "End this affiliation?"}
                        description={`You will no longer be listed under ${hospital?.name ?? "this hospital"}. The record is kept with status “ended”.`}
                        confirmLabel={a.status === "pending" ? "Withdraw" : "End affiliation"}
                        destructive
                        onConfirm={() => end(a)}
                        trigger={
                          <Button variant="outline" size="sm" className="ml-auto">
                            <Unlink /> {a.status === "pending" ? "Withdraw" : "End"}
                          </Button>
                        }
                      />
                    )}
                  </CardFooter>
                </Card>
              </li>
            )
          })}
        </ul>
      )}

      <AffiliationDialog
        open={open}
        onOpenChange={setOpen}
        title="Request affiliation"
        description="The hospital will see your request as pending. Nothing is sent outside this demo."
        submitLabel="Send request"
        target={{ label: "Hospital", placeholder: "Choose a hospital", options: candidates.map((h) => ({ value: h.id, label: `${h.name}, ${h.city}` })) }}
        draft={draft}
        onDraftChange={setDraft}
        errors={errors}
        onSubmit={submit}
      />
    </div>
  )
}
