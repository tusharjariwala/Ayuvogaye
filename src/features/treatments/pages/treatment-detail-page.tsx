import { BedDouble, CheckCircle2, IndianRupee, Syringe } from "lucide-react"
import { useMemo } from "react"
import { Link, useParams } from "react-router"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EnquiryForm } from "@/components/forms/request-form"
import { DoctorCard, HospitalCard } from "@/components/shared/entity-cards"
import { EmptyState } from "@/components/shared/states"
import { SourceBadge } from "@/components/shared/trust-badges"
import { getDoctorsForTreatment, getHospitalsForTreatment, getSpecialty, getTreatmentBySlug } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { formatCurrencyRange } from "@/lib/formatters"
import type { Specialty } from "@/types"
import { DetailSection, InPageNav } from "@/features/hospitals/components/detail-section"
import { FavouriteToggle } from "@/features/hospitals/components/favourite-toggle"
import { EditorialStatusLine, MedicalDisclaimer, SeoPanel } from "../components/content-detail-sections"
import { useDocumentTitle } from "../lib/use-document-title"

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "services", label: "Services" },
  { id: "preparation", label: "Preparation FAQs" },
  { id: "hospitals", label: "Hospitals" },
  { id: "doctors", label: "Doctors" },
  { id: "enquiry", label: "Enquire" },
]

export default function TreatmentDetailPage() {
  const { slug } = useParams()
  const { data } = useDemoStore()
  const treatment = getTreatmentBySlug(data, slug)
  useDocumentTitle(treatment?.seo.title)

  const related = useMemo(() => {
    if (!treatment) return null
    return {
      specialties: treatment.specialtyIds.map((id) => getSpecialty(data, id)).filter((s): s is Specialty => !!s),
      hospitals: getHospitalsForTreatment(data, treatment.id),
      doctors: getDoctorsForTreatment(data, treatment.id),
    }
  }, [data, treatment])

  if (!treatment || !related) {
    return (
      <div className="container-page py-12">
        <h1 className="sr-only">Treatment not found</h1>
        <EmptyState
          icon={Syringe}
          title="Treatment not found"
          description="We couldn't find this treatment page. It may have been renamed or unpublished."
          action={
            <Button asChild>
              <Link to="/treatments">Browse treatments</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const price = treatment.priceEstimate

  return (
    <div className="container-page space-y-6 py-8">
      <header className="space-y-4 rounded-xl border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{treatment.category}</Badge>
          <SourceBadge source="editorial" />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold sm:text-3xl">{treatment.name}</h1>
            <EditorialStatusLine
              status={treatment.editorial.status}
              reviewedBy={treatment.editorial.reviewedBy}
              reviewedAt={treatment.editorial.reviewedAt}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <a href="#enquiry">Send an enquiry</a>
            </Button>
            <FavouriteToggle type="treatment" id={treatment.id} name={treatment.name} />
          </div>
        </div>
        {related.specialties.length > 0 && (
          <p className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Related specialties:</span>
            {related.specialties.map((s) => (
              <Badge key={s.id} asChild variant="outline">
                <Link to={`/specialties/${s.slug}`}>{s.name}</Link>
              </Badge>
            ))}
          </p>
        )}
      </header>

      <MedicalDisclaimer />
      <InPageNav items={NAV} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <DetailSection id="overview" title="Overview">
            <p className="leading-relaxed text-muted-foreground">{treatment.overview}</p>
          </DetailSection>

          <DetailSection id="services" title="What it may involve" description="Typical services listed for this treatment. Individual care plans vary.">
            <ul className="grid gap-2 sm:grid-cols-2">
              {treatment.services.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {s}
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection id="preparation" title="Preparation FAQs">
            {treatment.preparationFaqs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No FAQs yet.</p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {treatment.preparationFaqs.map((f, i) => (
                  <AccordionItem key={f.question} value={`faq-${i}`}>
                    <AccordionTrigger>{f.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{f.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </DetailSection>

          <DetailSection
            id="hospitals"
            title="Hospitals offering this treatment"
            description="Listed by the hospitals themselves. Check each profile's verification details."
          >
            {related.hospitals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hospitals list this treatment yet.</p>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2">
                {related.hospitals.slice(0, 6).map((h) => (
                  <li key={h.id}>
                    <HospitalCard hospital={h} />
                  </li>
                ))}
              </ul>
            )}
            {related.hospitals.length > 6 && (
              <Button asChild variant="outline">
                <Link to={`/hospitals?treatment=${treatment.id}`}>See all {related.hospitals.length} hospitals</Link>
              </Button>
            )}
          </DetailSection>

          <DetailSection id="doctors" title="Doctors associated with this treatment">
            {related.doctors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No doctors list this treatment yet.</p>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2">
                {related.doctors.slice(0, 6).map((d) => (
                  <li key={d.id}>
                    <DoctorCard doctor={d} />
                  </li>
                ))}
              </ul>
            )}
          </DetailSection>

          <DetailSection id="enquiry" title={`Ask about ${treatment.name}`} description="Send a simulated enquiry to a hospital or doctor. Nothing is sent in this demo.">
            <EnquiryForm defaultTreatmentId={treatment.id} />
          </DetailSection>

          <SeoPanel seo={treatment.seo} />
        </div>

        <aside aria-label="Treatment facts" className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <Card className="gap-0 py-0 shadow-soft">
            <CardContent className="space-y-4 p-5">
              <h2 className="font-semibold">Key facts</h2>
              <dl className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <BedDouble className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Typical stay</dt>
                    <dd className="font-medium">{treatment.typicalStay ?? "Varies"}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <IndianRupee className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Price range</dt>
                    <dd className="font-medium">{price ? formatCurrencyRange(price.min, price.max) : "Not available"}</dd>
                  </div>
                </div>
              </dl>
              {price && (
                <div className="rounded-lg border border-warning-text/30 bg-warning-soft p-3 text-sm" role="note">
                  <p className="font-semibold text-warning-text">Illustrative estimate — not a quote</p>
                  <p className="mt-1 text-muted-foreground">{price.note}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {related.hospitals.length} hospitals · {related.doctors.length} doctors list this treatment
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
