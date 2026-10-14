import { ArrowRight, Award, BedDouble, Clock, GitCompareArrows, Heart, IndianRupee, Languages, LayoutGrid, MapPin, Star, Stethoscope, Video } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { RatingStars, SponsoredBadge } from "@/components/shared/trust-badges"
import { VerificationBadge } from "@/components/shared/verification-badge"
import { getHospitalImage, ImagePlaceholder, PersonAvatar } from "@/components/shared/visuals"
import { getHospitalsForDoctor, getRatingSummary, getSpecialty, getSpecialtyNames, isSponsored } from "@/data/selectors"
import { useCompare } from "@/hooks/use-compare"
import { useDemoStore } from "@/hooks/use-demo-store"
import { useFavourites } from "@/hooks/use-favourites"
import { AVAILABILITY_LABELS, CONSULTATION_MODE_LABELS } from "@/lib/constants"
import { formatCurrency, formatCurrencyRange, formatDate } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { Doctor, Hospital, Treatment } from "@/types"

interface EntityCardProps {
  media?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  badges?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  className?: string
}

/** Generic card shell shared by hospital, doctor and treatment cards. */
export function EntityCard({ media, title, subtitle, badges, children, footer, className }: EntityCardProps) {
  return (
    <Card className={cn("group/card h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-raised", className)}>
      {media}
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        {badges && <div className="flex flex-wrap gap-1.5">{badges}</div>}
        <div className="space-y-1">
          <h3 className="text-base leading-snug font-semibold">{title}</h3>
          {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
        </div>
        {children}
      </CardContent>
      {footer && <CardFooter className="flex flex-wrap gap-2 border-t bg-muted/30 p-4">{footer}</CardFooter>}
    </Card>
  )
}

function FavouriteButton({
  type,
  id,
  name,
  className,
}: {
  type: "hospital" | "doctor" | "treatment"
  id: string
  name: string
  className?: string
}) {
  const { toggle, isFavourite } = useFavourites()
  const active = isFavourite(type, id)
  return (
    <Button
      variant="outline"
      size="icon"
      className={className}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from favourites` : `Save ${name} to favourites`}
      onClick={() => toggle(type, id, name)}
    >
      <Heart className={cn(active && "fill-destructive text-destructive")} />
    </Button>
  )
}

const AVAILABILITY_DOT: Record<Hospital["appointmentAvailability"], string> = {
  available: "bg-success",
  limited: "bg-highlight",
  unavailable: "bg-muted-foreground",
}

export function HospitalCard({ hospital, className }: { hospital: Hospital; className?: string }) {
  const { data } = useDemoStore()
  const { toggle, isComparing } = useCompare()
  const rating = getRatingSummary(data, "hospital", hospital.id)
  const specialties = getSpecialtyNames(data, hospital.specialtyIds)
  const comparing = isComparing(hospital.id)
  const sponsored = isSponsored(data, "hospital", hospital.id)
  const href = `/hospital/${hospital.slug}`

  return (
    <Card
      className={cn(
        "group/card h-full gap-0 overflow-hidden py-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-raised",
        className,
      )}
    >
      {/* Media with overlaid badges */}
      <div className="relative">
        <Link to={href} tabIndex={-1} aria-hidden="true" className="block overflow-hidden">
          <ImagePlaceholder
            src={getHospitalImage(hospital)}
            hue={hospital.imageHue}
            label={hospital.name}
            className="h-44 transition-transform duration-500 group-hover/card:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        </Link>
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pr-14">
          <VerificationBadge
            status={hospital.verification.status}
            lastVerifiedAt={hospital.verification.lastVerifiedAt}
            className="shadow-soft"
          />
          {sponsored && <SponsoredBadge className="shadow-soft" />}
        </div>
        <FavouriteButton
          type="hospital"
          id={hospital.id}
          name={hospital.name}
          className="absolute top-3 right-3 rounded-full border-white/40 bg-white/80 shadow-soft backdrop-blur hover:bg-white dark:bg-black/50"
        />
        <div className="pointer-events-none absolute right-3 bottom-3 left-3 flex items-end justify-between gap-2 text-white">
          {rating.count > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-xs font-semibold backdrop-blur">
              <Star className="size-3.5 fill-highlight text-highlight" aria-hidden="true" />
              {rating.average.toFixed(1)}
              <span className="font-normal text-white/80">({rating.count})</span>
            </span>
          ) : (
            <span className="rounded-full bg-black/45 px-2.5 py-1 text-xs backdrop-blur">No reviews yet</span>
          )}
          <span className="rounded-full bg-black/45 px-2.5 py-1 text-xs backdrop-blur">{hospital.type}</span>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-1.5">
          <h3 className="text-lg leading-snug font-semibold">
            <Link to={href} className="transition-colors hover:text-primary focus-visible:underline">
              {hospital.name}
            </Link>
          </h3>
          <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
            {hospital.city}, {hospital.state}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {specialties.slice(0, 3).map((s) => (
            <Badge key={s} variant="secondary" className="rounded-full font-normal">
              {s}
            </Badge>
          ))}
          {specialties.length > 3 && (
            <Badge variant="outline" className="rounded-full font-normal">
              +{specialties.length - 3} more
            </Badge>
          )}
        </div>

        <dl className="grid grid-cols-3 divide-x rounded-xl border bg-muted/40 text-center">
          {[
            { icon: BedDouble, label: "Beds", value: hospital.beds },
            { icon: LayoutGrid, label: "Facilities", value: hospital.facilityIds.length },
            { icon: Award, label: "Accredited", value: hospital.accreditationIds.length },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-0.5 px-2 py-2.5">
              <Icon className="size-4 text-primary" aria-hidden="true" />
              <dd className="text-sm font-semibold tabular-nums">{value}</dd>
              <dt className="text-[11px] text-muted-foreground">{label}</dt>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", AVAILABILITY_DOT[hospital.appointmentAvailability])} aria-hidden="true" />
            {AVAILABILITY_LABELS[hospital.appointmentAvailability]}
          </span>
          <span>Updated {formatDate(hospital.updatedAt)}</span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 border-t p-4">
        <Button asChild className="group/btn flex-1">
          <Link to={href}>
            View details <ArrowRight className="transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </Button>
        <Button variant={comparing ? "secondary" : "outline"} aria-pressed={comparing} onClick={() => toggle(hospital.id, hospital.name)}>
          <GitCompareArrows />
          {comparing ? "Comparing" : "Compare"}
        </Button>
      </CardFooter>
    </Card>
  )
}

export function DoctorCard({ doctor, className }: { doctor: Doctor; className?: string }) {
  const { data } = useDemoStore()
  const rating = getRatingSummary(data, "doctor", doctor.id)
  const specialty = getSpecialty(data, doctor.specialtyId)
  const hospitals = getHospitalsForDoctor(data, doctor.id)
  const sponsored = isSponsored(data, "doctor", doctor.id)

  return (
    <EntityCard
      className={className}
      badges={
        <>
          <VerificationBadge status={doctor.verification.status} lastVerifiedAt={doctor.verification.lastVerifiedAt} />
          {sponsored && <SponsoredBadge />}
        </>
      }
      title={
        <span className="flex items-center gap-3">
          <PersonAvatar name={doctor.name} />
          <span className="min-w-0">
            <Link to={`/doctor/${doctor.slug}`} className="hover:text-primary focus-visible:underline">
              {doctor.name}
            </Link>
            <span className="block text-sm font-normal text-muted-foreground">
              {specialty?.name}
              {doctor.subSpecialty ? ` · ${doctor.subSpecialty}` : ""}
            </span>
          </span>
        </span>
      }
      footer={
        <>
          <Button asChild className="flex-1">
            <Link to={`/doctor/${doctor.slug}`}>
              View profile <ArrowRight />
            </Link>
          </Button>
          <FavouriteButton type="doctor" id={doctor.id} name={doctor.name} />
        </>
      }
    >
      <RatingStars value={rating.average} count={rating.count} />
      <p className="text-sm text-muted-foreground">{doctor.qualifications.map((q) => q.degree).join(", ")}</p>
      <ul className="grid gap-1.5 text-sm">
        <li className="flex items-center gap-2">
          <Stethoscope className="size-4 text-muted-foreground" aria-hidden="true" />
          {doctor.experienceYears} years experience
        </li>
        <li className="flex items-center gap-2">
          <Languages className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="truncate">{doctor.languages.join(", ")}</span>
        </li>
        <li className="flex items-center gap-2">
          <Video className="size-4 text-muted-foreground" aria-hidden="true" />
          {doctor.consultationModes.map((m) => CONSULTATION_MODE_LABELS[m]).join(" · ")}
        </li>
        <li className="flex items-center gap-2">
          <IndianRupee className="size-4 text-muted-foreground" aria-hidden="true" />
          {doctor.consultationFee !== undefined ? `${formatCurrency(doctor.consultationFee)} consultation (provider-submitted)` : "Fee not provided"}
        </li>
        <li className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
          {AVAILABILITY_LABELS[doctor.availabilityLevel]}
        </li>
      </ul>
      {hospitals.length > 0 && (
        <p className="mt-auto text-xs text-muted-foreground">
          <MapPin className="mr-1 inline size-3.5" aria-hidden="true" />
          {hospitals.map((h) => h.name).join(" · ")}
        </p>
      )}
    </EntityCard>
  )
}

export function TreatmentCard({ treatment, className }: { treatment: Treatment; className?: string }) {
  const { data } = useDemoStore()
  const specialties = getSpecialtyNames(data, treatment.specialtyIds)
  return (
    <EntityCard
      className={className}
      badges={
        <>
          <Badge variant="secondary">{treatment.category}</Badge>
          {specialties.slice(0, 1).map((s) => (
            <Badge key={s} variant="outline">
              {s}
            </Badge>
          ))}
        </>
      }
      title={
        <Link to={`/treatment/${treatment.slug}`} className="hover:text-primary focus-visible:underline">
          {treatment.name}
        </Link>
      }
      footer={
        <>
          <Button asChild variant="outline" className="flex-1">
            <Link to={`/treatment/${treatment.slug}`}>
              Learn more <ArrowRight />
            </Link>
          </Button>
          <FavouriteButton type="treatment" id={treatment.id} name={treatment.name} />
        </>
      }
    >
      <p className="line-clamp-3 text-sm text-muted-foreground">{treatment.overview}</p>
      {treatment.priceEstimate && (
        <p className="mt-auto text-sm">
          <span className="font-medium">{formatCurrencyRange(treatment.priceEstimate.min, treatment.priceEstimate.max)}</span>
          <span className="block text-xs text-muted-foreground">Illustrative estimate only — not a quote</span>
        </p>
      )}
    </EntityCard>
  )
}
