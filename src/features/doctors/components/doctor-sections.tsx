import { Building2, CalendarDays, Flag, GraduationCap, Info, Languages, PenLine } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppointmentForm } from "@/components/forms/request-form"
import { StatusBadge } from "@/components/shared/status-badge"
import { RatingStars, SourceBadge, SponsoredBadge } from "@/components/shared/trust-badges"
import { VerificationBadge, VerificationExplainer } from "@/components/shared/verification-badge"
import { PersonAvatar } from "@/components/shared/visuals"
import { getHospital, getRatingSummary, getSpecialty, isSponsored } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { ReportDialog } from "@/features/reviews/components/report-dialog"
import { DetailSection } from "@/features/hospitals/components/detail-section"
import { FavouriteToggle } from "@/features/hospitals/components/favourite-toggle"
import { RequestDialog } from "@/features/hospitals/components/request-dialog"
import { getToday } from "@/features/hospitals/lib/today"
import { AVAILABILITY_LABELS, CONSULTATION_MODE_LABELS, VERIFICATION_DESCRIPTIONS, WEEKDAYS, WEEKDAY_LABELS } from "@/lib/constants"
import { formatCurrency, formatDate, formatTime } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { Doctor } from "@/types"

const NO_HOSPITAL = "__none"

function useActiveAffiliations(doctor: Doctor) {
  const { data } = useDemoStore()
  return data.affiliations
    .filter((a) => a.doctorId === doctor.id && a.status !== "ended")
    .map((a) => ({ affiliation: a, hospital: getHospital(data, a.hospitalId) }))
    .filter((x) => !!x.hospital)
}

export function DoctorHero({ doctor }: { doctor: Doctor }) {
  const { data } = useDemoStore()
  const specialty = getSpecialty(data, doctor.specialtyId)
  const rating = getRatingSummary(data, "doctor", doctor.id)
  const sponsored = isSponsored(data, "doctor", doctor.id)
  return (
    <section aria-labelledby="doctor-title" className="rounded-xl border bg-card p-5 shadow-soft sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <PersonAvatar name={doctor.name} className="size-20 text-xl" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <VerificationBadge status={doctor.verification.status} lastVerifiedAt={doctor.verification.lastVerifiedAt} />
            {sponsored && <SponsoredBadge />}
            {!doctor.claimed && <Badge variant="outline">Unclaimed profile</Badge>}
          </div>
          <div className="space-y-1">
            <h1 id="doctor-title" className="text-2xl font-semibold sm:text-3xl">
              {doctor.name}
            </h1>
            <p className="text-muted-foreground">
              {specialty && (
                <Link to={`/specialties/${specialty.slug}`} className="hover:text-primary hover:underline">
                  {specialty.name}
                </Link>
              )}
              {doctor.subSpecialty ? ` · ${doctor.subSpecialty}` : ""} · {doctor.city}, {doctor.state}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <RatingStars value={rating.average} count={rating.count} />
            <span className="text-muted-foreground">{doctor.experienceYears} years experience (provider-submitted)</span>
            <span className="text-muted-foreground">{AVAILABILITY_LABELS[doctor.availabilityLevel]}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-col">
          <Button asChild>
            <a href="#appointment">
              <CalendarDays /> Request appointment
            </a>
          </Button>
          <RequestDialog
            providerName={doctor.name}
            doctorId={doctor.id}
            defaultTab="enquiry"
            trigger={<Button variant="outline">Send enquiry</Button>}
          />
          <FavouriteToggle type="doctor" id={doctor.id} name={doctor.name} />
        </div>
      </div>
    </section>
  )
}

export function UnclaimedNotice({ doctor }: { doctor: Doctor }) {
  if (doctor.claimed) return null
  return (
    <Alert>
      <Info aria-hidden="true" />
      <AlertTitle>Unclaimed profile</AlertTitle>
      <AlertDescription>
        This profile was compiled from available information and has not been claimed by the doctor. Details may be
        incomplete or out of date.{" "}
        <Link to={`/account/register?type=provider&claim=${doctor.slug}`} className="font-medium text-primary underline-offset-4 hover:underline">
          Are you {doctor.name}? Claim this profile
        </Link>
      </AlertDescription>
    </Alert>
  )
}

export function DoctorOverview({ doctor }: { doctor: Doctor }) {
  return (
    <DetailSection id="overview" title="Professional overview" action={<SourceBadge source="provider_submitted" />}>
      <p className="leading-relaxed text-muted-foreground">{doctor.bio}</p>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Languages className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="font-medium">Languages:</span>
        {doctor.languages.map((l) => (
          <Badge key={l} variant="secondary">
            {l}
          </Badge>
        ))}
      </div>
    </DetailSection>
  )
}

