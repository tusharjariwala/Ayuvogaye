import { CheckCircle2, MinusCircle, X } from "lucide-react"
import { Fragment, useMemo, type ReactNode } from "react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SponsoredBadge } from "@/components/shared/trust-badges"
import { VerificationBadge } from "@/components/shared/verification-badge"
import { ImagePlaceholder } from "@/components/shared/visuals"
import { getDoctorsForHospital, getRatingSummary, getSpecialtyNames, getTreatment, isSponsored, type RatingSummary } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { AVAILABILITY_LABELS, REVIEW_DIMENSIONS } from "@/lib/constants"
import { formatDate } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { Hospital } from "@/types"

interface CompareRow {
  key: string
  group: string
  label: string
  render: (h: Hospital) => ReactNode
  /** Plain value used to detect differences between hospitals. */
  value: (h: Hospital) => string
}

interface ComparisonViewProps {
  hospitals: Hospital[]
  treatmentId?: string
  highlightDifferences: boolean
  onRemove: (id: string) => void
}

function ChipList({ items, max = 6 }: { items: string[]; max?: number }) {
  if (items.length === 0) return <span className="text-muted-foreground">None listed</span>
  return (
    <div className="space-y-1.5">
      <span className="text-xs text-muted-foreground">{items.length} listed</span>
      <div className="flex flex-wrap gap-1">
        {items.slice(0, max).map((i) => (
          <Badge key={i} variant="secondary" className="font-normal">
            {i}
          </Badge>
        ))}
        {items.length > max && <Badge variant="outline">+{items.length - max} more</Badge>}
      </div>
    </div>
  )
}

