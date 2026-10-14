import { useCallback } from "react"
import { toast } from "sonner"
import { getReviewTargetName } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { REVIEW_STATUS_LABELS } from "@/lib/constants"
import type { Review, ReviewStatus } from "@/types"
import { useProviderNotify } from "./use-provider-notify"

const AUDIT_ACTION: Record<ReviewStatus, string> = {
  pending: "review.returned_to_pending",
  published: "review.published",
  hidden: "review.hidden",
  rejected: "review.rejected",
}

/** Review moderation (local only): status change + audit + provider notification + toast. */
export function useReviewModeration() {
  const { data, update, logAudit } = useDemoStore()
  const notifyProvider = useProviderNotify()

  const setReviewStatus = useCallback(
    (reviews: Review[], status: ReviewStatus, note?: string) => {
      const changed = reviews.filter((r) => r.status !== status)
      if (changed.length === 0) return
      for (const r of changed) {
        const target = getReviewTargetName(data, r)
        update("reviews", r.id, { status })
        logAudit({
          action: AUDIT_ACTION[status],
          entityType: "review",
          entityId: r.id,
          summary: `Review by ${r.patientDisplayName} on ${target} → ${REVIEW_STATUS_LABELS[status]}${note ? ` — ${note}` : ""}.`,
        })
        if (status === "published" || status === "hidden") {
          notifyProvider(r.targetType, r.targetId, {
            type: status === "published" ? "review_submission" : "moderation_alert",
            title: status === "published" ? "New review published" : "A review was hidden",
            message:
              status === "published"
                ? `A sample review by ${r.patientDisplayName} is now visible on ${target}.`
                : `A review by ${r.patientDisplayName} on ${target} was hidden by moderators${note ? `: ${note}` : ""}.`,
            link: r.targetType === "hospital" ? "/provider/hospital/reviews" : "/provider/doctor/reviews",
          })
        }
      }
      toast.success(
        changed.length === 1 ? `Review ${REVIEW_STATUS_LABELS[status].toLowerCase()}` : `${changed.length} reviews ${REVIEW_STATUS_LABELS[status].toLowerCase()}`,
        { description: "Demo moderation — all reviews are fictional sample content." },
      )
    },
    [data, logAudit, notifyProvider, update],
  )

  return { setReviewStatus }
}
