import { PageHeader } from "@/components/shared/page-header"
import { AppointmentsTable } from "@/features/appointments/components/appointments-table"
import { AppointmentStats } from "@/features/provider-hospital/components/lead-stats"
import { MissingProviderState } from "@/features/provider-hospital/components/portal-widgets"
import { useManagedDoctor } from "../use-managed-doctor"

export default function AppointmentsPage() {
  const { doctor, data } = useManagedDoctor()
  if (!doctor) return <MissingProviderState kind="doctor" />
  const appointments = data.appointments.filter((a) => a.doctorId === doctor.id)
  return (
    <div className="space-y-6">
      <PageHeader title="Appointments" description="Appointment requests addressed to you. Confirming or rescheduling is a demo action — no real booking is made." />
      <AppointmentStats appointments={appointments} />
      <AppointmentsTable appointments={appointments} perspective="doctor" />
    </div>
  )
}
