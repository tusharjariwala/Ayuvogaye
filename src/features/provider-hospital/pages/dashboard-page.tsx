import { BadgeCheck, CalendarClock, ExternalLink, Eye, FilePen, MessageSquare, PenLine, Star, Stethoscope } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MonthlyTrendChart } from "@/components/charts/charts"
import { ActivityTimeline } from "@/components/shared/activity-timeline"
import { DashboardHero, TaskListCard } from "@/components/shared/dashboard-hero"
import { StatCard } from "@/components/shared/stat-card"
import { hospitalMonthly } from "@/data/analytics"
import { getRatingSummary } from "@/data/selectors"
import { VERIFICATION_LABELS } from "@/lib/constants"
import { formatCompact, formatNumber } from "@/lib/formatters"
import { RecentEnquiriesCard, UpcomingAppointmentsCard } from "../components/dashboard-lists"
import { MissingProviderState, PendingChangesNotice, ProfileCompletenessCard, VerificationChecklistCard } from "../components/portal-widgets"
import { getHospitalCompleteness, getHospitalVerificationSteps, getProviderActivity, lastDelta } from "../lib/provider-workflow"
import { useManagedHospital } from "../use-managed-hospital"

const H = "/provider/hospital"

export default function DashboardPage() {
  const { hospital, data, currentUser, canEdit, pendingChanges, latestCase, submitForVerification } = useManagedHospital()
  if (!hospital) return <MissingProviderState kind="hospital" />

  const enquiries = data.enquiries.filter((e) => e.hospitalId === hospital.id)
  const appointments = data.appointments.filter((a) => a.hospitalId === hospital.id)
  const activeDoctors = data.affiliations.filter((a) => a.hospitalId === hospital.id && a.status === "active").length
  const pendingDoctors = data.affiliations.filter((a) => a.hospitalId === hospital.id && a.status === "pending").length
  const newEnquiries = enquiries.filter((e) => e.status === "new").length
  const requested = appointments.filter((a) => a.status === "requested").length
  const pendingReviews = data.reviews.filter((r) => r.targetType === "hospital" && r.targetId === hospital.id && !r.providerResponse && r.status === "published").length
  const rating = getRatingSummary(data, "hospital", hospital.id)
  const firstName = currentUser?.name.split(" ")[0]
  const recent = hospitalMonthly.slice(-6)

  return (
    <div className="space-y-6">
      <DashboardHero
        name={firstName}
        context={hospital.name}
        description="Here's what's happening with your hospital profile and patient requests today. All figures are sample data."
        actions={
          <>
            {canEdit && (
              <Button asChild>
                <Link to={`${H}/profile`}>
                  <PenLine /> Edit profile
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to={`/hospital/${hospital.slug}`}>
                <ExternalLink /> View public profile
              </Link>
            </Button>
          </>
        }
        highlights={[
          { label: "Verification", value: VERIFICATION_LABELS[hospital.verification.status] },
          { label: "Profile", value: `${hospital.profileCompleteness}%` },
          { label: "Rating", value: rating.count ? `${rating.average.toFixed(1)} ★` : "—" },
        ]}
      />

      <PendingChangesNotice requests={pendingChanges} verified={hospital.verification.status === "verified"} />

      <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Profile views"
          value={formatCompact(hospital.profileViews)}
          icon={Eye}
          delta={lastDelta(hospitalMonthly.map((m) => m.profileViews))}
          trend={recent.map((m) => m.profileViews)}
          hint="vs last month"
          href={`${H}/analytics`}
        />
        <StatCard
          label="New enquiries"
          value={formatNumber(newEnquiries)}
          icon={MessageSquare}
          tone="info"
          delta={lastDelta(hospitalMonthly.map((m) => m.enquiries))}
          trend={recent.map((m) => m.enquiries)}
          hint="Awaiting first response"
          href={`${H}/enquiries`}
        />
        <StatCard
          label="Pending appointments"
          value={formatNumber(requested)}
          icon={CalendarClock}
          tone="highlight"
          delta={lastDelta(hospitalMonthly.map((m) => m.appointments))}
          trend={recent.map((m) => m.appointments)}
          hint="Requests to confirm"
          href={`${H}/appointments`}
        />
        <StatCard
          label="Active doctors"
          value={formatNumber(activeDoctors)}
          icon={Stethoscope}
          tone="success"
          hint={pendingDoctors ? `${pendingDoctors} pending affiliation${pendingDoctors === 1 ? "" : "s"}` : "Affiliated with your hospital"}
          href={`${H}/doctors`}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <MonthlyTrendChart
            data={hospitalMonthly}
            series={[
              { key: "enquiries", label: "Enquiries", colorIndex: 1 },
              { key: "appointments", label: "Appointments", colorIndex: 3 },
            ]}
            title="Enquiries & appointments"
            description="Monthly totals (sample data)"
            summary={`In the last 6 months the hospital received ${formatNumber(recent.reduce((s, m) => s + m.enquiries, 0))} enquiries and ${formatNumber(recent.reduce((s, m) => s + m.appointments, 0))} appointment requests (illustrative figures).`}
          />
        </div>
        <TaskListCard
          items={[
            { label: "Reply to new enquiries", description: "First response pending", count: newEnquiries, href: `${H}/enquiries`, icon: MessageSquare },
            { label: "Confirm appointment requests", description: "Accept, reschedule or decline", count: requested, href: `${H}/appointments`, icon: CalendarClock },
            { label: "Review doctor affiliations", description: "Pending affiliation requests", count: pendingDoctors, href: `${H}/doctors`, icon: Stethoscope },
            { label: "Respond to reviews", description: "Published reviews without a reply", count: pendingReviews, href: `${H}/reviews`, icon: Star },
            { label: "Profile changes in review", description: "Awaiting platform review", count: pendingChanges.length, href: `${H}/profile`, icon: FilePen },
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingAppointmentsCard
          appointments={appointments}
          href={`${H}/appointments`}
          describe={(a) => data.doctors.find((d) => d.id === a.doctorId)?.name ?? "Any available doctor"}
        />
        <RecentEnquiriesCard enquiries={enquiries} href={`${H}/enquiries`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <ProfileCompletenessCard items={getHospitalCompleteness(data, hospital)} />
        <VerificationChecklistCard
          entityType="hospital"
          verification={hospital.verification}
          steps={getHospitalVerificationSteps(hospital)}
          latestCase={latestCase}
          canEdit={canEdit}
          onSubmit={submitForVerification}
        />
        <Card className="lg:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-primary" aria-hidden="true" /> Recent activity
            </CardTitle>
            <CardDescription>Changes, lead updates and platform actions</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityTimeline events={getProviderActivity(data, "hospital", hospital.id).slice(0, 6)} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
