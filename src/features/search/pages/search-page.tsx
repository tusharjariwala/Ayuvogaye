import { ArrowRight, Search, SearchX } from "lucide-react"
import { useMemo, type ReactNode } from "react"
import { Link, useSearchParams } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DoctorCard, HospitalCard, TreatmentCard } from "@/components/shared/entity-cards"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/states"
import { SpecialtyIcon } from "@/components/shared/visuals"
import { getCity, getSpecialty, getSpecialtyNames } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { searchItems } from "@/lib/data-access"
import { pluralize } from "@/lib/formatters"
import type { Specialty } from "@/types"
import { SearchForm, type SearchType } from "../components/search-form"

const TYPES: SearchType[] = ["all", "hospitals", "doctors", "treatments", "specialties"]
const SUGGESTIONS = ["Cardiology", "Knee replacement", "Cataract surgery", "Pediatrics", "Dialysis", "Pune", "Bengaluru"]
const PREVIEW = 3

function SpecialtyTile({ specialty }: { specialty: Specialty }) {
  return (
    <Link
      to={`/specialties/${specialty.slug}`}
      className="flex h-full items-start gap-3 rounded-xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-raised"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <SpecialtyIcon icon={specialty.icon} className="size-5" />
      </span>
      <span className="min-w-0 space-y-1">
        <span className="block font-semibold">{specialty.name}</span>
        <span className="block text-sm text-muted-foreground">{specialty.shortDescription}</span>
      </span>
    </Link>
  )
}

function ResultGroup({ title, count, onSeeAll, children }: { title: string; count: number; onSeeAll?: () => void; children: ReactNode }) {
  if (count === 0) return null
  return (
    <section aria-label={title} className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {title} <span className="font-normal text-muted-foreground">({count})</span>
        </h2>
        {onSeeAll && count > PREVIEW && (
          <Button variant="ghost" size="sm" onClick={onSeeAll}>
            See all <ArrowRight />
          </Button>
        )}
      </div>
      {children}
    </section>
  )
}