export function DoctorQualifications({ doctor }: { doctor: Doctor }) {
  return (
    <DetailSection
      id="qualifications"
      title="Qualifications & institutions"
      description="Each entry shows whether it has been checked by the platform or supplied by the doctor."
    >
      <ul className="space-y-3">
        {[...doctor.qualifications]
          .sort((a, b) => a.year - b.year)
          .map((q) => (
            <li key={q.id} className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <GraduationCap className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="font-medium">{q.degree}</p>
                  <p className="text-sm text-muted-foreground">
                    {q.institution} · {q.year}
                  </p>
                </div>
              </div>
              <SourceBadge source={q.source} className="shrink-0 self-start sm:self-center" />
            </li>
          ))}
      </ul>
    </DetailSection>
  )
}

export function DoctorSpecialties({ doctor }: { doctor: Doctor }) {
  const { data } = useDemoStore()
  const specialty = getSpecialty(data, doctor.specialtyId)
  const treatments = data.treatments.filter((t) => doctor.treatmentIds.includes(t.id))
  return (
    <DetailSection id="specialties" title="Specialties & treatments">
      <div className="flex flex-wrap gap-2">
        {specialty && (
          <Badge asChild>
            <Link to={`/specialties/${specialty.slug}`}>{specialty.name}</Link>
          </Badge>
        )}
        {doctor.subSpecialty && <Badge variant="secondary">{doctor.subSpecialty}</Badge>}
      </div>
      {treatments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No treatments listed.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {treatments.map((t) => (
            <li key={t.id}>
              <Link to={`/treatment/${t.slug}`} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm hover:bg-accent">
                <span className="font-medium">{t.name}</span>
                <Badge variant="outline" className="shrink-0">
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

export function DoctorAffiliations({ doctor }: { doctor: Doctor }) {
  const items = useActiveAffiliations(doctor)
  return (
    <DetailSection id="affiliations" title="Hospital affiliations">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hospital affiliations listed.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map(({ affiliation, hospital }) =>
            hospital ? (
              <li key={affiliation.id}>
                <Link
                  to={`/hospital/${hospital.slug}`}
                  className="flex h-full flex-col gap-2 rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-2 font-medium">
                      <Building2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      {hospital.name}
                    </span>
                    {affiliation.status === "pending" && <StatusBadge status="pending" />}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {affiliation.role} · {hospital.city}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Days: {affiliation.days.map((d) => WEEKDAY_LABELS[d].slice(0, 3)).join(", ")}
                  </span>
                </Link>
              </li>
            ) : null,
          )}
        </ul>
      )}
    </DetailSection>
  )
}

export function DoctorConsultation({ doctor }: { doctor: Doctor }) {
  const { data } = useDemoStore()
  const today = getToday()
  return (
    <DetailSection id="consultation" title="Consultation & availability">
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-muted/50 p-4">
          <dt className="text-xs text-muted-foreground">Consultation modes</dt>
          <dd className="mt-1 flex flex-wrap gap-1.5">
            {doctor.consultationModes.map((m) => (
              <Badge key={m} variant="secondary">
                {CONSULTATION_MODE_LABELS[m]}
              </Badge>
            ))}
          </dd>
        </div>
        <div className="rounded-lg bg-muted/50 p-4">
          <dt className="text-xs text-muted-foreground">Consultation fee</dt>
          <dd className="mt-1 flex flex-wrap items-center gap-2">
            <span className="font-medium">{doctor.consultationFee !== undefined ? formatCurrency(doctor.consultationFee) : "Not provided"}</span>
            <SourceBadge source="provider_submitted" />
          </dd>
        </div>
      </dl>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Weekly availability</h3>
        <ul className="divide-y rounded-lg border">
          {WEEKDAYS.map((day) => {
            const slots = doctor.availability.filter((s) => s.day === day)
            return (
              <li key={day} className={cn("flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-start", day === today && "bg-accent/60")}>
                <span className="w-32 shrink-0 font-medium">
                  {WEEKDAY_LABELS[day]}
                  {day === today && <span className="sr-only"> (today)</span>}
                </span>
                {slots.length === 0 ? (
                  <span className="text-muted-foreground">Not available</span>
                ) : (
                  <ul className="flex flex-wrap gap-1.5">
                    {slots.map((s) => (
                      <li key={s.id}>
                        <Badge variant="outline" className="h-auto py-1 font-normal whitespace-normal">
                          {formatTime(s.start)}–{formatTime(s.end)} · {CONSULTATION_MODE_LABELS[s.mode]}
                          {s.hospitalId ? ` · ${getHospital(data, s.hospitalId)?.name ?? ""}` : ""}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
        <p className="text-xs text-muted-foreground">Availability is provider-submitted and indicative; the provider confirms actual times.</p>
      </div>
    </DetailSection>
  )
}

export function DoctorAppointment({ doctor }: { doctor: Doctor }) {
  const items = useActiveAffiliations(doctor)
  const [hospitalId, setHospitalId] = useState<string>(items[0]?.hospital?.id ?? NO_HOSPITAL)
  const contextHospital = hospitalId === NO_HOSPITAL ? undefined : hospitalId
  return (
    <DetailSection id="appointment" title="Request an appointment" description="This is a demo — your request is stored only in this browser.">
      {items.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="appointment-hospital">Where would you like to see {doctor.name}?</Label>
          <Select value={hospitalId} onValueChange={setHospitalId}>
            <SelectTrigger id="appointment-hospital" className="w-full sm:w-80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {items.map(({ hospital }) =>
                hospital ? (
                  <SelectItem key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </SelectItem>
                ) : null,
              )}
              <SelectItem value={NO_HOSPITAL}>No preference / online consultation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <AppointmentForm key={hospitalId} doctorId={doctor.id} hospitalId={contextHospital} />
    </DetailSection>
  )
}

export function DoctorVerification({ doctor }: { doctor: Doctor }) {
  const v = doctor.verification
  return (
    <DetailSection id="verification" title="Verification" action={<VerificationExplainer />}>
      <div className="flex flex-wrap items-center gap-3">
        <VerificationBadge status={v.status} lastVerifiedAt={v.lastVerifiedAt} />
        <span className="text-sm text-muted-foreground">
          {v.lastVerifiedAt ? `Last verified ${formatDate(v.lastVerifiedAt)}` : "Not yet verified"}
          {v.reviewedBy ? ` · Reviewed by ${v.reviewedBy}` : ""}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{VERIFICATION_DESCRIPTIONS[v.status]}</p>
      <dl className="rounded-lg border p-4 text-sm">
        <dt className="text-xs text-muted-foreground">Registration</dt>
        <dd className="mt-1 space-y-1">
          <p>
            {doctor.registration.council} · <span className="font-mono">{doctor.registration.placeholderRef}</span>
          </p>
          <p className="text-xs text-muted-foreground">Placeholder — not a real registration number.</p>
        </dd>
      </dl>
      <p className="text-xs text-muted-foreground">Profile last updated {formatDate(doctor.updatedAt)}.</p>
    </DetailSection>
  )
}

export function DoctorSidebar({ doctor }: { doctor: Doctor }) {
  const { data } = useDemoStore()
  const specialty = getSpecialty(data, doctor.specialtyId)
  return (
    <Card className="gap-0 py-0 shadow-soft">
      <CardContent className="space-y-4 p-5">
        <h2 className="font-semibold">At a glance</h2>
        <dl className="space-y-2 text-sm">
          {[
            { label: "Specialty", value: specialty?.name ?? "—" },
            { label: "Experience", value: `${doctor.experienceYears} years` },
            { label: "Fee", value: doctor.consultationFee !== undefined ? `${formatCurrency(doctor.consultationFee)} (provider-submitted)` : "Not provided" },
            { label: "Modes", value: doctor.consultationModes.map((m) => CONSULTATION_MODE_LABELS[m]).join(", ") },
            { label: "Availability", value: AVAILABILITY_LABELS[doctor.availabilityLevel] },
          ].map((row) => (
            <div key={row.label} className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-right font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
        <Button asChild className="w-full">
          <a href="#appointment">
            <CalendarDays /> Request appointment
          </a>
        </Button>
        <div className="space-y-2 border-t pt-4">
          <h3 className="text-sm font-medium">Claim or correct this profile</h3>
          <p className="text-xs text-muted-foreground">Doctors can claim their profile to update details and submit evidence for verification.</p>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to={`/account/register?type=provider&claim=${doctor.slug}`}>
              <PenLine /> Claim this profile
            </Link>
          </Button>
          <ReportDialog
            entityType="doctor"
            entityId={doctor.id}
            entityName={doctor.name}
            trigger={
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                <Flag /> Report inaccurate profile
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