function YesNo({ yes, yesLabel = "Listed", noLabel = "Not listed" }: { yes: boolean; yesLabel?: string; noLabel?: string }) {
  return yes ? (
    <span className="inline-flex items-center gap-1.5 font-medium text-success-text">
      <CheckCircle2 className="size-4" aria-hidden="true" /> {yesLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <MinusCircle className="size-4" aria-hidden="true" /> {noLabel}
    </span>
  )
}

function useRows(hospitals: Hospital[], treatmentId?: string): CompareRow[] {
  const { data } = useDemoStore()
  return useMemo(() => {
    const ratings = new Map<string, RatingSummary>(hospitals.map((h) => [h.id, getRatingSummary(data, "hospital", h.id)]))
    const names = <T extends { id: string; name: string }>(list: T[], ids: string[]) => list.filter((i) => ids.includes(i.id)).map((i) => i.name)
    const treatment = getTreatment(data, treatmentId)
    const doctorsFor = (h: Hospital) => {
      const docs = getDoctorsForHospital(data, h.id).filter((d) => d.status !== "suspended")
      return treatment ? docs.filter((d) => d.treatmentIds.includes(treatment.id)) : docs
    }

    const rows: CompareRow[] = [
      {
        key: "location",
        group: "Basics",
        label: "Location",
        render: (h) => (
          <span>
            {h.city}, {h.state}
            <span className="block text-xs text-muted-foreground">{h.locations.length} location(s)</span>
          </span>
        ),
        value: (h) => h.citySlug,
      },
      {
        key: "type",
        group: "Basics",
        label: "Type & beds",
        render: (h) => (
          <span>
            {h.type}
            <span className="block text-xs text-muted-foreground">{h.beds} beds (provider-submitted)</span>
          </span>
        ),
        value: (h) => `${h.type}|${h.beds}`,
      },
      {
        key: "specialties",
        group: "Clinical",
        label: "Specialties",
        render: (h) => <ChipList items={getSpecialtyNames(data, h.specialtyIds)} />,
        value: (h) => [...h.specialtyIds].sort().join(),
      },
      {
        key: "departments",
        group: "Clinical",
        label: "Departments",
        render: (h) => <ChipList items={names(data.departments, h.departmentIds)} />,
        value: (h) => [...h.departmentIds].sort().join(),
      },
      {
        key: "facilities",
        group: "Clinical",
        label: "Facilities",
        render: (h) => <ChipList items={names(data.facilities, h.facilityIds)} />,
        value: (h) => [...h.facilityIds].sort().join(),
      },
      {
        key: "accreditations",
        group: "Clinical",
        label: "Accreditations",
        render: (h) => (
          <span className="space-y-1">
            <ChipList items={data.accreditations.filter((a) => h.accreditationIds.includes(a.id)).map((a) => a.code)} />
            <span className="block text-xs text-muted-foreground">
              {h.verifiedFields.includes("accreditations") ? "Platform-verified" : "Provider-submitted"}
            </span>
          </span>
        ),
        value: (h) => [...h.accreditationIds].sort().join(),
      },
      {
        key: "doctors",
        group: "Clinical",
        label: treatment ? `Doctors for ${treatment.name}` : "Associated doctors",
        render: (h) => {
          const docs = doctorsFor(h)
          if (docs.length === 0) return <span className="text-muted-foreground">None listed</span>
          return (
            <span>
              <span className="font-medium">{docs.length}</span> doctor{docs.length === 1 ? "" : "s"}
              <span className="block text-xs text-muted-foreground">
                {docs
                  .slice(0, 3)
                  .map((d) => d.name)
                  .join(", ")}
                {docs.length > 3 ? "…" : ""}
              </span>
            </span>
          )
        },
        value: (h) => String(doctorsFor(h).length),
      },
    ]

    if (treatment) {
      rows.push({
        key: "treatment",
        group: "Clinical",
        label: `Offers ${treatment.name}`,
        render: (h) => <YesNo yes={h.treatmentIds.includes(treatment.id)} />,
        value: (h) => String(h.treatmentIds.includes(treatment.id)),
      })
    } else {
      rows.push({
        key: "treatments",
        group: "Clinical",
        label: "Treatments listed",
        render: (h) => <span>{h.treatmentIds.length} treatments</span>,
        value: (h) => String(h.treatmentIds.length),
      })
    }

    rows.push(
      {
        key: "appointments",
        group: "Access",
        label: "Appointment availability",
        render: (h) => <span>{AVAILABILITY_LABELS[h.appointmentAvailability]}</span>,
        value: (h) => h.appointmentAvailability,
      },
      {
        key: "emergency",
        group: "Access",
        label: "Emergency services",
        render: (h) => <YesNo yes={!!h.emergency?.available} yesLabel={`Available (${h.emergency?.hours ?? ""})`} noLabel="Not listed" />,
        value: (h) => String(!!h.emergency?.available),
      },
      ...REVIEW_DIMENSIONS.map(
        (dim): CompareRow => ({
          key: `review-${dim.key}`,
          group: "Patient reviews (sample)",
          label: dim.label,
          render: (h) => {
            const r = ratings.get(h.id)
            if (!r || r.count === 0) return <span className="text-muted-foreground">No reviews</span>
            return (
              <span>
                <span className="font-medium tabular-nums">{r.dimensions[dim.key].toFixed(1)}</span>
                <span className="text-muted-foreground"> / 5</span>
                {dim.key === "overall" && <span className="block text-xs text-muted-foreground">{r.count} reviews</span>}
              </span>
            )
          },
          value: (h) => {
            const r = ratings.get(h.id)
            return r && r.count ? r.dimensions[dim.key].toFixed(1) : "none"
          },
        }),
      ),
      {
        key: "verification",
        group: "Trust",
        label: "Verification",
        render: (h) => (
          <span className="space-y-1">
            <VerificationBadge status={h.verification.status} lastVerifiedAt={h.verification.lastVerifiedAt} />
            <span className="block text-xs text-muted-foreground">
              {h.verification.lastVerifiedAt ? `Last verified ${formatDate(h.verification.lastVerifiedAt)}` : "Not yet verified"}
            </span>
          </span>
        ),
        value: (h) => h.verification.status,
      },
      {
        key: "updated",
        group: "Trust",
        label: "Profile last updated",
        render: (h) => <span>{formatDate(h.updatedAt)}</span>,
        value: (h) => h.updatedAt.slice(0, 10),
      },
    )
    return rows
  }, [data, hospitals, treatmentId])
}

function differs(row: CompareRow, hospitals: Hospital[]) {
  return new Set(hospitals.map(row.value)).size > 1
}

function DiffTag() {
  return (
    <Badge variant="info" className="ml-2 align-middle">
      Differs
    </Badge>
  )
}

/** Side-by-side factual comparison: sticky-column table on desktop, stacked cards on mobile. */
export function ComparisonView({ hospitals, treatmentId, highlightDifferences, onRemove }: ComparisonViewProps) {
  const { data } = useDemoStore()
  const rows = useRows(hospitals, treatmentId)
  const groups = [...new Set(rows.map((r) => r.group))]
  const diffKeys = new Set(rows.filter((r) => differs(r, hospitals)).map((r) => r.key))
  const isHighlighted = (key: string) => highlightDifferences && diffKeys.has(key)

  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden overflow-x-auto rounded-xl border bg-card shadow-soft md:block">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <caption className="sr-only">Hospital comparison</caption>
          <thead>
            <tr className="border-b">
              <th scope="col" className="sticky left-0 z-10 w-48 bg-card p-4 text-left align-bottom text-xs font-medium text-muted-foreground">
                Compared on
              </th>
              {hospitals.map((h) => (
                <th key={h.id} scope="col" className="min-w-52 p-4 text-left align-top font-normal">
                  <div className="space-y-2">
                    <ImagePlaceholder hue={h.imageHue} label={h.name} className="h-20 rounded-lg" />
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link to={`/hospital/${h.slug}`} className="font-semibold hover:text-primary hover:underline">
                          {h.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{h.city}</p>
                      </div>
                      <Button variant="ghost" size="icon-sm" onClick={() => onRemove(h.id)} aria-label={`Remove ${h.name} from comparison`}>
                        <X />
                      </Button>
                    </div>
                    {isSponsored(data, "hospital", h.id) && <SponsoredBadge />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group}>
                <tr className="bg-muted/50">
                  <th scope="colgroup" colSpan={hospitals.length + 1} className="sticky left-0 px-4 py-2 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {group}
                  </th>
                </tr>
                {rows
                  .filter((r) => r.group === group)
                  .map((row) => {
                    const hl = isHighlighted(row.key)
                    return (
                      <tr key={row.key} className={cn("border-b last:border-b-0", hl && "bg-info-soft/40")}>
                        <th scope="row" className={cn("sticky left-0 z-10 bg-card p-4 text-left align-top font-medium", hl && "bg-info-soft")}>
                          {row.label}
                          {hl && <DiffTag />}
                        </th>
                        {hospitals.map((h) => (
                          <td key={h.id} className="p-4 align-top">
                            {row.render(h)}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="space-y-4 md:hidden">
        {hospitals.map((h) => (
          <li key={h.id}>
            <Card className="gap-0 py-0">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link to={`/hospital/${h.slug}`} className="font-semibold hover:text-primary hover:underline">
                      {h.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{h.city}</p>
                    {isSponsored(data, "hospital", h.id) && <SponsoredBadge className="mt-1" />}
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => onRemove(h.id)} aria-label={`Remove ${h.name} from comparison`}>
                    <X />
                  </Button>
                </div>
                {groups.map((group) => (
                  <div key={group} className="space-y-2">
                    <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group}</h3>
                    <dl className="divide-y rounded-lg border">
                      {rows
                        .filter((r) => r.group === group)
                        .map((row) => {
                          const hl = isHighlighted(row.key)
                          return (
                            <div key={row.key} className={cn("grid gap-1 p-3 text-sm", hl && "bg-info-soft/40")}>
                              <dt className="text-xs font-medium text-muted-foreground">
                                {row.label}
                                {hl && <DiffTag />}
                              </dt>
                              <dd className="min-w-0">{row.render(h)}</dd>
                            </div>
                          )
                        })}
                    </dl>
                  </div>
                ))}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </>
  )
}
