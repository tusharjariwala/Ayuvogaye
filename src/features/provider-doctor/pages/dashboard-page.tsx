import { CalendarClock, CalendarDays, ExternalLink, Eye, FilePen, MessageSquare, PenLine, Star } from "lucide-react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MonthlyTrendChart } from "@/components/charts/charts"
import { DashboardHero, TaskListCard } from "@/components/shared/dashboard-hero"
import { StatCard } from "@/components/shared/stat-card"
import { doctorMonthly } from "@/data/analytics"
import { getHospital, getRatingSummary, getReviewsFor, getSpecialty } from "@/data/selectors"
import { ReviewCard } from "@/features/reviews/components/review-components"
import { RecentEnquiriesCard, UpcomingAppointmentsCard } from "@/features/provider-hospital/components/dashboard-lists"
import { MissingProviderState, PendingChangesNotice, ProfileCompletenessCard, VerificationChecklistCard } from "@/features/provider-hospital/components/portal-widgets"
import { getDoctorCompleteness, getDoctorVerificationSteps, lastDelta } from "@/features/provider-hospital/lib/provider-workflow"
import { AVAILABILITY_LABELS, VERIFICATION_LABELS } from "@/lib/constants"
import { formatCompact, formatNumber } from "@/lib/formatters"
import { AvailabilityOverview } from "../components/availability-overview"
import { ClaimStepper } from "../components/claim-stepper"
import { useManagedDoctor } from "../use-managed-doctor"

const D = "/provider/doctor"

export default function DashboardPage() {
  const { doctor, data, canEdit, pendingChanges, latestCase, submitForVerification, claimProfile } = useManagedDoctor()
  if (!doctor) return <MissingProviderState kind="doctor" />

  const appointments = data.appointments.filter((a) => a.doctorId === doctor.id)
  const enquiries = data.enquiries.filter((e) => e.doctorId === doctor.id)
  const reviews = getReviewsFor(data, "doctor", doctor.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const rating = getRatingSummary(data, "doctor", doctor.id)
  const recent = doctorMonthly.slice(-6)
  const newEnquiries = enquiries.filter((e) => e.status === "new").length
  const requested = appointments.filter((a) => a.status === "requested").length
  const unanswered = reviews.filter((r) => !r.providerResponse).length

  return (
    <div className="space-y-6">
      <DashboardHero
        name={doctor.name}
        context={getSpecialty(data, doctor.specialtyId)?.name}
        description="Your profile, patient requests and weekly availability at a glance. All figures are sample data."
        actions={
          <>
            {canEdit && (
              <Button asChild>
                <Link to={`${D}/profile`}>
                  <PenLine /> Edit profile
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to={`/doctor/${doctor.slug}`}>
                <ExternalLink /> View public profile
              </Link>
            </Button>
          </>
        }
        highlights={[
          { label: "Verification", value: VERIFICATION_LABELS[doctor.verification.status] },
          { label: "Weekly slots", value: doctor.availability.length },
          { label: "Rating", value: rating.count ? `${rating.average.toFixed(1)} ★` : "—" },
        ]}
      />

      <PendingChangesNotice requests={pendingChanges} verified={doctor.verification.status === "verified"} />

      <ClaimStepper doctor={doctor} latestCase={latestCase} canEdit={canEdit} onClaim={claimProfile} />

      <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Profile views"
          value={formatCompact(doctor.profileViews)}
          icon={Eye}
          delta={lastDelta(doctorMonthly.map((m) => m.profileViews))}
          trend={recent.map((m) => m.profileViews)}
          hint="vs last month"
        />
        <StatCard
          label="New enquiries"
          value={formatNumber(newEnquiries)}
          icon={MessageSquare}
          tone="info"
          trend={recent.map((m) => m.enquiries)}
          hint="Awaiting first response"
          href={`${D}/enquiries`}
        />
        <StatCard
          label="Pending appointments"
          value={formatNumber(requested)}
          icon={CalendarClock}
          tone="highlight"
          delta={lastDelta(doctorMonthly.map((m) => m.appointments))}
          trend={recent.map((m) => m.appointments)}
          hint="Requests to confirm"
          href={`${D}/appointments`}
        />
        <StatCard
          label="Average rating"
          value={rating.count ? rating.average.toFixed(1) : "—"}
          icon={Star}
          tone="success"
          hint={`${rating.count} published sample reviews`}
          href={`${D}/reviews`}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <MonthlyTrendChart
            data={doctorMonthly}
            series={[
              { key: "appointments", label: "Appointments", colorIndex: 1 },
              { key: "enquiries", label: "Enquiries", colorIndex: 3 },
            ]}
            title="Appointments & enquiries"
            description="Monthly totals (sample data)"
            summary={`${formatNumber(recent.reduce((s, m) => s + m.appointments, 0))} appointment requests and ${formatNumber(recent.reduce((s, m) => s + m.enquiries, 0))} enquiries in the last 6 months (illustrative figures).`}
          />
        </div>
        <TaskListCard
          items={[
            { label: "Confirm appointment requests", description: "Accept, reschedule or decline", count: requested, href: `${D}/appointments`, icon: CalendarClock },
            { label: "Reply to new enquiries", description: "First response pending", count: newEnquiries, href: `${D}/enquiries`, icon: MessageSquare },
            { label: "Respond to reviews", description: "Published reviews without a reply", count: unanswered, href: `${D}/reviews`, icon: Star },
            { label: "Profile changes in review", description: "Awaiting platform review", count: pendingChanges.length, href: `${D}/profile`, icon: FilePen },
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingAppointmentsCard
          appointments={appointments}
          href={`${D}/appointments`}
          describe={(a) => (a.hospitalId ? (getHospital(data, a.hospitalId)?.name ?? "") : "Independent")}
        />
        <RecentEnquiriesCard enquiries={enquiries} href={`${D}/enquiries`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="lg:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" aria-hidden="true" /> Availability
            </CardTitle>
            <CardDescription>{doctor.availability.length} weekly consultation slots</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link to={`${D}/availability`}>Manage</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            <AvailabilityOverview slots={doctor.availability} />
            <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              Status:{" "}
              <Badge variant={doctor.availabilityLevel === "available" ? "success" : doctor.availabilityLevel === "limited" ? "warning" : "muted"}>
                {AVAILABILITY_LABELS[doctor.availabilityLevel]}
              </Badge>
            </p>
          </CardContent>
        </Card>
        <ProfileCompletenessCard items={getDoctorCompleteness(data, doctor)} />
        <VerificationChecklistCard
          entityType="doctor"
          verification={doctor.verification}
          steps={getDoctorVerificationSteps(doctor)}
          latestCase={latestCase}
          canEdit={canEdit && doctor.claimed}
          onSubmit={submitForVerification}
        />
      </div>

      <section aria-labelledby="recent-reviews" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 id="recent-reviews" className="text-lg font-semibold">
            Recent reviews
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link to={`${D}/reviews`}>All reviews</Link>
          </Button>
        </div>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No published reviews yet.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {reviews.slice(0, 3).map((r) => (
              <ReviewCard key={r.id} review={r} hideReport />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