const GRID = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const { data } = useDemoStore()
  const q = params.get("q") ?? ""
  const citySlug = params.get("city") ?? ""
  const rawType = params.get("type") as SearchType | null
  const type: SearchType = rawType && TYPES.includes(rawType) ? rawType : "all"
  const city = getCity(data, citySlug)

  const results = useMemo(() => {
    const treatmentNames = (ids: string[]) => data.treatments.filter((t) => ids.includes(t.id)).map((t) => t.name)
    const hospitals = searchItems(
      data.hospitals.filter((h) => h.status !== "suspended" && (!city || h.citySlug === city.slug)),
      q,
      (h) => [h.name, h.type, h.city, h.state, getSpecialtyNames(data, h.specialtyIds), treatmentNames(h.treatmentIds)],
    )
    const doctors = searchItems(
      data.doctors.filter((d) => d.status !== "suspended" && (!city || d.citySlug === city.slug)),
      q,
      (d) => [d.name, d.city, d.state, d.subSpecialty, getSpecialty(data, d.specialtyId)?.name, treatmentNames(d.treatmentIds), d.languages],
    )
    const treatments = searchItems(data.treatments, q, (t) => [t.name, t.category, getSpecialtyNames(data, t.specialtyIds), t.services])
    const specialties = searchItems(data.specialties, q, (s) => [s.name, s.category, s.shortDescription, s.commonConditions])
    return { hospitals, doctors, treatments, specialties }
  }, [data, q, city])

  const total = results.hospitals.length + results.doctors.length + results.treatments.length + results.specialties.length
  const setType = (t: string) => {
    const next = new URLSearchParams(params)
    if (t === "all") next.delete("type")
    else next.set("type", t)
    setParams(next, { replace: true })
  }

  const heading = q ? `Results for “${q}”` : "Search"
  const description = [
    q ? `${pluralize(total, "result")}` : "Search across hospitals, doctors, treatments and specialties",
    city ? `in ${city.name}` : "",
  ]
    .filter(Boolean)
    .join(" ")

  const suggestionLink = (s: string) => {
    const next = new URLSearchParams()
    next.set("q", s)
    return `/search?${next.toString()}`
  }

  return (
    <div className="container-page space-y-6 py-8">
      <PageHeader title={heading} description={`${description}.`} />
      <SearchForm key={params.toString()} defaultQuery={q} defaultCity={city?.slug} defaultType={type} />
      {city && (results.treatments.length > 0 || results.specialties.length > 0) && (
        <p className="text-xs text-muted-foreground">Location filters apply to hospitals and doctors. Treatments and specialties are shown for all cities.</p>
      )}

      {total === 0 ? (
        <EmptyState
          icon={q ? SearchX : Search}
          title={q ? "No matches found" : "Start a search"}
          description={
            q ? "Check the spelling, try a broader term or search in all cities." : "Type a doctor, hospital, specialty or treatment above."
          }
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <Badge key={s} asChild variant="outline" className="h-7 px-3">
                  <Link to={suggestionLink(s)}>{s}</Link>
                </Badge>
              ))}
            </div>
          }
        />
      ) : (
        <Tabs value={type} onValueChange={setType} className="gap-6">
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <TabsList>
              <TabsTrigger value="all">All ({total})</TabsTrigger>
              <TabsTrigger value="hospitals">Hospitals ({results.hospitals.length})</TabsTrigger>
              <TabsTrigger value="doctors">Doctors ({results.doctors.length})</TabsTrigger>
              <TabsTrigger value="treatments">Treatments ({results.treatments.length})</TabsTrigger>
              <TabsTrigger value="specialties">Specialties ({results.specialties.length})</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="space-y-10">
            <ResultGroup title="Hospitals" count={results.hospitals.length} onSeeAll={() => setType("hospitals")}>
              <ul className={GRID}>
                {results.hospitals.slice(0, PREVIEW).map((h) => (
                  <li key={h.id}>
                    <HospitalCard hospital={h} />
                  </li>
                ))}
              </ul>
            </ResultGroup>
            <ResultGroup title="Doctors" count={results.doctors.length} onSeeAll={() => setType("doctors")}>
              <ul className={GRID}>
                {results.doctors.slice(0, PREVIEW).map((d) => (
                  <li key={d.id}>
                    <DoctorCard doctor={d} />
                  </li>
                ))}
              </ul>
            </ResultGroup>
            <ResultGroup title="Treatments" count={results.treatments.length} onSeeAll={() => setType("treatments")}>
              <ul className={GRID}>
                {results.treatments.slice(0, PREVIEW).map((t) => (
                  <li key={t.id}>
                    <TreatmentCard treatment={t} />
                  </li>
                ))}
              </ul>
            </ResultGroup>
            <ResultGroup title="Specialties" count={results.specialties.length} onSeeAll={() => setType("specialties")}>
              <ul className={GRID}>
                {results.specialties.slice(0, PREVIEW).map((s) => (
                  <li key={s.id}>
                    <SpecialtyTile specialty={s} />
                  </li>
                ))}
              </ul>
            </ResultGroup>
          </TabsContent>

          <TabsContent value="hospitals">
            <TabResults count={results.hospitals.length} label="hospitals">
              {results.hospitals.map((h) => (
                <li key={h.id}>
                  <HospitalCard hospital={h} />
                </li>
              ))}
            </TabResults>
          </TabsContent>
          <TabsContent value="doctors">
            <TabResults count={results.doctors.length} label="doctors">
              {results.doctors.map((d) => (
                <li key={d.id}>
                  <DoctorCard doctor={d} />
                </li>
              ))}
            </TabResults>
          </TabsContent>
          <TabsContent value="treatments">
            <TabResults count={results.treatments.length} label="treatments">
              {results.treatments.map((t) => (
                <li key={t.id}>
                  <TreatmentCard treatment={t} />
                </li>
              ))}
            </TabResults>
          </TabsContent>
          <TabsContent value="specialties">
            <TabResults count={results.specialties.length} label="specialties">
              {results.specialties.map((s) => (
                <li key={s.id}>
                  <SpecialtyTile specialty={s} />
                </li>
              ))}
            </TabResults>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function TabResults({ count, label, children }: { count: number; label: string; children: ReactNode }) {
  if (count === 0) {
    return <EmptyState icon={SearchX} title={`No ${label} match this search`} description="Try the other tabs or a broader search term." />
  }
  return <ul className={GRID}>{children}</ul>
}
