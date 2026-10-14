import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/shared/page-header"
import { SourceBadge } from "@/components/shared/trust-badges"
import type { Facility, Hospital } from "@/types"
import { MissingProviderState, PendingChangesNotice, ReadOnlyNotice, UnsavedChangesBar } from "../components/portal-widgets"
import { isSameSet, joinList } from "../lib/provider-workflow"
import { useManagedHospital } from "../use-managed-hospital"

const CATEGORY_LABELS: Record<Facility["category"], { label: string; description: string }> = {
  clinical: { label: "Clinical", description: "Critical care and treatment infrastructure" },
  diagnostics: { label: "Diagnostics", description: "Imaging and laboratory services" },
  emergency: { label: "Emergency", description: "Emergency and transport services" },
  patient_comfort: { label: "Patient comfort", description: "Amenities for patients and families" },
  accessibility: { label: "Accessibility", description: "Access and inclusion support" },
}

function FacilitiesEditor({ hospital }: { hospital: Hospital }) {
  const { data, canEdit, pendingChanges, saveHospital } = useManagedHospital()
  const [ids, setIds] = useState<string[]>(hospital.facilityIds)
  const dirty = !isSameSet(ids, hospital.facilityIds)
  const verified = hospital.verifiedFields.includes("facilities")
  const categories = Object.keys(CATEGORY_LABELS) as Facility["category"][]

  const save = () => {
    const name = (id: string) => data.facilities.find((f) => f.id === id)?.name ?? id
    const added = ids.filter((id) => !hospital.facilityIds.includes(id))
    const removed = hospital.facilityIds.filter((id) => !ids.includes(id))
    const parts = [added.length ? `added ${joinList(added.map(name))}` : "", removed.length ? `removed ${joinList(removed.map(name))}` : ""].filter(Boolean)
    saveHospital(
      { facilityIds: ids },
      {
        fields: ["facilityIds"],
        summary: `Facilities: ${parts.join("; ")}`,
        action: "hospital.facilities_updated",
        invalidateGroups: added.length ? ["facilities"] : [],
        toastTitle: "Facilities saved",
      },
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Facilities" description="Select the facilities available at your hospital. List only what patients can actually use." />
      {!canEdit && <ReadOnlyNotice />}
      <PendingChangesNotice requests={pendingChanges.filter((c) => c.fields.includes("facilityIds"))} verified={hospital.verification.status === "verified"} />
      <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        Current list: <SourceBadge source={verified ? "platform_verified" : "provider_submitted"} />
        {verified && "Adding facilities marks the list as provider-submitted until the platform re-checks it."}
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((cat) => {
          const items = data.facilities.filter((f) => f.category === cat)
          if (items.length === 0) return null
          const selected = items.filter((f) => ids.includes(f.id)).length
          return (
            <Card key={cat}>
              <CardHeader>
                <CardTitle>
                  <h2>
                    {CATEGORY_LABELS[cat].label}{" "}
                    <span className="text-sm font-normal text-muted-foreground tabular-nums">
                      {selected}/{items.length}
                    </span>
                  </h2>
                </CardTitle>
                <CardDescription>{CATEGORY_LABELS[cat].description}</CardDescription>
              </CardHeader>
              <CardContent>
                <fieldset>
                  <legend className="sr-only">{CATEGORY_LABELS[cat].label} facilities</legend>
                  <ul className="space-y-3">
                    {items.map((f) => (
                      <li key={f.id} className="flex items-center gap-3">
                        <Checkbox
                          id={`fac-${f.id}`}
                          checked={ids.includes(f.id)}
                          disabled={!canEdit}
                          onCheckedChange={(v) => setIds((prev) => (v === true ? [...prev, f.id] : prev.filter((x) => x !== f.id)))}
                        />
                        <Label htmlFor={`fac-${f.id}`} className="font-normal">
                          {f.name}
                        </Label>
                      </li>
                    ))}
                  </ul>
                </fieldset>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <UnsavedChangesBar dirty={dirty} onSave={save} onDiscard={() => setIds(hospital.facilityIds)} />
    </div>
  )
}

export default function FacilitiesPage() {
  const { hospital } = useManagedHospital()
  if (!hospital) return <MissingProviderState kind="hospital" />
  return <FacilitiesEditor key={hospital.updatedAt} hospital={hospital} />
}
