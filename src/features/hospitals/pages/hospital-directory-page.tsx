import { LayoutGrid, MapPinOff, Rows3, SearchX } from "lucide-react"
import { useMemo } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { HospitalCard } from "@/components/shared/entity-cards"
import { FacetFilter, FilterBar, SearchInput, type FilterOption } from "@/components/shared/filters"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/states"
import { VERIFICATION_ORDER, VerificationExplainer } from "@/components/shared/verification-badge"
import { getCity, getRatingSummary, getSpecialtyNames, type RatingSummary } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { filterItems, matchesAny, paginate, searchItems, sortItems } from "@/lib/data-access"
import { VERIFICATION_LABELS } from "@/lib/constants"
import { pluralize } from "@/lib/formatters"
import type { Hospital } from "@/types"
import { CompareTray } from "../components/compare-tray"
import { HospitalTable } from "../components/hospital-table"
import { PaginationControls } from "../components/pagination-controls"
import { SortSelect } from "../components/sort-select"
import { parseList, useListParams } from "../lib/use-list-params"

const PAGE_SIZE = 9

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "name", label: "Name (A–Z)" },
  { value: "rating", label: "Highest rated" },
  { value: "updated", label: "Recently updated" },
  { value: "reviews", label: "Most reviewed" },
]

function countOptions<T extends { id: string; name: string }>(
  items: T[],
  hospitals: Hospital[],
  ids: (h: Hospital) => string[],
): FilterOption[] {
  return items
    .map((i) => ({ value: i.id, label: i.name, count: hospitals.filter((h) => ids(h).includes(i.id)).length }))
    .filter((o) => o.count > 0)
}

