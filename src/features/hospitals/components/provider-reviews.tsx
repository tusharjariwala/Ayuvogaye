import { useMemo } from "react"
import { SampleBadge } from "@/components/shared/trust-badges"
import { getReviewsFor } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { ReviewCard, ReviewForm, ReviewSummary } from "@/features/reviews/components/review-components"
import type { ProviderType } from "@/types"
import { DetailSection } from "./detail-section"

interface ProviderReviewsProps {
  targetType: ProviderType
  targetId: string
  targetName: string
  id?: string
}

/** Published reviews summary, list and submission form for a provider. */
export function ProviderReviews({ targetType, targetId, targetName, id = "reviews" }: ProviderReviewsProps) {
  const { data } = useDemoStore()
  const reviews = useMemo(
    () => getReviewsFor(data, targetType, targetId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [data, targetType, targetId],
  )
  return (
    <DetailSection
      id={id}
      title="Patient reviews"
      description="Only published reviews are shown. Ratings describe individual experiences, not clinical outcomes."
      action={<SampleBadge label="Sample reviews" />}
    >
      <ReviewSummary reviews={reviews} />
      {reviews.length > 0 && (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id}>
              <ReviewCard review={r} />
            </li>
          ))}
        </ul>
      )}
      <div className="space-y-3 border-t pt-4">
        <h3 className="font-semibold">Share your experience</h3>
        <ReviewForm targetType={targetType} targetId={targetId} targetName={targetName} />
      </div>
    </DetailSection>
  )
}
