import { SearchX } from "lucide-react"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { TreatmentCard } from "@/components/shared/entity-cards"
import { FacetFilter, FilterBar, SearchInput } from "@/components/shared/filters"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/states"
import { getSpecialtyNames } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { filterItems, matchesAny, paginate, searchItems, sortItems } from "@/lib/data-access"
import { pluralize } from "@/lib/formatters"
import { PaginationControls } from "@/features/hospitals/components/pagination-controls"
import { SortSelect } from "@/features/hospitals/components/sort-select"
import { parseList, useListParams } from "@/features/hospitals/lib/use-list-params"
import { MedicalDisclaimer } from "../components/content-detail-sections"

const PAGE_SIZE = 12

const SORT_OPTIONS = [
  { value: "name", label: "Name (A–Z)" },
  { value: "providers", label: "Most hospitals offering" },
  { value: "price-low", label: "Estimate: low to high" },
  { value: "price-high", label: "Estimate: high to low" },
]

export default function TreatmentDirectoryPage() {
  const { data } = useDemoStore()
  const { params, set, clear, page } = useListParams()

  const { q, sort, categories, specialtyIds } = useMemo(
    () => ({
      q: params.get("q") ?? "",
      sort: params.get("sort") ?? "name",
      categories: parseList(params, "category"),
      specialtyIds: parseList(params, "specialty"),
    }),
    [params],
  )

  const providerCounts = useMemo(() => {
    const map = new Map<string, number>()
    data.treatments.forEach((t) =>
      map.set(t.id, data.hospitals.filter((h) => h.status !== "suspended" && h.treatmentIds.includes(t.id)).length),
    )
    return map
  }, [data.treatments, data.hospitals])

  const filtered = useMemo(() => {
    const searched = searchItems(data.treatments, q, (t) => [t.name, t.category, t.overview, t.services, getSpecialtyNames(data, t.specialtyIds)])
    const result = filterItems(searched, [
      categories.length > 0 && ((t) => categories.includes(t.category)),
      specialtyIds.length > 0 && ((t) => matchesAny(specialtyIds, t.specialtyIds)),
    ])
    switch (sort) {
      case "providers":
        return sortItems(result, (t) => providerCounts.get(t.id) ?? 0, "desc")
      case "price-low":
        return sortItems(result, (t) => t.priceEstimate?.min, "asc")
      case "price-high":
        return sortItems(result, (t) => t.priceEstimate?.max, "desc")
      default:
        return sortItems(result, (t) => t.name, "asc")
    }
  }, [data, q, categories, specialtyIds, sort, providerCounts])

  const paged = paginate(filtered, page, PAGE_SIZE)

  const categoryOptions = useMemo(
    () =>
      [...new Set(data.treatments.map((t) => t.category))]
        .sort()
        .map((c) => ({ value: c, label: c, count: data.treatments.filter((t) => t.category === c).length })),
    [data.treatments],
  )
  const specialtyOptions = useMemo(
    () =>
      data.specialties
        .map((s) => ({ value: s.id, label: s.name, count: data.treatments.filter((t) => t.specialtyIds.includes(s.id)).length }))
        .filter((o) => o.count > 0),
    [data.specialties, data.treatments],
  )

  const activeCount = categories.length + specialtyIds.length + (q ? 1 : 0)

  return (
    <div className="container-page space-y-6 py-8">
      <PageHeader
        title="Treatments & procedures"
        description="Plain-language overviews of common treatments, with sample hospitals and doctors that list them. Price ranges are illustrative estimates only."
      />

      <div className="space-y-4 rounded-xl border bg-card p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <SearchInput value={q} onChange={(v) => set({ q: v })} label="Search treatments" placeholder="Search treatments…" className="flex-1" />
          <SortSelect value={sort} onChange={(v) => set({ sort: v === "name" ? null : v })} options={SORT_OPTIONS} />
        </div>
        <FilterBar activeCount={activeCount} onClear={() => clear()} resultsLabel={`${pluralize(filtered.length, "treatment")} found`}>
          <FacetFilter title="Category" options={categoryOptions} selected={categories} onChange={(v) => set({ category: v })} />
          <FacetFilter title="Specialty" options={specialtyOptions} selected={specialtyIds} onChange={(v) => set({ specialty: v })} />
        </FilterBar>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No treatments found"
          description="Try a different search term or remove some filters."
          action={
            activeCount > 0 ? (
              <Button variant="outline" onClick={() => clear()}>
                Clear all filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paged.items.map((t) => (
            <li key={t.id}>
              <TreatmentCard treatment={t} />
            </li>
          ))}
        </ul>
      )}

      <PaginationControls page={paged.page} pageCount={paged.pageCount} onPageChange={(p) => set({ page: p > 1 ? p : null })} />

      <MedicalDisclaimer />
    </div>
  )
}
