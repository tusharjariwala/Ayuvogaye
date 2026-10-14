import { BarChart3, Building2, CalendarClock, ClipboardCheck, Flag, MessageSquare, Star, Stethoscope, UserPlus, Users } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { EnquiryConversionChart, PatientAcquisitionChart, ProviderDistributionChart } from "@/components/charts/charts"
import { ActivityTimeline } from "@/components/shared/activity-timeline"
import { DashboardHero, TaskListCard } from "@/components/shared/dashboard-hero"
import { StatCard } from "@/components/shared/stat-card"
import { enquiryConversion, userAcquisition } from "@/data/analytics"
import { useDemoStore } from "@/hooks/use-demo-store"
import { lastDelta } from "@/features/provider-hospital/lib/provider-workflow"
import { ROLE_LABELS } from "@/lib/constants"
import { formatNumber } from "@/lib/formatters"
import { StatGrid } from "../components/admin-ui"
import { providerDistribution } from "../lib/admin-helpers"

export default function DashboardPage() {
  const { data, currentUser } = useDemoStore()
  const providers = [...data.hospitals, ...data.doctors]
  const pendingVerifications = data.verificationCases.filter((c) => c.status === "submitted" || c.status === "under_review").length
  const openReports = data.reportedContent.filter((r) => r.status === "open").length
  const pendingReviews = data.reviews.filter((r) => r.status === "pending").length
  const pendingChanges = data.changeRequests.filter((c) => c.status === "pending").length
  const invitedUsers = data.users.filter((u) => u.status === "invited").length
  const avgCompleteness = providers.length ? Math.round(providers.reduce((s, p) => s + p.profileCompleteness, 0) / providers.length) : 0
  const claimedPct = providers.length ? Math.round((providers.filter((p) => p.claimed).length / providers.length) * 100) : 0
  const recentAcq = userAcquisition.slice(-6)
  const recentConv = enquiryConversion.slice(-6)

  const recent = [...data.auditLogs]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 7)
    .map((l) => ({
      id: l.id,
      at: l.at,
      label: l.summary,
      actor: `${l.actor} (${l.actorRole === "system" ? "System" : ROLE_LABELS[l.actorRole]})`,
    }))

  return (
    <div className="space-y-6">
      <DashboardHero
        name={currentUser?.name.split(" ")[0]}
        context="Platform admin"
        description="Platform health, trust & safety queues and recent activity across Ayuvoyage. All figures come from local sample data."
        actions={
          <>
            <Button asChild>
              <Link to="/admin/verifications">
                <ClipboardCheck /> Review verifications
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/analytics">
                <BarChart3 /> Analytics
              </Link>
            </Button>
          </>
        }
        highlights={[
          { label: "Open queues", value: pendingVerifications + openReports + pendingReviews },
          { label: "Claimed profiles", value: `${claimedPct}%` },
          { label: "Cities", value: data.cities.length },
        ]}
      />

      <StatGrid>
        <StatCard
          label="Total users"
          value={formatNumber(data.users.length)}
          icon={Users}
          delta={lastDelta(userAcquisition.map((m) => m.patients))}
          trend={recentAcq.map((m) => m.patients)}
          hint={`${data.users.filter((u) => u.role === "patient").length} patients`}
          href="/admin/users"
        />
        <StatCard
          label="Hospitals"
          value={formatNumber(data.hospitals.length)}
          icon={Building2}
          tone="success"
          trend={recentAcq.map((m) => m.providers)}
          hint={`${data.hospitals.filter((h) => h.status === "active").length} active`}
          href="/admin/hospitals"
        />
        <StatCard label="Doctors" value={formatNumber(data.doctors.length)} icon={Stethoscope} tone="info" hint={`${data.doctors.filter((d) => d.status === "active").length} active`} href="/admin/doctors" />
        <StatCard label="Pending verifications" value={pendingVerifications} icon={ClipboardCheck} tone="warning" hint="Submitted + under review" href="/admin/verifications" />
        <StatCard
          label="New enquiries"
          value={data.enquiries.filter((e) => e.status === "new").length}
          icon={MessageSquare}
          tone="info"
          delta={lastDelta(enquiryConversion.map((m) => m.enquiries))}
          trend={recentConv.map((m) => m.enquiries)}
          hint="Awaiting first response"
          href="/admin/enquiries"
        />
        <StatCard
          label="Appointment requests"
          value={data.appointments.filter((a) => a.status === "requested").length}
          icon={CalendarClock}
          tone="highlight"
          trend={recentConv.map((m) => m.converted)}
          hint="Status: requested"
          href="/admin/appointments"
        />
        <StatCard label="Pending reports & reviews" value={openReports + pendingReviews} icon={Flag} tone="warning" hint={`${openReports} reports · ${pendingReviews} reviews`} href="/admin/reported-content" />
        <Card className="gap-0 py-0">
          <CardContent className="flex h-full flex-col justify-between gap-3 p-5">
            <p className="text-sm font-medium text-muted-foreground" id="onboarding-label">
              Provider onboarding
            </p>
            <div className="space-y-2">
              <p className="text-[1.75rem] leading-none font-bold tracking-tight tabular-nums">{avgCompleteness}%</p>
              <Progress value={avgCompleteness} aria-labelledby="onboarding-label" />
              <p className="text-xs text-muted-foreground">Avg. profile completeness · {claimedPct}% claimed</p>
            </div>
          </CardContent>
        </Card>
      </StatGrid>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="min-w-0 space-y-6 xl:col-span-2">
          <PatientAcquisitionChart data={userAcquisition} />
          <div className="grid gap-6 lg:grid-cols-2">
            <EnquiryConversionChart data={enquiryConversion} />
            <ProviderDistributionChart data={providerDistribution(data)} />
          </div>
        </div>

        <div className="space-y-6">
          <TaskListCard
            title="Trust & safety queues"
            items={[
              { label: "Verification queue", description: "Submitted or under review", count: pendingVerifications, href: "/admin/verifications", icon: ClipboardCheck },
              { label: "Reported content", description: "Open reports to triage", count: openReports, href: "/admin/reported-content", icon: Flag },
              { label: "Review moderation", description: "Reviews awaiting a decision", count: pendingReviews, href: "/admin/reviews", icon: Star },
              { label: "Provider change requests", description: "Profile edits awaiting review", count: pendingChanges, href: "/admin/hospitals", icon: Building2 },
              { label: "Invited users", description: "Accounts not yet activated", count: invitedUsers, href: "/admin/users", icon: UserPlus },
            ]}
          />

          <Card>
            <CardHeader>
              <CardTitle>Recent platform activity</CardTitle>
              <CardDescription>Latest audit log entries</CardDescription>
              <CardAction>
                <Button variant="link" size="sm" asChild className="h-auto px-0">
                  <Link to="/admin/audit-logs">View all</Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <ActivityTimeline events={recent} emptyText="No activity recorded yet." />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
