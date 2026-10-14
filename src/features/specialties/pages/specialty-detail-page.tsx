import { ArrowRight, Info, Stethoscope } from "lucide-react"
import { useMemo } from "react"
import { Link, useParams } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DoctorCard, HospitalCard, TreatmentCard } from "@/components/shared/entity-cards"
import { EmptyState } from "@/components/shared/states"
import { SourceBadge } from "@/components/shared/trust-badges"
import { SpecialtyIcon } from "@/components/shared/visuals"
import {
  getDoctorsForSpecialty,
  getHospitalsForSpecialty,
  getSpecialtyBySlug,
  getTreatmentsForSpecialty,
} from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { DetailSection, InPageNav } from "@/features/hospitals/components/detail-section"
import { EditorialStatusLine, MedicalDisclaimer, SeoPanel } from "@/features/treatments/components/content-detail-sections"
import { useDocumentTitle } from "@/features/treatments/lib/use-document-title"

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "conditions", label: "Common conditions" },
  { id: "treatments", label: "Treatments" },
  { id: "doctors", label: "Doctors" },
  { id: "hospitals", label: "Hospitals" },
]

export default function SpecialtyDetailPage() {
  const { slug } = useParams()
  const { data } = useDemoStore()
  const specialty = getSpecialtyBySlug(data, slug)
  useDocumentTitle(specialty?.seo.title)

  const related = useMemo(() => {
    if (!specialty) return null
    return {
      treatments: getTreatmentsForSpecialty(data, specialty.id),
      doctors: getDoctorsForSpecialty(data, specialty.id),
      hospitals: getHospitalsForSpecialty(data, specialty.id),
      content: data.contentPages.find((c) => c.type === "specialty" && c.relatedId === specialty.id),
      departments: data.departments.filter((d) => d.specialtyId === specialty.id),
    }
  }, [data, specialty])

  if (!specialty || !related) {
    return (
      <div className="container-page py-12">
        <h1 className="sr-only">Specialty not found</h1>
        <EmptyState
          icon={Stethoscope}
          title="Specialty not found"
          description="We couldn't find this specialty. Try browsing doctors or hospitals instead."
          action={
            <Button asChild>
              <Link to="/doctors">Browse doctors</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container-page space-y-6 py-8">
      <header className="flex flex-col gap-5 rounded-xl border bg-card p-5 shadow-soft sm:flex-row sm:items-start sm:p-6">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <SpecialtyIcon icon={specialty.icon} className="size-7" />
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">{specialty.category}</Badge>
            <SourceBadge source="editorial" />
          </div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{specialty.name}</h1>
          <p className="text-muted-foreground">{specialty.shortDescription}</p>
          <EditorialStatusLine
            status={specialty.editorialStatus}
            reviewedBy={related.content?.author}
            reviewedAt={related.content?.updatedAt}
          />
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-col">
          <Button asChild>
            <Link to={`/doctors/all/${specialty.slug}`}>
              Find {specialty.name.toLowerCase()} doctors <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`/hospitals?specialty=${specialty.id}`}>Hospitals with {specialty.name}</Link>
          </Button>
        </div>
      </header>

      <MedicalDisclaimer />
      <InPageNav items={NAV} />

      <div className="space-y-6">
        <DetailSection id="overview" title={`About ${specialty.name}`}>
          <p className="leading-relaxed text-muted-foreground">{specialty.overview}</p>
          {related.departments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Related hospital departments</h3>
              <div className="flex flex-wrap gap-1.5">
                {related.departments.map((d) => (
                  <Badge key={d.id} variant="outline">
                    {d.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </DetailSection>

        <DetailSection id="conditions" title="Common conditions">
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Listed for general information only. This list cannot be used to diagnose symptoms.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {specialty.commonConditions.map((c) => (
              <li key={c} className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
                {c}
              </li>
            ))}
          </ul>
        </DetailSection>

        <DetailSection id="treatments" title="Related treatments">
          {related.treatments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No treatments listed for this specialty yet.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.treatments.map((t) => (
                <li key={t.id}>
                  <TreatmentCard treatment={t} />
                </li>
              ))}
            </ul>
          )}
        </DetailSection>

        <DetailSection
          id="doctors"
          title={`${specialty.name} doctors`}
          action={
            <Button asChild variant="outline" size="sm">
              <Link to={`/doctors/all/${specialty.slug}`}>View all ({related.doctors.length})</Link>
            </Button>
          }
        >
          {related.doctors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No doctors listed for this specialty yet.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.doctors.slice(0, 6).map((d) => (
                <li key={d.id}>
                  <DoctorCard doctor={d} />
                </li>
              ))}
            </ul>
          )}
        </DetailSection>

        <DetailSection
          id="hospitals"
          title={`Hospitals offering ${specialty.name}`}
          action={
            <Button asChild variant="outline" size="sm">
              <Link to={`/hospitals?specialty=${specialty.id}`}>View all ({related.hospitals.length})</Link>
            </Button>
          }
        >
          {related.hospitals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hospitals listed for this specialty yet.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.hospitals.slice(0, 6).map((h) => (
                <li key={h.id}>
                  <HospitalCard hospital={h} />
                </li>
              ))}
            </ul>
          )}
        </DetailSection>

        <SeoPanel seo={specialty.seo} />
      </div>
    </div>
  )
}
