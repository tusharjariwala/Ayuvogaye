import {
  Ambulance,
  BedDouble,
  CalendarClock,
  CalendarPlus,
  Check,
  Flag,
  Globe,
  GitCompareArrows,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Siren,
  Stethoscope,
  X,
} from "lucide-react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RatingStars, SourceBadge, SponsoredBadge } from "@/components/shared/trust-badges"
import { VerificationBadge, VerificationExplainer } from "@/components/shared/verification-badge"
import { ImagePlaceholder } from "@/components/shared/visuals"
import { getRatingSummary, getSpecialty, isSponsored } from "@/data/selectors"
import { useCompare } from "@/hooks/use-compare"
import { useDemoStore } from "@/hooks/use-demo-store"
import { ReportDialog } from "@/features/reviews/components/report-dialog"
import { VERIFICATION_DESCRIPTIONS, WEEKDAY_LABELS } from "@/lib/constants"
import { formatDate, formatTime } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { Facility, Hospital } from "@/types"
import { ALL_FIELD_GROUPS, FIELD_GROUP_LABELS, getToday } from "../lib/today"
import { DetailSection } from "./detail-section"
import { FavouriteToggle } from "./favourite-toggle"
import { RequestDialog } from "./request-dialog"

const FACILITY_CATEGORY_LABELS: Record<Facility["category"], string> = {
  clinical: "Clinical",
  diagnostics: "Diagnostics",
  emergency: "Emergency",
  patient_comfort: "Patient comfort",
  accessibility: "Accessibility",
}

function sourceFor(hospital: Hospital, group: string) {
  return hospital.verifiedFields.includes(group) ? "platform_verified" : "provider_submitted"
}

export function HospitalHero({ hospital }: { hospital: Hospital }) {
  const { data } = useDemoStore()
  const { toggle, isComparing } = useCompare()
  const rating = getRatingSummary(data, "hospital", hospital.id)
  const comparing = isComparing(hospital.id)
  const sponsored = isSponsored(data, "hospital", hospital.id)

  return (
    <section aria-labelledby="hospital-title" className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3 sm:grid-rows-2">
        <ImagePlaceholder hue={hospital.imageHue} label={`${hospital.name} exterior`} className="h-48 rounded-xl sm:col-span-2 sm:row-span-2 sm:h-72" />
        <ImagePlaceholder
          hue={hospital.imageHue + 30}
          label={`${hospital.name} ward`}
          icon={BedDouble}
          className="hidden rounded-xl sm:flex sm:h-auto"
        />
        <ImagePlaceholder
          hue={hospital.imageHue - 30}
          label={`${hospital.name} consultation room`}
          icon={Stethoscope}
          className="hidden rounded-xl sm:flex sm:h-auto"
        />
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <VerificationBadge status={hospital.verification.status} lastVerifiedAt={hospital.verification.lastVerifiedAt} />
            {sponsored && <SponsoredBadge />}
            <Badge variant="secondary">{hospital.type}</Badge>
            {!hospital.claimed && <Badge variant="outline">Unclaimed profile</Badge>}
          </div>
          <div className="space-y-1">
            <h1 id="hospital-title" className="text-2xl font-semibold sm:text-3xl">
              {hospital.name}
            </h1>
            <p className="text-muted-foreground">{hospital.tagline}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <RatingStars value={rating.average} count={rating.count} />
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="size-4" aria-hidden="true" />
              {hospital.address}, {hospital.city}, {hospital.state} {hospital.pincode}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <RequestDialog
            providerName={hospital.name}
            hospitalId={hospital.id}
            trigger={
              <Button>
                <CalendarPlus /> Request appointment
              </Button>
            }
          />
          <RequestDialog
            providerName={hospital.name}
            hospitalId={hospital.id}
            defaultTab="enquiry"
            trigger={
              <Button variant="outline">
                <MessageSquare /> Send enquiry
              </Button>
            }
          />
          <Button variant={comparing ? "secondary" : "outline"} aria-pressed={comparing} onClick={() => toggle(hospital.id, hospital.name)}>
            <GitCompareArrows /> {comparing ? "Comparing" : "Compare"}
          </Button>
          <FavouriteToggle type="hospital" id={hospital.id} name={hospital.name} />
        </div>
      </div>
    </section>
  )
}

