import { Award, Info, Plus, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmDialog, EntityFormDialog } from "@/components/shared/overlays"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/states"
import { SourceBadge } from "@/components/shared/trust-badges"
import { InlineError } from "../components/inline-error"
import { MissingProviderState, PendingChangesNotice, ReadOnlyNotice } from "../components/portal-widgets"
import { useManagedHospital } from "../use-managed-hospital"

export default function AccreditationsPage() {
  const { hospital, data, canEdit, pendingChanges, saveHospital } = useManagedHospital()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState("")
  const [evidenceRef, setEvidenceRef] = useState("")
  const [error, setError] = useState<string>()

  if (!hospital) return <MissingProviderState kind="hospital" />
  const listed = hospital.accreditationIds.map((id) => data.accreditations.find((a) => a.id === id)).filter((a) => a !== undefined)
  const available = data.accreditations.filter((a) => !hospital.accreditationIds.includes(a.id))
  const groupVerified = hospital.verifiedFields.includes("accreditations")

  const add = () => {
    const acc = data.accreditations.find((a) => a.id === selected)
    if (!acc) {
      setError("Choose an accreditation")
      return false
    }
    const ref = evidenceRef.trim()
    saveHospital(
      { accreditationIds: [...hospital.accreditationIds, acc.id] },
      {
        fields: ["accreditationIds"],
        summary: `Added ${acc.code} accreditation${ref ? ` (evidence ref: ${ref})` : " (no evidence reference yet)"}`,
        action: "hospital.accreditation_added",
        invalidateGroups: ["accreditations"],
        toastTitle: "Accreditation added",
      },
    )
    setSelected("")
    setEvidenceRef("")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accreditations"
        description="Accreditations listed on your profile. The platform verifies accreditations against evidence before marking them platform-verified."
        actions={
          canEdit && (
            <Button
              disabled={available.length === 0}
              onClick={() => {
                setError(undefined)
                setOpen(true)
              }}
            >
              <Plus /> Add accreditation
            </Button>
          )
        }
      />
      {!canEdit && <ReadOnlyNotice />}
      <PendingChangesNotice requests={pendingChanges.filter((c) => c.fields.includes("accreditationIds"))} verified={hospital.verification.status === "verified"} />

      <div role="note" className="flex items-start gap-3 rounded-xl border bg-info-soft p-4 text-sm text-info-text">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          Adding an accreditation marks the list as provider-submitted until a platform reviewer checks it. Evidence references are placeholders — no
          certificates are uploaded in this demo.
        </p>
      </div>

      {listed.length === 0 ? (
        <EmptyState icon={Award} title="No accreditations listed" description="Add accreditations your hospital currently holds." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {listed.map((a) => (
            <li key={a.id}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>
                    <h2 className="flex flex-wrap items-center gap-2">
                      <Award className="size-5 text-primary" aria-hidden="true" /> {a.code}
                    </h2>
                  </CardTitle>
                  <CardDescription>{a.name}</CardDescription>
                  {canEdit && (
                    <CardAction>
                      <ConfirmDialog
                        title={`Remove ${a.code}?`}
                        description="The accreditation will be removed from your public profile and the change sent for platform review (demo)."
                        confirmLabel="Remove"
                        destructive
                        onConfirm={() =>
                          saveHospital(
                            { accreditationIds: hospital.accreditationIds.filter((x) => x !== a.id) },
                            { fields: ["accreditationIds"], summary: `Removed ${a.code} accreditation`, action: "hospital.accreditation_removed", toastTitle: "Accreditation removed" },
                          )
                        }
                        trigger={
                          <Button variant="ghost" size="icon-sm" aria-label={`Remove ${a.code}`}>
                            <X />
                          </Button>
                        }
                      />
                    </CardAction>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                  <SourceBadge source={groupVerified ? "platform_verified" : "provider_submitted"} />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Add accreditation"
        description="The platform verifies accreditations before they are shown as platform-verified."
        submitLabel="Add & submit for review"
        onSubmit={add}
      >
        <div className="space-y-2">
          <Label htmlFor="acc-select">Accreditation</Label>
          <Select
            value={selected}
            onValueChange={(v) => {
              setSelected(v)
              setError(undefined)
            }}
          >
            <SelectTrigger id="acc-select" className="w-full" aria-invalid={!!error} aria-describedby={error ? "acc-select-err" : undefined}>
              <SelectValue placeholder="Choose an accreditation" />
            </SelectTrigger>
            <SelectContent>
              {available.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.code} — {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <InlineError id="acc-select-err" message={error} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="acc-evidence">Evidence reference (placeholder, optional)</Label>
          <Input id="acc-evidence" value={evidenceRef} onChange={(e) => setEvidenceRef(e.target.value)} placeholder="e.g. CERT-PLACEHOLDER-001" aria-describedby="acc-evidence-help" />
          <p id="acc-evidence-help" className="text-xs text-muted-foreground">
            Only noted in the change request for the reviewer. Do not enter real certificate numbers.
          </p>
        </div>
      </EntityFormDialog>
    </div>
  )
}
