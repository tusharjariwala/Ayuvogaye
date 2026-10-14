import { PageHeader } from "@/components/shared/page-header"
import { EnquiriesTable } from "@/features/enquiries/components/enquiries-table"
import { EnquiryStats } from "../components/lead-stats"
import { MissingProviderState } from "../components/portal-widgets"
import { useManagedHospital } from "../use-managed-hospital"

export default function EnquiriesPage() {
  const { hospital, data } = useManagedHospital()
  if (!hospital) return <MissingProviderState kind="hospital" />
  const enquiries = data.enquiries.filter((e) => e.hospitalId === hospital.id)
  return (
    <div className="space-y-6">
      <PageHeader
        title="Enquiries"
        description={`Patient enquiries addressed to ${hospital.name}. Status updates are simulated locally — no messages are sent.`}
      />
      <EnquiryStats enquiries={enquiries} />
      <EnquiriesTable enquiries={enquiries} perspective="hospital" />
    </div>
  )
}