export function HospitalOverview({ hospital }: { hospital: Hospital }) {
  return (
    <DetailSection id="overview" title="Overview" action={<SourceBadge source={sourceFor(hospital, "basic_info")} />}>
      <p className="leading-relaxed text-muted-foreground">{hospital.description}</p>
      <dl className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Type", value: hospital.type },
          { label: "Established", value: String(hospital.establishedYear) },
          { label: "Beds (provider-submitted)", value: String(hospital.beds) },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">{item.label}</dt>
            <dd className="font-medium">{item.value}</dd>
          </div>
        ))}
      </dl>
      <div className="space-y-2">
        <h3 className="font-medium">Locations</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {hospital.locations.map((loc) => (
            <li key={loc.id} className="rounded-lg border p-4 text-sm">
              <p className="flex flex-wrap items-center gap-2 font-medium">
                {loc.label}
                {loc.isPrimary && <Badge variant="secondary">Primary</Badge>}
              </p>
              <p className="text-muted-foreground">
                {loc.address}, {loc.pincode}
              </p>
              <p className="text-muted-foreground">{loc.phone}</p>
            </li>
          ))}
        </ul>
      </div>
    </DetailSection>
  )
}

export function HospitalDepartments({ hospital }: { hospital: Hospital }) {
  const { data } = useDemoStore()
  const departments = data.departments.filter((d) => hospital.departmentIds.includes(d.id))
  return (
    <DetailSection
      id="departments"
      title="Departments & specialties"
      description="Departments listed by the hospital."
      action={<SourceBadge source={sourceFor(hospital, "departments")} />}
    >
      <div className="flex flex-wrap gap-2">
        {hospital.specialtyIds.map((id) => {
          const s = getSpecialty(data, id)
          return s ? (
            <Badge key={id} asChild variant="outline">
              <Link to={`/specialties/${s.slug}`}>{s.name}</Link>
            </Badge>
          ) : null
        })}
      </div>
      {departments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No departments listed.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {departments.map((d) => (
            <li key={d.id} className="rounded-lg border p-4">
              <p className="font-medium">{d.name}</p>
              <p className="text-sm text-muted-foreground">{d.description}</p>
            </li>
          ))}
        </ul>
      )}
    </DetailSection>
  )
}