export default function HospitalDirectoryPage() {
  const { city: cityParam } = useParams()
  const navigate = useNavigate()
  const { data } = useDemoStore()
  const { params, get, set, page } = useListParams()

  const routeCity = getCity(data, cityParam)
  const unknownCity = !!cityParam && !routeCity

  const routeCitySlug = routeCity?.slug
  const view = get("view") === "table" ? "table" : "grid"
  const { q, sort, cities, specialtyIds, treatmentIds, facilityIds, accreditationIds, statuses } = useMemo(
    () => ({
      q: params.get("q") ?? "",
      sort: params.get("sort") ?? "relevance",
      cities: params.has("city") ? parseList(params, "city") : routeCitySlug ? [routeCitySlug] : [],
      specialtyIds: parseList(params, "specialty"),
      treatmentIds: parseList(params, "treatment"),
      facilityIds: parseList(params, "facility"),
      accreditationIds: parseList(params, "accreditation"),
      statuses: parseList(params, "verification"),
    }),
    [params, routeCitySlug],
  )

  const publicHospitals = useMemo(() => data.hospitals.filter((h) => h.status !== "suspended"), [data.hospitals])

  const ratings = useMemo(() => {
    const map = new Map<string, RatingSummary>()
    publicHospitals.forEach((h) => map.set(h.id, getRatingSummary(data, "hospital", h.id)))
    return map
  }, [data, publicHospitals])

  const filtered = useMemo(() => {
    const searched = searchItems(publicHospitals, q, (h) => [
      h.name,
      h.city,
      h.state,
      h.type,
      h.tagline,
      getSpecialtyNames(data, h.specialtyIds),
      data.treatments.filter((t) => h.treatmentIds.includes(t.id)).map((t) => t.name),
    ])
    const result = filterItems(searched, [
      cities.length > 0 && ((h) => matchesAny(cities, h.citySlug)),
      specialtyIds.length > 0 && ((h) => matchesAny(specialtyIds, h.specialtyIds)),
      treatmentIds.length > 0 && ((h) => matchesAny(treatmentIds, h.treatmentIds)),
      facilityIds.length > 0 && ((h) => facilityIds.every((f) => h.facilityIds.includes(f))),
      accreditationIds.length > 0 && ((h) => matchesAny(accreditationIds, h.accreditationIds)),
      statuses.length > 0 && ((h) => matchesAny(statuses, h.verification.status)),
    ])
    switch (sort) {
      case "name":
        return sortItems(result, (h) => h.name, "asc")
      case "rating":
        return sortItems(result, (h) => ratings.get(h.id)?.average ?? 0, "desc")
      case "updated":
        return sortItems(result, (h) => h.updatedAt, "desc")
      case "reviews":
        return sortItems(result, (h) => ratings.get(h.id)?.count ?? 0, "desc")
      default:
        return result
    }
  }, [publicHospitals, q, data, cities, specialtyIds, treatmentIds, facilityIds, accreditationIds, statuses, sort, ratings])

  const paged = paginate(filtered, page, PAGE_SIZE)

  const cityOptions = useMemo(
    () =>
      data.cities
        .map((c) => ({ value: c.slug, label: c.name, count: publicHospitals.filter((h) => h.citySlug === c.slug).length }))
        .filter((o) => o.count > 0),
    [data.cities, publicHospitals],
  )
  const specialtyOptions = useMemo(
    () => countOptions(data.specialties, publicHospitals, (h) => h.specialtyIds),
    [data.specialties, publicHospitals],
  )
  const treatmentOptions = useMemo(
    () => countOptions(data.treatments, publicHospitals, (h) => h.treatmentIds),
    [data.treatments, publicHospitals],
  )
  const facilityOptions = useMemo(
    () => countOptions(data.facilities, publicHospitals, (h) => h.facilityIds),
    [data.facilities, publicHospitals],
  )
  const accreditationOptions = useMemo(
    () =>
      data.accreditations
        .map((a) => ({ value: a.id, label: a.code, count: publicHospitals.filter((h) => h.accreditationIds.includes(a.id)).length }))
        .filter((o) => o.count > 0),
    [data.accreditations, publicHospitals],
  )
  const verificationOptions = useMemo(
    () =>
      VERIFICATION_ORDER.map((s) => ({
        value: s,
        label: VERIFICATION_LABELS[s],
        count: publicHospitals.filter((h) => h.verification.status === s).length,
      })).filter((o) => o.count > 0),
    [publicHospitals],
  )

  const activeCount =
    [cities, specialtyIds, treatmentIds, facilityIds, accreditationIds, statuses].reduce((n, l) => n + l.length, 0) + (q ? 1 : 0)

  /** Location lives in the path on city pages; changing it moves to /hospitals and keeps other filters. */
  const setCities = (next: string[]) => {
    if (cityParam) {
      const nextParams = new URLSearchParams(params)
      nextParams.delete("page")
      if (next.length) nextParams.set("city", next.join(","))
      else nextParams.delete("city")
      const qs = nextParams.toString()
      navigate(qs ? `/hospitals?${qs}` : "/hospitals")
      return
    }
    set({ city: next })
  }

  const clearAll = () => navigate(view === "table" ? "/hospitals?view=table" : "/hospitals", { replace: !cityParam })

  if (unknownCity) {
    return (
      <div className="container-page space-y-6 py-8">
        <PageHeader title="Hospitals" description="Browse verified and provider-submitted hospital profiles (sample data)." />
        <EmptyState
          icon={MapPinOff}
          title="We don't list hospitals in this city yet"
          description={`"${cityParam}" isn't one of the sample cities in this demo. Browse all hospitals instead.`}
          action={
            <Button asChild>
              <Link to="/hospitals">Browse all hospitals</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const title = routeCity && cities.length === 1 && cities[0] === routeCity.slug ? `Hospitals in ${routeCity.name}` : "Find hospitals"

  return (
    <div className="container-page space-y-6 py-8 pb-32">
      <PageHeader
        title={title}
        description="Browse sample hospital profiles, check which details are platform-verified, compare hospitals side by side and send a request — all simulated locally."
        actions={<VerificationExplainer />}
      />

      <div className="space-y-4 rounded-xl border bg-card p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <SearchInput
            value={q}
            onChange={(v) => set({ q: v })}
            label="Search hospitals"
            placeholder="Search by name, specialty, treatment or city…"
            className="flex-1"
          />
          <div className="flex items-center gap-2">
            <SortSelect
              value={sort}
              onChange={(v) => set({ sort: v === "relevance" ? null : v })}
              options={SORT_OPTIONS}
              className="flex-1"
            />
            <ToggleGroup
              type="single"
              variant="outline"
              value={view}
              onValueChange={(v) => v && set({ view: v === "grid" ? null : v, page: page > 1 ? page : null })}
              aria-label="Results layout"
            >
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Table view">
                <Rows3 />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        <FilterBar activeCount={activeCount} onClear={clearAll} resultsLabel={`${pluralize(filtered.length, "hospital")} found`}>
          <FacetFilter title="Location" options={cityOptions} selected={cities} onChange={setCities} />
          <FacetFilter title="Specialty" options={specialtyOptions} selected={specialtyIds} onChange={(v) => set({ specialty: v })} />
          <FacetFilter title="Treatment" options={treatmentOptions} selected={treatmentIds} onChange={(v) => set({ treatment: v })} />
          <FacetFilter title="Facility" options={facilityOptions} selected={facilityIds} onChange={(v) => set({ facility: v })} />
          <FacetFilter
            title="Accreditation"
            options={accreditationOptions}
            selected={accreditationIds}
            onChange={(v) => set({ accreditation: v })}
          />
          <FacetFilter title="Verification" options={verificationOptions} selected={statuses} onChange={(v) => set({ verification: v })} />
        </FilterBar>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No hospitals match your filters"
          description="Try removing a filter, searching a broader term or choosing another city."
          action={
            activeCount > 0 ? (
              <Button variant="outline" onClick={clearAll}>
                Clear all filters
              </Button>
            ) : undefined
          }
        />
      ) : view === "table" ? (
        <HospitalTable hospitals={paged.items} ratings={ratings} />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paged.items.map((h) => (
            <li key={h.id}>
              <HospitalCard hospital={h} />
            </li>
          ))}
        </ul>
      )}

      <PaginationControls page={paged.page} pageCount={paged.pageCount} onPageChange={(p) => set({ page: p > 1 ? p : null })} />

      <p className="text-center text-xs text-muted-foreground">
        Sponsored listings are labelled paid placements. Sponsorship never changes a hospital's verification status.
      </p>

      <CompareTray />
    </div>
  )
}
