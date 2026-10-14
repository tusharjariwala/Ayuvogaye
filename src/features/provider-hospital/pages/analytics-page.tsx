import { CalendarCheck, Eye, MessageSquare, TrendingUp } from "lucide-react"
import { AppointmentStatusChart, MonthlyTrendChart } from "@/components/charts/charts"
import { DemoNotice } from "@/components/shared/demo-notice"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { hospitalMonthly } from "@/data/analytics"
import { APPOINTMENT_STATUS_LABELS } from "@/lib/constants"
import { formatCompact, formatNumber, formatPercent } from "@/lib/formatters"
import type { AppointmentStatus } from "@/types"
import { MissingProviderState } from "../components/portal-widgets"
import { lastDelta } from "../lib/provider-workflow"
import { useManagedHospital } from "../use-managed-hospital"

export default function AnalyticsPage() {
  const { hospital, data } = useManagedHospital()
  if (!hospital) return <MissingProviderState kind="hospital" />

  const appointments = data.appointments.filter((a) => a.hospitalId === hospital.id)
  const enquiries = data.enquiries.filter((e) => e.hospitalId === hospital.id)
  const converted = enquiries.filter((e) => e.status === "converted").length
  const conversion = enquiries.length ? (converted / enquiries.length) * 100 : 0
  const last = hospitalMonthly[hospitalMonthly.length - 1]
  const totals = hospitalMonthly.reduce(
    (s, m) => ({ views: s.views + m.profileViews, enquiries: s.enquiries + m.enquiries, appointments: s.appointments + m.appointments }),
    { views: 0, enquiries: 0, appointments: 0 },
  )
  const statusData = (Object.keys(APPOINTMENT_STATUS_LABELS) as AppointmentStatus[]).map((s) => ({
    status: APPOINTMENT_STATUS_LABELS[s],
    count: appointments.filter((a) => a.status === s).length,
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description={`Listing performance for ${hospital.name}. Use each chart's range control to change the period.`} />
      <DemoNotice>Charts use fictional sample data for demonstration. They are not real patient or traffic figures.</DemoNotice>

      <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Profile views (this month)" value={formatCompact(last?.profileViews ?? 0)} icon={Eye} delta={lastDelta(hospitalMonthly.map((m) => m.profileViews))} hint={`${formatCompact(totals.views)} in 12 months`} />
        <StatCard label="Enquiries (this month)" value={formatNumber(last?.enquiries ?? 0)} icon={MessageSquare} delta={lastDelta(hospitalMonthly.map((m) => m.enquiries))} hint={`${formatNumber(totals.enquiries)} in 12 months`} />
        <StatCard label="Appointments (this month)" value={formatNumber(last?.appointments ?? 0)} icon={CalendarCheck} delta={lastDelta(hospitalMonthly.map((m) => m.appointments))} hint={`${formatNumber(totals.appointments)} in 12 months`} />
        <StatCard label="Enquiry conversion" value={formatPercent(conversion, 1)} icon={TrendingUp} hint={`${converted} of ${enquiries.length} enquiries in demo records`} />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <MonthlyTrendChart
          data={hospitalMonthly}
          variant="line"
          series={[{ key: "profileViews", label: "Profile views", colorIndex: 1 }]}
          title="Profile views"
          description="Monthly public profile views (sample data)"
          summary={`Profile views grew to ${formatNumber(last?.profileViews ?? 0)} last month; ${formatNumber(totals.views)} over 12 months (illustrative).`}
        />
        <MonthlyTrendChart
          data={hospitalMonthly}
          series={[
            { key: "enquiries", label: "Enquiries", colorIndex: 1 },
            { key: "appointments", label: "Appointments", colorIndex: 3 },
          ]}
          title="Enquiries vs appointments"
          description="Monthly lead volume (sample data)"
          summary={`${formatNumber(totals.enquiries)} enquiries and ${formatNumber(totals.appointments)} appointment requests over 12 months (illustrative).`}
        />
      </div>
      <AppointmentStatusChart data={statusData} title="Your appointments by status" />
    </div>
  )
}
