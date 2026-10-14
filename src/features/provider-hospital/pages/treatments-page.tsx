import { Syringe } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { SearchInput } from "@/components/shared/filters"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/states"
import { getSpecialtyNames } from "@/data/selectors"
import { searchItems } from "@/lib/data-access"
import type { Hospital } from "@/types"
import { MissingProviderState, PendingChangesNotice, ReadOnlyNotice, UnsavedChangesBar } from "../components/portal-widgets"
import { isSameSet, joinList } from "../lib/provider-workflow"
import { useManagedHospital } from "../use-managed-hospital"

function TreatmentsEditor({ hospital }: { hospital: Hospital }) {
  const { data, canEdit, pendingChanges, saveHospital } = useManagedHospital()
  const [ids, setIds] = useState<string[]>(hospital.treatmentIds)
  const [query, setQuery] = useState("")
  const dirty = !isSameSet(ids, hospital.treatmentIds)

  const rows = searchItems(data.treatments, query, (t) => [t.name, t.category, ...getSpecialtyNames(data, t.specialtyIds)])
    .map((t) => ({ treatment: t, eligible: t.specialtyIds.some((s) => hospital.specialtyIds.includes(s)) }))
    .sort((a, b) => Number(b.eligible) - Number(a.eligible) || a.treatment.name.localeCompare(b.treatment.name))

  const toggle = (id: string, on: boolean) => setIds((prev) => (on ? [...prev, id] : prev.filter((x) => x !== id)))

  const save = () => {
    const name = (id: string) => data.treatments.find((t) => t.id === id)?.name ?? id
    const added = ids.filter((id) => !hospital.treatmentIds.includes(id)).map(name)
    const removed = hospital.treatmentIds.filter((id) => !ids.includes(id)).map(name)
    const parts = [added.length ? `added ${joinList(added)}` : "", removed.length ? `removed ${joinList(removed)}` : ""].filter(Boolean)
    saveHospital({ treatmentIds: ids }, { fields: ["treatmentIds"], summary: `Treatments: ${parts.join("; ")}`, action: "hospital.treatments_updated", toastTitle: "Treatments saved" })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Treatments" description="Choose the treatments and procedures your hospital offers. Only treatments that match your listed specialties can be added." />
      {!canEdit && <ReadOnlyNotice />}
      <PendingChangesNotice requests={pendingChanges.filter((c) => c.fields.includes("treatmentIds"))} verified={hospital.verification.status === "verified"} />

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>
              Offered treatments <span className="text-muted-foreground tabular-nums">({ids.length})</span>
            </h2>
          </CardTitle>
          <CardDescription>Treatment price ranges on public pages are illustrative estimates only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Search treatments or specialties…" label="Search treatments" />
          {rows.length === 0 ? (
            <EmptyState icon={Syringe} title="No treatments match" description="Try a different search term." />
          ) : (
            <ul className="divide-y rounded-lg border">
              {rows.map(({ treatment: t, eligible }) => {
                const id = `tr-${t.id}`
                const checked = ids.includes(t.id)
                const specialties = getSpecialtyNames(data, t.specialtyIds)
                return (
                  <li key={t.id} className="flex items-start gap-3 p-3">
                    <Checkbox
                      id={id}
                      checked={checked}
                      disabled={!canEdit || (!eligible && !checked)}
                      onCheckedChange={(v) => toggle(t.id, v === true)}
                      aria-describedby={`${id}-meta`}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <Label htmlFor={id} className="font-medium">
                        {t.name}
                      </Label>
                      <p id={`${id}-meta`} className="text-xs text-muted-foreground">
                        {t.category} · {specialties.join(", ")}
                        {!eligible && <> · Requires a {joinList(specialties)} department</>}
                      </p>
                    </div>
                    {!eligible && <Badge variant="muted">Not eligible</Badge>}
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <UnsavedChangesBar dirty={dirty} onSave={save} onDiscard={() => setIds(hospital.treatmentIds)} />
    </div>
  )
}

export default function TreatmentsPage() {
  const { hospital } = useManagedHospital()
  if (!hospital) return <MissingProviderState kind="hospital" />
  return <TreatmentsEditor key={hospital.updatedAt} hospital={hospital} />
}
