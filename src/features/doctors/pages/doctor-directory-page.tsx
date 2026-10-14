import { SearchX, Stethoscope } from "lucide-react"
import { useMemo } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { DoctorCard } from "@/components/shared/entity-cards"
import { FacetFilter, FilterBar, SearchInput } from "@/components/shared/filters"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/states"
import { VERIFICATION_ORDER, VerificationExplainer } from "@/components/shared/verification-badge"
import { getCity, getRatingSummary, getSpecialty, getSpecialtyBySlug, type RatingSummary } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { filterItems, matchesAny, paginate, searchItems, sortItems } from "@/lib/data-access"
import { AVAILABILITY_LABELS, CONSULTATION_MODE_LABELS, VERIFICATION_LABELS } from "@/lib/constants"
import { pluralize, titleCase } from "@/lib/formatters"
import type { AvailabilityLevel, ConsultationMode, Doctor, Gender } from "@/types"
import { PaginationControls } from "@/features/hospitals/components/pagination-controls"
import { SortSelect } from "@/features/hospitals/components/sort-select"
import { parseList, useListParams } from "@/features/hospitals/lib/use-list-params"

const PAGE_SIZE = 9

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "name", label: "Name (A–Z)" },
  { value: "rating", label: "Highest rated" },
  { value: "experience", label: "Most experienced" },
  { value: "reviews", label: "Most reviewed" },
  { value: "updated", label: "Recently updated" },
]

const EXPERIENCE_BUCKETS = [
  { value: "0-5", label: "Up to 5 years", min: 0, max: 5 },
  { value: "5-10", label: "5–10 years", min: 5, max: 10 },
  { value: "10-20", label: "10–20 years", min: 10, max: 20 },
  { value: "20+", label: "20+ years", min: 20, max: Infinity },
]

const GENDER_LABELS: Record<Gender, string> = { female: "Female", male: "Male", other: "Other" }

