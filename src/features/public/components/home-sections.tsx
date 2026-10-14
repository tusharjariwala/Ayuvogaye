import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  GitCompareArrows,
  Megaphone,
  MessagesSquare,
  PenLine,
  Search,
  ShieldCheck,
  Stethoscope,
  UserCheck,
} from "lucide-react"
import { useMemo, type ReactNode } from "react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DoctorCard, HospitalCard, TreatmentCard } from "@/components/shared/entity-cards"
import { SectionHeader } from "@/components/shared/page-header"
import { CountUp, Reveal } from "@/components/shared/reveal"
import { SampleBadge, SourceBadge } from "@/components/shared/trust-badges"
import { VerificationBadge, VerificationExplainer } from "@/components/shared/verification-badge"
import { SpecialtyIcon } from "@/components/shared/visuals"
import { getDoctorsForSpecialty, getHospitalsForTreatment, getSpecialtyBySlug, isSponsored } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { ReviewCard } from "@/features/reviews/components/review-components"
import { SearchForm } from "@/features/search/components/search-form"
import { APP_NAME, AVAILABILITY_LABELS } from "@/lib/constants"
import type { Hospital } from "@/types"
import { HeroIllustration } from "./hero-illustration"

const POPULAR_SPECIALTIES = ["cardiology", "orthopaedics", "paediatrics", "ophthalmology", "dermatology", "oncology"]
const DOCTOR_TABS = ["cardiology", "orthopaedics", "paediatrics", "dermatology"]

function Section({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className={className}>
      <Reveal className="container-page py-14 sm:py-16">{children}</Reveal>
    </section>
  )
}