export function HospitalTreatments({ hospital }: { hospital: Hospital }) {
  const { data } = useDemoStore()
  const treatments = data.treatments.filter((t) => hospital.treatmentIds.includes(t.id))
  return (
    <DetailSection id="treatments" title="Treatments offered" description="As listed by the hospital. Availability may change — confirm directly.">
      {treatments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No treatments listed.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {treatments.map((t) => (
            <li key={t.id}>
              <Link
                to={`/treatment/${t.slug}`}
                className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-accent"
              >
                <span className="font-medium">{t.name}</span>
                <Badge variant="secondary" className="shrink-0">
                  {t.category}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DetailSection>
  )
}

export function HospitalFacilities({ hospital }: { hospital: Hospital }) {
  const { data } = useDemoStore()
  const facilities = data.facilities.filter((f) => hospital.facilityIds.includes(f.id))
  const groups = (Object.keys(FACILITY_CATEGORY_LABELS) as Facility["category"][])
    .map((cat) => ({ cat, items: facilities.filter((f) => f.category === cat) }))
    .filter((g) => g.items.length > 0)
  return (
    <DetailSection id="facilities" title="Facilities" action={<SourceBadge source={sourceFor(hospital, "facilities")} />}>
      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">No facilities listed.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {groups.map((g) => (
            <div key={g.cat} className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">{FACILITY_CATEGORY_LABELS[g.cat]}</h3>
              <ul className="space-y-1.5">
                {g.items.map((f) => (
                  <li key={f.id} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-success-text" aria-hidden="true" />
                    {f.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </DetailSection>
  )
}

export function HospitalAccreditations({ hospital }: { hospital: Hospital }) {
  const { data } = useDemoStore()
  const items = data.accreditations.filter((a) => hospital.accreditationIds.includes(a.id))
  const source = sourceFor(hospital, "accreditations")
  return (
    <DetailSection
      id="accreditations"
      title="Accreditations"
      description="Accreditation names are illustrative categories in this template."
    >
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No accreditations listed.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li key={a.id} className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="font-medium">
                  {a.code} <span className="font-normal text-muted-foreground">· {a.name}</span>
                </p>
                <p className="text-sm text-muted-foreground">{a.description}</p>
              </div>
              <SourceBadge source={source} className="shrink-0" />
            </li>
          ))}
        </ul>
      )}
    </DetailSection>
  )
}

export function HospitalHours({ hospital }: { hospital: Hospital }) {
  const today = getToday()
  return (
    <DetailSection id="hours" title="Operating hours" action={<SourceBadge source={sourceFor(hospital, "hours")} />}>
      <div className="rounded-lg border">
        <Table>
          <TableCaption className="sr-only">Weekly operating hours</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Day</TableHead>
              <TableHead className="pr-4">Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hospital.operatingHours.map((h) => {
              const isToday = h.day === today
              const allDay = h.open === "00:00" && h.close === "23:59"
              return (
                <TableRow key={h.day} className={cn(isToday && "bg-accent/60 font-medium")} aria-current={isToday ? "date" : undefined}>
                  <TableCell className="pl-4">
                    {WEEKDAY_LABELS[h.day]}
                    {isToday && (
                      <Badge variant="info" className="ml-2">
                        Today
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="pr-4">
                    {h.closed ? "Closed" : allDay ? "Open 24 hours" : `${formatTime(h.open)} – ${formatTime(h.close)}`}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      {hospital.emergency ? (
        <div className="flex gap-3 rounded-lg border bg-destructive-soft/50 p-4 text-sm">
          <Siren className="mt-0.5 size-5 shrink-0 text-destructive-text" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-medium">
              Emergency services: {hospital.emergency.available ? `available (${hospital.emergency.hours})` : "not available"}
            </p>
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <Ambulance className="size-4" aria-hidden="true" />
              Ambulance {hospital.emergency.ambulance ? "service listed" : "not listed"}
            </p>
            <p className="text-xs text-muted-foreground">
              In a real emergency, call your local emergency number (112 in India). This demo cannot dispatch help.
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No emergency services listed for this hospital.</p>
      )}
    </DetailSection>
  )
}

export function HospitalVerification({ hospital }: { hospital: Hospital }) {
  const v = hospital.verification
  return (
    <DetailSection id="verification" title="Verification details" action={<VerificationExplainer />}>
      <div className="flex flex-wrap items-center gap-3">
        <VerificationBadge status={v.status} lastVerifiedAt={v.lastVerifiedAt} />
        <span className="text-sm text-muted-foreground">
          {v.lastVerifiedAt ? `Last verified ${formatDate(v.lastVerifiedAt)}` : "Not yet verified"}
          {v.reviewedBy ? ` · Reviewed by ${v.reviewedBy}` : ""}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{VERIFICATION_DESCRIPTIONS[v.status]}</p>
      {v.note && <p className="rounded-lg bg-muted/60 p-3 text-sm">{v.note}</p>}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Information sources</h3>
        <ul className="divide-y rounded-lg border">
          {ALL_FIELD_GROUPS.map((g) => (
            <li key={g} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
              <span>{FIELD_GROUP_LABELS[g]}</span>
              <SourceBadge source={sourceFor(hospital, g)} />
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-muted-foreground">
        Profile last updated {formatDate(hospital.updatedAt)}. Verification confirms selected details only — it is not a rating of clinical quality.
      </p>
    </DetailSection>
  )
}

export function HospitalContactCard({ hospital }: { hospital: Hospital }) {
  const items = [
    { icon: Phone, label: "Phone", value: hospital.phone, href: `tel:${hospital.phone.replace(/\s/g, "")}` },
    { icon: Mail, label: "Email", value: hospital.email, href: `mailto:${hospital.email}` },
    ...(hospital.website ? [{ icon: Globe, label: "Website", value: hospital.website.replace(/^https?:\/\//, ""), href: hospital.website }] : []),
    { icon: MapPin, label: "Address", value: `${hospital.address}, ${hospital.city} ${hospital.pincode}` },
  ]
  return (
    <Card className="gap-0 py-0 shadow-soft">
      <CardContent className="space-y-4 p-5">
        <h2 className="font-semibold">Contact</h2>
        <ul className="space-y-3 text-sm">
          {items.map(({ icon: Icon, label, value, href }) => (
            <li key={label} className="flex gap-3">
              <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                {href ? (
                  <a href={href} className="break-words hover:text-primary hover:underline" {...(label === "Website" ? { target: "_blank", rel: "noreferrer" } : {})}>
                    {value}
                  </a>
                ) : (
                  <p className="break-words">{value}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">Contact details are fictional placeholders.</p>
        <div className="grid gap-2">
          <RequestDialog
            providerName={hospital.name}
            hospitalId={hospital.id}
            trigger={
              <Button className="w-full">
                <CalendarClock /> Request appointment
              </Button>
            }
          />
          <RequestDialog
            providerName={hospital.name}
            hospitalId={hospital.id}
            defaultTab="enquiry"
            trigger={
              <Button variant="outline" className="w-full">
                <MessageSquare /> Send enquiry
              </Button>
            }
          />
        </div>
        <div className="border-t pt-3">
          <ReportDialog
            entityType="hospital"
            entityId={hospital.id}
            entityName={hospital.name}
            trigger={
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                <Flag /> Report inaccurate profile
              </Button>
            }
          />
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {hospital.claimed ? <Check className="size-3.5" aria-hidden="true" /> : <X className="size-3.5" aria-hidden="true" />}
          {hospital.claimed ? "Profile claimed by the hospital" : "Unclaimed profile"} · Updated {formatDate(hospital.updatedAt)}
        </p>
      </CardContent>
    </Card>
  )
}
