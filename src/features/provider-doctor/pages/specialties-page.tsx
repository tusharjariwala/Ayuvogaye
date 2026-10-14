import { AlertTriangle } from "lucide-react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { getTreatmentsForSpecialty } from "@/data/selectors"
import { MissingProviderState, PendingChangesNotice, UnsavedChangesBar } from "@/features/provider-hospital/components/portal-widgets"
import { isSameSet, summarizeFields } from "@/features/provider-hospital/lib/provider-workflow"
import type { Doctor } from "@/types"
import { useManagedDoctor } from "../use-managed-doctor"

function SpecialtiesEditor({ doctor }: { doctor: Doctor }) {
  const { data, pendingChanges, saveDoctor } = useManagedDoctor()
  const [specialtyId, setSpecialtyId] = useState(doctor.specialtyId)
  const [subSpecialty, setSubSpecialty] = useState(doctor.subSpecialty ?? "")
  const [treatmentIds, setTreatmentIds] = useState<string[]>(doctor.treatmentIds)

  const treatments = getTreatmentsForSpecialty(data, specialtyId).sort((a, b) => a.name.localeCompare(b.name))
  const specialtyChanged = specialtyId !== doctor.specialtyId
  const dirty = specialtyChanged || subSpecialty.trim() !== (doctor.subSpecialty ?? "") || !isSameSet(treatmentIds, doctor.treatmentIds)
  const specialties = [...data.specialties].sort((a, b) => a.name.localeCompare(b.name))

  const changeSpecialty = (id: string) => {
    setSpecialtyId(id)
    // Keep only treatments that belong to the new specialty.
    const allowed = new Set(getTreatmentsForSpecialty(data, id).map((t) => t.id))
    setTreatmentIds((prev) => prev.filter((t) => allowed.has(t)))
  }

  const save = () => {
    const fields = [
      specialtyChanged ? "specialtyId" : "",
      subSpecialty.trim() !== (doctor.subSpecialty ?? "") ? "subSpecialty" : "",
      !isSameSet(treatmentIds, doctor.treatmentIds) ? "treatmentIds" : "",
    ].filter(Boolean)
    saveDoctor(
      { specialtyId, subSpecialty: subSpecialty.trim() || undefined, treatmentIds },
      { fields, summary: summarizeFields("Updated", fields), action: "doctor.specialties_updated", toastTitle: "Specialties saved" },
    )
  }

  const reset = () => {
    setSpecialtyId(doctor.specialtyId)
    setSubSpecialty(doctor.subSpecialty ?? "")
    setTreatmentIds(doctor.treatmentIds)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Specialties" description="Your primary specialty decides where you appear in search. Treatments are limited to those within that specialty." />
      <PendingChangesNotice
        requests={pendingChanges.filter((c) => c.fields.some((f) => ["specialtyId", "subSpecialty", "treatmentIds"].includes(f)))}
        verified={doctor.verification.status === "verified"}
      />

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Card className="lg:self-start">
          <CardHeader>
            <CardTitle>
              <h2>Specialty</h2>
            </CardTitle>
            <CardDescription>Choose the specialty you are registered and practising in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primary-specialty">Primary specialty</Label>
              <Select value={specialtyId} onValueChange={changeSpecialty}>
                <SelectTrigger id="primary-specialty" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {specialtyChanged && (
              <p role="status" className="flex items-start gap-2 rounded-md bg-warning-soft p-3 text-sm text-warning-text">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Changing your primary specialty is reviewed by the platform and may require re-verification.
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="sub-specialty">Sub-specialty (optional)</Label>
              <Input id="sub-specialty" value={subSpecialty} maxLength={80} onChange={(e) => setSubSpecialty(e.target.value)} placeholder="e.g. Interventional cardiology" />
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>
              <h2>
                Treatments offered <span className="text-muted-foreground tabular-nums">({treatmentIds.length})</span>
              </h2>
            </CardTitle>
            <CardDescription>Only treatments linked to your primary specialty are listed.</CardDescription>
          </CardHeader>
          <CardContent>
            {treatments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No treatments are listed for this specialty yet.</p>
            ) : (
              <fieldset>
                <legend className="sr-only">Treatments offered</legend>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {treatments.map((t) => (
                    <li key={t.id} className="flex items-start gap-3 rounded-lg border p-3">
                      <Checkbox
                        id={`dt-${t.id}`}
                        checked={treatmentIds.includes(t.id)}
                        onCheckedChange={(v) => setTreatmentIds((prev) => (v === true ? [...prev, t.id] : prev.filter((x) => x !== t.id)))}
                        className="mt-0.5"
                      />
                      <div className="min-w-0">
                        <Label htmlFor={`dt-${t.id}`}>{t.name}</Label>
                        <p className="text-xs text-muted-foreground">{t.category}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </fieldset>
            )}
          </CardContent>
        </Card>
      </div>

      <UnsavedChangesBar dirty={dirty} onSave={save} onDiscard={reset} />
    </div>
  )
}

export default function SpecialtiesPage() {
  const { doctor } = useManagedDoctor()
  if (!doctor) return <MissingProviderState kind="doctor" />
  return <SpecialtiesEditor key={doctor.updatedAt} doctor={doctor} />
}
