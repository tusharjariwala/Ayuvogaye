import { PageHeader } from "@/components/shared/page-header"
import { EnquiriesTable } from "@/features/enquiries/components/enquiries-table"
import { EnquiryStats } from "@/features/provider-hospital/components/lead-stats"
import { MissingProviderState } from "@/features/provider-hospital/components/portal-widgets"
import { useManagedDoctor } from "../use-managed-doctor"

export default function EnquiriesPage() {
  const { doctor, data } = useManagedDoctor()
  if (!doctor) return <MissingProviderState kind="doctor" />
  const enquiries = data.enquiries.filter((e) => e.doctorId === doctor.id)
  return (
    <div className="space-y-6">
      <PageHeader title="Enquiries" description="Questions patients sent to you. Status updates are simulated locally — no messages are sent." />
      <EnquiryStats enquiries={enquiries} />
      <EnquiriesTable enquiries={enquiries} perspective="doctor" />
    </div>
  )
}
