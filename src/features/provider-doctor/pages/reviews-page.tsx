import { PageHeader } from "@/components/shared/page-header"
import { getReviewsFor } from "@/data/selectors"
import { MissingProviderState } from "@/features/provider-hospital/components/portal-widgets"
import { ProviderReviews } from "@/features/provider-hospital/components/provider-reviews"
import { useManagedDoctor } from "../use-managed-doctor"

export default function ReviewsPage() {
  const { doctor, data } = useManagedDoctor()
  if (!doctor) return <MissingProviderState kind="doctor" />
  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" description="Patient reviews of your profile. You can post one public response per review." />
      <ProviderReviews reviews={getReviewsFor(data, "doctor", doctor.id, { publishedOnly: false })} />
    </div>
  )
}
