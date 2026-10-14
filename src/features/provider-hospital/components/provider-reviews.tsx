import { Info, Star } from "lucide-react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/shared/states"
import { ReviewCard, ReviewSummary } from "@/features/reviews/components/review-components"
import { REVIEW_STATUS_LABELS } from "@/lib/constants"
import type { Review, ReviewStatus } from "@/types"

type Filter = "all" | ReviewStatus
const FILTERS: Filter[] = ["all", "published", "pending", "hidden", "rejected"]

/** Provider-portal review list: every status, but only published reviews are public. */
export function ProviderReviews({ reviews }: { reviews: Review[] }) {
  const [filter, setFilter] = useState<Filter>("all")
  const published = reviews.filter((r) => r.status === "published")
  const shown = [...reviews]
    .filter((r) => filter === "all" || r.status === filter)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const count = (f: Filter) => (f === "all" ? reviews.length : reviews.filter((r) => r.status === f).length)

  return (
    <div className="space-y-6">
      <div role="note" className="flex items-start gap-3 rounded-xl border bg-info-soft p-4 text-sm text-info-text">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          Only <span className="font-medium">published</span> reviews appear on your public profile. Pending reviews are awaiting platform moderation;
          hidden or rejected reviews are not shown publicly. All reviews here are fictional sample content.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Public rating summary</CardTitle>
          <CardDescription>Based on {published.length} published sample reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <ReviewSummary reviews={published} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <div className="overflow-x-auto pb-1">
            <TabsList aria-label="Filter reviews by status">
              {FILTERS.map((f) => (
                <TabsTrigger key={f} value={f}>
                  {f === "all" ? "All" : REVIEW_STATUS_LABELS[f]} <span className="ml-1 text-xs text-muted-foreground tabular-nums">{count(f)}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
        {shown.length === 0 ? (
          <EmptyState icon={Star} title="No reviews in this view" description="Reviews submitted by patients will appear here after they are received." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {shown.map((r) => (
              <ReviewCard key={r.id} review={r} canRespond showStatus hideReport />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