export default function DoctorDirectoryPage() {
  const { city: cityParam = "all", specialty: specialtyParam = "all" } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data } = useDemoStore()
  const { params, set, page } = useListParams()

  const city = cityParam === "all" ? undefined : getCity(data, cityParam)
  const specialty = specialtyParam === "all" ? undefined : getSpecialtyBySlug(data, specialtyParam)
  const unknownCity = cityParam !== "all" && !city
  const unknownSpecialty = specialtyParam !== "all" && !specialty

  const filters = useMemo(
    () => ({
      q: params.get("q") ?? "",
      sort: params.get("sort") ?? "relevance",
      experience: parseList(params, "experience"),
      languages: parseList(params, "language"),
      genders: parseList(params, "gender"),
      modes: parseList(params, "mode"),
      availability: parseList(params, "availability"),
      statuses: parseList(params, "verification"),
    }),
    [params],
  )

  const publicDoctors = useMemo(() => data.doctors.filter((d) => d.status !== "suspended"), [data.doctors])

  const ratings = useMemo(() => {
    const map = new Map<string, RatingSummary>()
    publicDoctors.forEach((d) => map.set(d.id, getRatingSummary(data, "doctor", d.id)))
    return map
  }, [data, publicDoctors])

  const filtered = useMemo(() => {
    const { q, sort, experience, languages, genders, modes, availability, statuses } = filters
    const searched = searchItems(publicDoctors, q, (d) => [
      d.name,
      d.city,
      d.subSpecialty,
      getSpecialty(data, d.specialtyId)?.name,
      d.languages,
      data.treatments.filter((t) => d.treatmentIds.includes(t.id)).map((t) => t.name),
    ])
    const buckets = EXPERIENCE_BUCKETS.filter((b) => experience.includes(b.value))
    const result = filterItems<Doctor>(searched, [
      city && ((d) => d.citySlug === city.slug),
      specialty && ((d) => d.specialtyId === specialty.id),
      buckets.length > 0 && ((d) => buckets.some((b) => d.experienceYears >= b.min && d.experienceYears < b.max)),
      languages.length > 0 && ((d) => matchesAny(languages, d.languages)),
      genders.length > 0 && ((d) => !!d.gender && genders.includes(d.gender)),
      modes.length > 0 && ((d) => matchesAny<string>(modes, d.consultationModes)),
      availability.length > 0 && ((d) => availability.includes(d.availabilityLevel)),
      statuses.length > 0 && ((d) => statuses.includes(d.verification.status)),
    ])
    switch (sort) {
      case "name":
        return sortItems(result, (d) => d.name.replace(/^Dr\.?\s*/, ""), "asc")
      case "rating":
        return sortItems(result, (d) => ratings.get(d.id)?.average ?? 0, "desc")
      case "experience":
        return sortItems(result, (d) => d.experienceYears, "desc")
      case "reviews":
        return sortItems(result, (d) => ratings.get(d.id)?.count ?? 0, "desc")
      case "updated":
        return sortItems(result, (d) => d.updatedAt, "desc")
      default:
        return result
    }
  }, [filters, publicDoctors, data, city, specialty, ratings])

  const paged = paginate(filtered, page, PAGE_SIZE)

  const options = useMemo(() => {
    const count = (pred: (d: Doctor) => boolean) => publicDoctors.filter(pred).length
    const withCount = <T extends { value: string; label: string }>(list: T[], pred: (o: T) => (d: Doctor) => boolean) =>
      list.map((o) => ({ value: o.value, label: o.label, count: count(pred(o)) })).filter((o) => o.count > 0)
    const languages = [...new Set(publicDoctors.flatMap((d) => d.languages))].sort()
    const genders = [...new Set(publicDoctors.map((d) => d.gender).filter((g): g is Gender => !!g))]
    return {
      cities: withCount(
        data.cities.map((c) => ({ value: c.slug, label: c.name })),
        (o) => (d) => d.citySlug === o.value,
      ),
      specialties: withCount(
        data.specialties.map((s) => ({ value: s.slug, label: s.name, id: s.id })),
        (o) => (d) => d.specialtyId === o.id,
      ),
      experience: withCount(EXPERIENCE_BUCKETS, (b) => (d) => d.experienceYears >= b.min && d.experienceYears < b.max),
      languages: withCount(
        languages.map((l) => ({ value: l, label: l })),
        (o) => (d) => d.languages.includes(o.value),
      ),
      genders: withCount(
        genders.map((g) => ({ value: g, label: GENDER_LABELS[g] })),
        (o) => (d) => d.gender === o.value,
      ),
      modes: withCount(
        (Object.keys(CONSULTATION_MODE_LABELS) as ConsultationMode[]).map((m) => ({ value: m, label: CONSULTATION_MODE_LABELS[m] })),
        (o) => (d) => d.consultationModes.includes(o.value as ConsultationMode),
      ),
      availability: withCount(
        (Object.keys(AVAILABILITY_LABELS) as AvailabilityLevel[]).map((a) => ({ value: a, label: AVAILABILITY_LABELS[a] })),
        (o) => (d) => d.availabilityLevel === o.value,
      ),
      statuses: withCount(
        VERIFICATION_ORDER.map((s) => ({ value: s, label: VERIFICATION_LABELS[s] })),
        (o) => (d) => d.verification.status === o.value,
      ),
    }
  }, [data.cities, data.specialties, publicDoctors])

  /** City and specialty live in the path (`/doctors/:city/:specialty`). */
  const goTo = (nextCity: string, nextSpecialty: string) => {
    const qs = new URLSearchParams(location.search)
    qs.delete("page")
    const search = qs.toString()
    const path = nextCity === "all" && nextSpecialty === "all" ? "/doctors" : `/doctors/${nextCity}/${nextSpecialty}`
    navigate(search ? `${path}?${search}` : path)
  }

  const { q, sort, experience, languages, genders, modes, availability, statuses } = filters
  const activeCount =
    (city ? 1 : 0) +
    (specialty ? 1 : 0) +
    (q ? 1 : 0) +
    [experience, languages, genders, modes, availability, statuses].reduce((n, l) => n + l.length, 0)

  const clearAll = () => navigate("/doctors")

  if (unknownCity || unknownSpecialty) {
    return (
      <div className="container-page py-8">
        <EmptyState
          icon={Stethoscope}
          title={unknownCity ? "City not found" : "Specialty not found"}
          description={`"${titleCase((unknownCity ? cityParam : specialtyParam).replace(/-/g, " "))}" isn't part of this demo's directory.`}
          action={
            <Button asChild>
              <Link to="/doctors">Browse all doctors</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const title =
    specialty && city
      ? `${specialty.name} doctors in ${city.name}`
      : specialty
        ? `${specialty.name} doctors`
        : city
          ? `Doctors in ${city.name}`
          : "Find doctors"

  return (
    <div className="container-page space-y-6 py-8">
      <PageHeader
        title={title}
        description="Browse sample doctor profiles. Each profile shows which details are platform-verified and which are provider-submitted."
        actions={<VerificationExplainer />}
      />

      <div className="space-y-4 rounded-xl border bg-card p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <SearchInput
            value={q}
            onChange={(v) => set({ q: v })}
            label="Search doctors"
            placeholder="Search by name, specialty, treatment or language…"
            className="flex-1"
          />
          <SortSelect value={sort} onChange={(v) => set({ sort: v === "relevance" ? null : v })} options={SORT_OPTIONS} />
        </div>
        <FilterBar activeCount={activeCount} onClear={clearAll} resultsLabel={`${pluralize(filtered.length, "doctor")} found`}>
          <FacetFilter
            single
            title="Location"
            options={options.cities}
            selected={city ? [city.slug] : []}
            onChange={(v) => goTo(v[0] ?? "all", specialtyParam)}
          />
          <FacetFilter
            single
            title="Specialty"
            options={options.specialties}
            selected={specialty ? [specialty.slug] : []}
            onChange={(v) => goTo(cityParam, v[0] ?? "all")}
          />
          <FacetFilter title="Experience" options={options.experience} selected={experience} onChange={(v) => set({ experience: v })} />
          <FacetFilter title="Language" options={options.languages} selected={languages} onChange={(v) => set({ language: v })} />
          {options.genders.length > 0 && (
            <FacetFilter title="Gender" options={options.genders} selected={genders} onChange={(v) => set({ gender: v })} />
          )}
          <FacetFilter title="Consultation" options={options.modes} selected={modes} onChange={(v) => set({ mode: v })} />
          <FacetFilter title="Availability" options={options.availability} selected={availability} onChange={(v) => set({ availability: v })} />
          <FacetFilter title="Verification" options={options.statuses} selected={statuses} onChange={(v) => set({ verification: v })} />
        </FilterBar>
        {genders.length > 0 && (
          <p className="text-xs text-muted-foreground">Gender filtering only includes doctors who chose to share this detail.</p>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No doctors match your filters"
          description="Try a different city or specialty, or remove some filters."
          action={
            activeCount > 0 ? (
              <Button variant="outline" onClick={clearAll}>
                Clear all filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paged.items.map((d) => (
            <li key={d.id}>
              <DoctorCard doctor={d} />
            </li>
          ))}
        </ul>
      )}

      <PaginationControls page={paged.page} pageCount={paged.pageCount} onPageChange={(p) => set({ page: p > 1 ? p : null })} />
    </div>
  )
}
