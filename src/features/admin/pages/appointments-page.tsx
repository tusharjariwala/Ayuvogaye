import { CalendarCheck, CalendarClock, CalendarDays, CircleDot } from "lucide-react"
import { AppointmentStatusChart } from "@/components/charts/charts"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { AppointmentsTable } from "@/features/appointments/components/appointments-table"
import { useDemoStore } from "@/hooks/use-demo-store"
import { StatGrid } from "../components/admin-ui"
import { appointmentStatusData } from "../lib/admin-helpers"

export default function AppointmentsPage() {
  const { data } = useDemoStore()
  const appointments = data.appointments
  const count = (s: string) => appointments.filter((a) => a.status === s).length
  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Platform-wide monitoring of appointment requests. These are simulated requests — no real bookings exist."
      />
      <StatGrid>
        <StatCard label="Total requests" value={appointments.length} icon={CalendarDays} />
        <StatCard label="Requested" value={count("requested")} icon={CircleDot} hint="Awaiting provider response" />
        <StatCard label="Confirmed" value={count("confirmed")} icon={CalendarCheck} />
        <StatCard label="Rescheduled" value={count("rescheduled")} icon={CalendarClock} hint={`${count("cancelled")} cancelled`} />
      </StatGrid>
      <AppointmentStatusChart data={appointmentStatusData(appointments)} />
      <AppointmentsTable appointments={appointments} perspective="admin" />
    </div>
  )
}
