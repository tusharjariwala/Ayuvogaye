import { GitCompareArrows, Info, Trash2 } from "lucide-react"
import { useId, useMemo, useState } from "react"
import { Link } from "react-router"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { HospitalCard } from "@/components/shared/entity-cards"
import { ConfirmDialog } from "@/components/shared/overlays"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/states"
import { getHospital } from "@/data/selectors"
import { useCompare } from "@/hooks/use-compare"
import { useDemoStore } from "@/hooks/use-demo-store"
import { MAX_COMPARE, MIN_COMPARE } from "@/lib/constants"
import type { Hospital } from "@/types"
import { AddHospitalCombobox } from "../components/add-hospital-combobox"
import { ComparisonView } from "../components/comparison-view"

const NO_TREATMENT = "__none"

export default function CompareHospitalsPage() {
  const { data } = useDemoStore()
  const { compareIds, remove, clear } = useCompare()
  const [treatmentId, setTreatmentId] = useState(NO_TREATMENT)
  const [highlight, setHighlight] = useState(false)
  const id = useId()

  const hospitals = useMemo(
    () => compareIds.map((cid) => getHospital(data, cid)).filter((h): h is Hospital => !!h).slice(0, MAX_COMPARE),
    [compareIds, data],
  )

  const treatmentOptions = useMemo(() => {
    const ids = new Set(hospitals.flatMap((h) => h.treatmentIds))
    return data.treatments.filter((t) => ids.has(t.id)).sort((a, b) => a.name.localeCompare(b.name))
  }, [data.treatments, hospitals])

  const suggestions = useMemo(
    () => data.hospitals.filter((h) => h.status !== "suspended" && !compareIds.includes(h.id)).slice(0, 3),
    [data.hospitals, compareIds],
  )

  const actions = (
    <>
      <AddHospitalCombobox />
      {hospitals.length > 0 && (
        <ConfirmDialog
          title="Clear comparison?"
          description="This removes all hospitals from your comparison. You can add them again at any time."
          confirmLabel="Clear all"
          destructive
          onConfirm={clear}
          trigger={
            <Button variant="ghost">
              <Trash2 /> Clear all
            </Button>
          }
        />
      )}
    </>
  )

  return (
    <div className="container-page space-y-6 py-8">
      <PageHeader
        title="Compare hospitals"
        description={`Compare up to ${MAX_COMPARE} hospitals side by side on listed facts — facilities, specialties, accreditations, availability and sample reviews.`}
        actions={actions}
      />

      <Alert>
        <Info aria-hidden="true" />
        <AlertDescription>
          This comparison is factual and is not a ranking. There is no overall score or “best” hospital — what matters depends on your
          needs. Most details are provider-submitted; check each profile's verification section.
        </AlertDescription>
      </Alert>

      {hospitals.length === 0 ? (
        <EmptyState
          icon={GitCompareArrows}
          title="No hospitals selected"
          description={`Add at least ${MIN_COMPARE} hospitals using “Add hospital”, or use the Compare button on any hospital card.`}
          action={
            <Button asChild>
              <Link to="/hospitals">Browse hospitals</Link>
            </Button>
          }
        />
      ) : hospitals.length < MIN_COMPARE ? (
        <div className="space-y-6">
          <EmptyState
            icon={GitCompareArrows}
            title="Add at least one more hospital"
            description={`${hospitals[0].name} is selected. Add another hospital to see a side-by-side comparison.`}
            action={<AddHospitalCombobox />}
          />
          {suggestions.length > 0 && (
            <section aria-labelledby="compare-suggestions" className="space-y-4">
              <h2 id="compare-suggestions" className="text-lg font-semibold">
                Hospitals you could add
              </h2>
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {suggestions.map((h) => (
                  <li key={h.id}>
                    <HospitalCard hospital={h} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-soft sm:flex-row sm:items-end sm:justify-between sm:p-5">
            <div className="space-y-1.5">
              <Label htmlFor={`${id}-treatment`}>Check a treatment</Label>
              <Select value={treatmentId} onValueChange={setTreatmentId}>
                <SelectTrigger id={`${id}-treatment`} className="w-full sm:w-72">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_TREATMENT}>Any treatment</SelectItem>
                  {treatmentOptions.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch id={`${id}-highlight`} checked={highlight} onCheckedChange={setHighlight} />
              <Label htmlFor={`${id}-highlight`}>Highlight differences</Label>
            </div>
          </div>
          <ComparisonView
            hospitals={hospitals}
            treatmentId={treatmentId === NO_TREATMENT ? undefined : treatmentId}
            highlightDifferences={highlight}
            onRemove={remove}
          />
          <p className="text-xs text-muted-foreground">
            Review averages come from fictional sample reviews. Sponsored placement does not affect anything shown here.
          </p>
        </>
      )}
    </div>
  )
}