export function HomeHero() {
  const { data } = useDemoStore()
  const chips = POPULAR_SPECIALTIES.map((s) => getSpecialtyBySlug(data, s)).filter((s) => !!s)
  const stats = [
    { label: "Hospitals", value: data.hospitals.length },
    { label: "Doctors", value: data.doctors.length },
    { label: "Specialties", value: data.specialties.length },
    { label: "Cities", value: data.cities.length },
  ]
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden border-b bg-gradient-to-b from-accent/60 to-background">
      {/* Animated background: soft colour blobs over a faded dot grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 size-[28rem] animate-blob rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-10 -right-24 size-[24rem] animate-blob rounded-full bg-highlight/25 blur-3xl [animation-delay:-5s]" />
        <div className="absolute -bottom-40 left-1/3 size-[26rem] animate-blob rounded-full bg-primary/10 blur-3xl [animation-delay:-9s]" />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      <div className="container-page grid grid-cols-1 items-center gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:py-24">
        <div className="min-w-0 space-y-7">
          <Badge variant="outline" className="animate-fade-up gap-1.5 bg-card/80 backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            Ayuvoyage · Trusted medical journeys across India
          </Badge>
          <div className="space-y-4">
            <h1
              id="hero-title"
              className="animate-fade-up text-4xl leading-[1.1] font-bold tracking-tight text-balance [animation-delay:100ms] sm:text-5xl lg:text-6xl"
            >
              Find the <span className="text-gradient">Right Hospital or Doctor</span> for Your Healthcare Journey
            </h1>
            <p className="animate-fade-up max-w-2xl text-base text-pretty text-muted-foreground [animation-delay:200ms] sm:text-lg">
              Search hospitals, doctors and treatments, see exactly which details have been verified, compare options side by side
              and send a request — with sponsored listings always clearly labelled.
            </p>
          </div>
          <div className="animate-fade-up rounded-2xl border bg-card/70 p-2 shadow-raised backdrop-blur [animation-delay:300ms]">
            <SearchForm size="lg" />
          </div>
          <div className="animate-fade-up flex flex-wrap items-center gap-2 [animation-delay:400ms]">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {chips.map((s) => (
              <Badge
                key={s.id}
                asChild
                variant="outline"
                className="h-8 gap-1.5 bg-card/80 px-3 text-sm font-normal transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent hover:shadow-soft"
              >
                <Link to={`/specialties/${s.slug}`}>
                  <SpecialtyIcon icon={s.icon} className="size-3.5 text-primary" />
                  {s.name}
                </Link>
              </Badge>
            ))}
          </div>
          <dl className="animate-fade-up grid max-w-xl grid-cols-2 gap-4 pt-2 [animation-delay:500ms] sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse border-l-2 border-primary/30 pl-3">
                <dt className="text-xs text-muted-foreground">{s.label}</dt>
                <dd className="text-2xl font-bold">
                  <CountUp value={s.value} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="animate-fade-up hidden px-8 [animation-delay:250ms] lg:block">
          <HeroIllustration />
        </div>
      </div>
    </section>
  )
}

export function SpecialtyGrid() {
  const { data } = useDemoStore()
  const specialties = data.specialties.slice(0, 12)
  return (
    <Section id="specialties-title">
      <SectionHeader
        id="specialties-title"
        title="Search by specialty"
        description="Start with the type of care you're looking for."
      />
      <Reveal as="ul" stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {specialties.map((s) => (
          <li key={s.id}>
            <Link
              to={`/specialties/${s.slug}`}
              className="group flex h-full flex-col items-start gap-3 rounded-xl border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-raised focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <SpecialtyIcon icon={s.icon} className="size-5" />
              </span>
              <span className="text-sm leading-snug font-medium">{s.name}</span>
            </Link>
          </li>
        ))}
      </Reveal>
    </Section>
  )
}

export function FeaturedHospitals() {
  const { data } = useDemoStore()
  const hospitals = useMemo(() => {
    const active = data.hospitals.filter((h) => h.status === "active")
    const featured = active.filter((h) => isSponsored(data, "hospital", h.id))
    const rest = active.filter((h) => !featured.includes(h) && h.verification.status === "verified")
    return [...featured, ...rest].slice(0, 6)
  }, [data])
  return (
    <Section id="featured-title" className="bg-muted/40">
      <SectionHeader
        id="featured-title"
        title="Featured hospitals"
        description="A mix of sponsored and verified sample listings."
        action={
          <Button asChild variant="outline">
            <Link to="/hospitals">
              All hospitals <ArrowRight />
            </Link>
          </Button>
        }
      />
      <p className="-mt-2 mb-5 flex items-start gap-2 text-sm text-muted-foreground">
        <Megaphone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Listings marked “Sponsored” are paid placements. Sponsorship doesn't affect verification status or imply better care.
      </p>
      <Reveal as="ul" stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {hospitals.map((h) => (
          <li key={h.id}>
            <HospitalCard hospital={h} />
          </li>
        ))}
      </Reveal>
    </Section>
  )
}

export function DoctorsBySpecialty() {
  const { data } = useDemoStore()
  const tabs = DOCTOR_TABS.map((slug) => getSpecialtyBySlug(data, slug)).filter((s) => !!s)
  if (tabs.length === 0) return null
  return (
    <Section id="doctors-title">
      <SectionHeader
        id="doctors-title"
        title="Doctors by specialty"
        description="Sample doctor profiles with qualifications, languages and consultation modes."
        action={
          <Button asChild variant="outline">
            <Link to="/doctors">
              All doctors <ArrowRight />
            </Link>
          </Button>
        }
      />
      <Tabs defaultValue={tabs[0].slug} className="gap-6">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList>
            {tabs.map((s) => (
              <TabsTrigger key={s.id} value={s.slug}>
                {s.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {tabs.map((s) => {
          const doctors = getDoctorsForSpecialty(data, s.id).slice(0, 3)
          return (
            <TabsContent key={s.id} value={s.slug} className="space-y-5">
              {doctors.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sample doctors listed for {s.name} yet.</p>
              ) : (
                <Reveal as="ul" stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {doctors.map((d) => (
                    <li key={d.id}>
                      <DoctorCard doctor={d} />
                    </li>
                  ))}
                </Reveal>
              )}
              <Button asChild variant="link" className="px-0">
                <Link to={`/doctors/all/${s.slug}`}>
                  See all {s.name.toLowerCase()} doctors <ArrowRight />
                </Link>
              </Button>
            </TabsContent>
          )
        })}
      </Tabs>
    </Section>
  )
}

export function PopularTreatments() {
  const { data } = useDemoStore()
  const treatments = useMemo(
    () =>
      [...data.treatments]
        .filter((t) => t.editorial.status === "published")
        .sort((a, b) => getHospitalsForTreatment(data, b.id).length - getHospitalsForTreatment(data, a.id).length)
        .slice(0, 6),
    [data],
  )
  return (
    <Section id="treatments-title" className="bg-muted/40">
      <SectionHeader
        id="treatments-title"
        title="Popular treatments"
        description="Plain-language overviews with illustrative price ranges — never quotes."
        action={
          <Button asChild variant="outline">
            <Link to="/treatments">
              All treatments <ArrowRight />
            </Link>
          </Button>
        }
      />
      <Reveal as="ul" stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {treatments.map((t) => (
          <li key={t.id}>
            <TreatmentCard treatment={t} />
          </li>
        ))}
      </Reveal>
    </Section>
  )
}

export function ComparisonPreview() {
  const { data } = useDemoStore()
  const hospitals = data.hospitals.filter((h) => h.status === "active").slice(0, 3)
  const accreditationCodes = (h: Hospital) =>
    data.accreditations
      .filter((a) => h.accreditationIds.includes(a.id))
      .map((a) => a.code)
      .join(", ") || "—"
  const rows: { label: string; value: (h: Hospital) => ReactNode }[] = [
    { label: "City", value: (h) => h.city },
    { label: "Type", value: (h) => h.type },
    { label: "Beds", value: (h) => h.beds },
    { label: "Specialties", value: (h) => h.specialtyIds.length },
    { label: "Facilities", value: (h) => h.facilityIds.length },
    { label: "Accreditations", value: accreditationCodes },
    { label: "Appointments", value: (h) => AVAILABILITY_LABELS[h.appointmentAvailability] },
    { label: "Verification", value: (h) => <VerificationBadge status={h.verification.status} lastVerifiedAt={h.verification.lastVerifiedAt} /> },
  ]
  return (
    <Section id="compare-title">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="space-y-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GitCompareArrows className="size-5" aria-hidden="true" />
          </span>
          <h2 id="compare-title" className="text-xl font-semibold sm:text-2xl">
            Compare hospitals side by side
          </h2>
          <p className="text-muted-foreground">
            Line up to four hospitals on facilities, specialties, accreditations, appointment availability and sample review
            dimensions. Comparisons are factual — we never declare a “winner”.
          </p>
          <Button asChild>
            <Link to="/compare/hospitals">
              Start comparing <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-soft">
          <Table>
            <TableCaption className="px-4 pb-4 text-xs">Preview with sample data.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">
                  <span className="sr-only">Attribute</span>
                </TableHead>
                {hospitals.map((h) => (
                  <TableHead key={h.id} className="min-w-36 pr-4">
                    <Link to={`/hospital/${h.slug}`} className="font-semibold text-foreground hover:text-primary">
                      {h.name}
                    </Link>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.label}>
                  <TableHead scope="row" className="pl-4 text-muted-foreground">
                    {row.label}
                  </TableHead>
                  {hospitals.map((h) => (
                    <TableCell key={h.id} className="pr-4">
                      {row.value(h)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Section>
  )
}

const STEPS = [
  { icon: Search, title: "Search", text: "Look up a hospital, doctor, specialty or treatment in your city." },
  { icon: BadgeCheck, title: "Check what's verified", text: "Each profile shows which details the platform has checked and which are provider-submitted." },
  { icon: GitCompareArrows, title: "Compare", text: "Put hospitals side by side on facts — facilities, accreditations, availability." },
  { icon: CalendarCheck, title: "Send a request", text: "Request an appointment or send an enquiry. In this demo, requests are simulated." },
]

export function HowItWorks() {
  return (
    <Section id="how-title" className="bg-muted/40">
      <SectionHeader id="how-title" title="How it works" description={`Four simple steps to find care with ${APP_NAME}.`} />
      <Reveal as="ol" stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <Card className="h-full gap-0 py-0 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-raised">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <step.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground tabular-nums">Step {i + 1}</span>
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </Reveal>
    </Section>
  )
}

export function TrustSection() {
  return (
    <Section id="trust-title">
      <SectionHeader
        id="trust-title"
        title="Verification you can understand"
        description="We show where every piece of information comes from, so you can judge it for yourself."
        action={<VerificationExplainer />}
      />
      <Reveal stagger className="grid gap-5 md:grid-cols-3">
        <Card className="gap-0 py-0 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-raised">
          <CardContent className="space-y-3 p-5">
            <SourceBadge source="platform_verified" />
            <h3 className="font-semibold">Platform-verified</h3>
            <p className="text-sm text-muted-foreground">
              Selected details — such as basic information or accreditations — have been checked against evidence the provider
              submitted. Verification is not a rating of clinical quality.
            </p>
          </CardContent>
        </Card>
        <Card className="gap-0 py-0 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-raised">
          <CardContent className="space-y-3 p-5">
            <SourceBadge source="provider_submitted" />
            <h3 className="font-semibold">Provider-submitted</h3>
            <p className="text-sm text-muted-foreground">
              Supplied by the hospital or doctor and not independently checked yet. Fees, availability and many profile details fall
              into this group — please confirm directly.
            </p>
          </CardContent>
        </Card>
        <Card className="gap-0 py-0 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-raised">
          <CardContent className="space-y-3 p-5">
            <Badge variant="highlight" className="gap-1">
              <Megaphone aria-hidden="true" /> Sponsored
            </Badge>
            <h3 className="font-semibold">Sponsored is not verified</h3>
            <p className="text-sm text-muted-foreground">
              Paid placements are always labelled. Sponsorship never changes a provider's verification status, reviews or how
              comparisons are shown.
            </p>
          </CardContent>
        </Card>
      </Reveal>
    </Section>
  )
}

export function SampleReviews() {
  const { data } = useDemoStore()
  const reviews = useMemo(
    () =>
      data.reviews
        .filter((r) => r.status === "published")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 3),
    [data.reviews],
  )
  if (reviews.length === 0) return null
  return (
    <Section id="reviews-title" className="bg-muted/40">
      <SectionHeader
        id="reviews-title"
        title="What patients say"
        description="Structured reviews cover communication, waiting time, staff, cleanliness and explanation."
        action={<SampleBadge label="Sample reviews — fictional" />}
      />
      <Reveal as="ul" stagger className="grid gap-5 lg:grid-cols-3">
        {reviews.map((r) => (
          <li key={r.id}>
            <ReviewCard review={r} showTarget hideReport />
          </li>
        ))}
      </Reveal>
    </Section>
  )
}

const PROVIDER_FEATURES = [
  { icon: UserCheck, title: "Claim your profile", text: "Take ownership and keep contact details, fees and timings accurate." },
  { icon: BadgeCheck, title: "Get verified", text: "Submit evidence to have selected details marked platform-verified." },
  { icon: PenLine, title: "Respond to reviews", text: "Reply publicly to patient feedback and show you're listening." },
  { icon: MessagesSquare, title: "Manage enquiries", text: "Track appointment requests and enquiries in one dashboard." },
]

export function ProviderCta() {
  return (
    <Section id="provider-title">
      <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/85 text-primary-foreground shadow-raised">
        {/* Decorative background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-20 size-80 animate-blob rounded-full bg-highlight/30 blur-3xl" />
          <div className="absolute -right-16 -bottom-32 size-96 animate-blob rounded-full bg-white/10 blur-3xl [animation-delay:-6s]" />
          <div className="absolute inset-0 [mask-image:linear-gradient(to_right,transparent,black_40%,black_60%,transparent)] bg-[linear-gradient(to_right,rgb(255_255_255/0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.07)_1px,transparent_1px)] [background-size:40px_40px]" />
          <svg viewBox="0 0 200 200" className="absolute -top-12 -right-12 size-72 animate-spin-slow opacity-10">
            <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 10" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M100 55v90M55 100h90" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
          </svg>
        </div>

        <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-12 lg:p-14">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide uppercase backdrop-blur">
              <Stethoscope className="size-3.5" aria-hidden="true" /> For hospitals & doctors
            </span>
            <h2 id="provider-title" className="text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl">
              Are you a hospital or doctor?
            </h2>
            <p className="max-w-xl text-base text-primary-foreground/85 sm:text-lg">
              Join {APP_NAME} to reach patients looking for care, keep your information accurate and build trust with verified
              details.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="highlight" size="lg" className="group shadow-raised">
                <Link to="/account/register?type=provider">
                  Claim your profile <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-primary-foreground backdrop-blur hover:bg-white/20 hover:text-primary-foreground">
                <Link to="/about">Learn more</Link>
              </Button>
            </div>
            <p className="flex items-center gap-2 text-sm text-primary-foreground/75">
              <ShieldCheck className="size-4" aria-hidden="true" /> Free to claim · Sponsorship never affects verification
            </p>
          </div>

          <Reveal as="ul" stagger className="grid gap-4 sm:grid-cols-2">
            {PROVIDER_FEATURES.map((f) => (
              <li
                key={f.title}
                className="group rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/15"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-highlight text-highlight-foreground shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <f.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-primary-foreground/75">{f.text}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </Section>
  )
}
