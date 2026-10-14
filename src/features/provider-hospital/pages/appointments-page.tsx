import { PageHeader } from "@/components/shared/page-header"
import { AppointmentsTable } from "@/features/appointments/components/appointments-table"
import { AppointmentStats } from "../components/lead-stats"
import { MissingProviderState } from "../components/portal-widgets"
import { useManagedHospital } from "../use-managed-hospital"

export default function AppointmentsPage() {
  const { hospital, data } = useManagedHospital()
  if (!hospital) return <MissingProviderState kind="hospital" />
  const appointments = data.appointments.filter((a) => a.hospitalId === hospital.id)
  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description={`Appointment requests for ${hospital.name}. Confirming or rescheduling is a demo action — no real booking is made.`}
      />
      <AppointmentStats appointments={appointments} />
      <AppointmentsTable appointments={appointments} perspective="hospital" />
    </div>
  )
}
