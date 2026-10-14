import { BadgeCheck, CalendarDays, MessageSquare, Users } from "lucide-react"
import { useMemo, useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AppointmentStatusChart,
  EnquiryConversionChart,
  PatientAcquisitionChart,
  ProviderDistributionChart,
  RevenueChart,
} from "@/components/charts/charts"
import { PageHeader, SectionHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { enquiryConversion, revenueSeries, userAcquisition } from "@/data/analytics"
import { getDoctor, getHospital } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { formatNumber, formatPercent } from "@/lib/formatters"
import { StatGrid } from "../components/admin-ui"
import { VerificationBreakdown } from "../components/verification-breakdown"
import { appointmentStatusData, providerDistribution } from "../lib/admin-helpers"

const ALL = "all"

export default function AnalyticsPage() {
  const { data } = useDemoStore()
  const [city, setCity] = useState(ALL)
  const citySlug = city === ALL ? undefined : city

  const cityOptions = useMemo(
    () => data.cities.filter((c) => data.hospitals.some((h) => h.citySlug === c.slug) || data.doctors.some((d) => d.citySlug === c.slug)),
    [data.cities, data.doctors, data.hospitals],
  )

  const filtered = useMemo(() => {
    const inCity = (slug?: string) => !citySlug || slug === citySlug
    const hospitals = data.hospitals.filter((h) => inCity(h.citySlug))
    const doctors = data.doctors.filter((d) => inCity(d.citySlug))
    const appointments = data.appointments.filter(
      (a) => !citySlug || getHospital(data, a.hospitalId)?.citySlug === citySlug || getDoctor(data, a.doctorId)?.citySlug === citySlug,
    )
    return { hospitals, doctors, appointments }
  }, [citySlug, data])

  const totalEnq = enquiryConversion.reduce((s, r) => s + r.enquiries, 0)
  const totalConv = enquiryConversion.reduce((s, r) => s + r.converted, 0)
  const providers = [...filtered.hospitals, ...filtered.doctors]
  const verified = providers.filter((p) => p.verification.status === "verified").length
  const cityName = cityOptions.find((c) => c.slug === citySlug)?.name

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Platform trends and operational breakdowns. Trend series are illustrative sample data; breakdowns are computed from local demo records."
      />

      <StatGrid>
        <StatCard label="New patients (12 mo)" value={formatNumber(userAcquisition.reduce((s, r) => s + r.patients, 0))} icon={Users} hint="Sample series" />
        <StatCard label="Enquiry conversion (12 mo)" value={formatPercent((totalConv / totalEnq) * 100, 1)} icon={MessageSquare} hint={`${formatNumber(totalConv)} of ${formatNumber(totalEnq)}`} />
        <StatCard label="Appointment requests" value={filtered.appointments.length} icon={CalendarDays} hint={cityName ?? "All cities"} />
        <StatCard
          label="Verified providers"
          value={`${verified}/${providers.length}`}
          icon={BadgeCheck}
          hint={providers.length ? `${formatPercent((verified / providers.length) * 100)} · ${cityName ?? "all cities"}` : "No providers"}
        />
      </StatGrid>

      <section aria-labelledby="trends" className="space-y-4">
        <SectionHeader id="trends" title="Platform trends" description="Monthly sample series. Use the range control on each chart." />
        <div className="grid gap-6 lg:grid-cols-2">
          <PatientAcquisitionChart data={userAcquisition} />
          <EnquiryConversionChart data={enquiryConversion} />
        </div>
        <RevenueChart data={revenueSeries} />
      </section>

      <section aria-labelledby="breakdowns" className="space-y-4">
        <SectionHeader
          id="breakdowns"
          title="Operational breakdowns"
          description="Computed from current demo data and filtered by city."
          action={
            <div className="flex items-center gap-2">
              <Label htmlFor="analytics-city" className="whitespace-nowrap">
                City
              </Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger id="analytics-city" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All cities</SelectItem>
                  {cityOptions.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />
        <p className="sr-only" aria-live="polite">
          Showing breakdowns for {cityName ?? "all cities"}.
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          <AppointmentStatusChart
            data={appointmentStatusData(filtered.appointments)}
            title={cityName ? `Appointments by status · ${cityName}` : undefined}
          />
          <VerificationBreakdown
            providers={providers}
            title={cityName ? `Verification status · ${cityName}` : "Verification status"}
            description={`${filtered.hospitals.length} hospitals and ${filtered.doctors.length} doctors`}
          />
        </div>
        <ProviderDistributionChart data={providerDistribution(data, citySlug)} />
      </section>
    </div>
  )
}
