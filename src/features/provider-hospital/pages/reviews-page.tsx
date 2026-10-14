import { PageHeader } from "@/components/shared/page-header"
import { getReviewsFor } from "@/data/selectors"
import { MissingProviderState } from "../components/portal-widgets"
import { ProviderReviews } from "../components/provider-reviews"
import { useManagedHospital } from "../use-managed-hospital"

export default function ReviewsPage() {
  const { hospital, data } = useManagedHospital()
  if (!hospital) return <MissingProviderState kind="hospital" />
  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" description={`Patient reviews of ${hospital.name}. You can post one public response per review.`} />
      <ProviderReviews reviews={getReviewsFor(data, "hospital", hospital.id, { publishedOnly: false })} />
    </div>
  )
}
