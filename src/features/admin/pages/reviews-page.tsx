import { CheckCircle2, ChevronLeft, ChevronRight, EyeOff, Flag, RotateCcw, Star, XCircle } from "lucide-react"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FacetFilter, SearchInput } from "@/components/shared/filters"
import { DemoNotice } from "@/components/shared/demo-notice"
import { ConfirmDialog } from "@/components/shared/overlays"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/states"
import { StatCard } from "@/components/shared/stat-card"
import { getReviewTargetName } from "@/data/selectors"
import { ReviewCard } from "@/features/reviews/components/review-components"
import { useDemoStore } from "@/hooks/use-demo-store"
import { REVIEW_STATUS_LABELS } from "@/lib/constants"
import { paginate } from "@/lib/data-access"
import type { Review, ReviewStatus } from "@/types"
import { StatGrid, StatusTabs } from "../components/admin-ui"
import { useReviewModeration } from "../hooks/use-review-moderation"

const TABS: ReviewStatus[] = ["pending", "published", "hidden", "rejected"]
const PAGE_SIZE = 8

interface PendingAction {
  reviews: Review[]
  status: ReviewStatus
  onDone?: () => void
}

const ACTION_COPY: Record<ReviewStatus, { verb: string; description: string }> = {
  published: { verb: "Publish", description: "The review becomes visible on the provider's public profile, labelled as sample content." },
  hidden: { verb: "Hide", description: "The review is removed from public view but kept for audit. It can be restored later." },
  rejected: { verb: "Reject", description: "The review will not be published. Record a reason for the audit log." },
  pending: { verb: "Move to pending", description: "The review returns to the moderation queue." },
}

export default function ReviewsPage() {
  const { data } = useDemoStore()
  const { setReviewStatus } = useReviewModeration()
  const [tab, setTab] = useState<ReviewStatus>("pending")
  const [query, setQuery] = useState("")
  const [targetType, setTargetType] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pending, setPending] = useState<PendingAction | null>(null)

  const reviews = data.reviews
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return reviews
      .filter((r) => r.status === tab)
      .filter((r) => targetType.length === 0 || targetType.includes(r.targetType))
      .filter((r) => !q || `${r.patientDisplayName} ${r.text} ${getReviewTargetName(data, r)}`.toLowerCase().includes(q))
      .sort((a, b) => b.reportCount - a.reportCount || b.createdAt.localeCompare(a.createdAt))
  }, [data, query, reviews, tab, targetType])

  const result = paginate(filtered, page, PAGE_SIZE)
  const selectedReviews = filtered.filter((r) => selected.has(r.id))
  const resetSelection = () => setSelected(new Set())

  const toggle = (id: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const act = (rs: Review[], status: ReviewStatus, onDone?: () => void) => {
    if (status === "published" && rs.length === 1) {
      setReviewStatus(rs, status)
      return
    }
    setPending({ reviews: rs, status, onDone })
  }

  const reported = reviews.filter((r) => r.reportCount > 0).length
  const allOnPageSelected = result.items.length > 0 && result.items.every((r) => selected.has(r.id))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review moderation"
        description="Moderate patient reviews before they appear on provider profiles. Reviews with reports are listed first."
      />

      <StatGrid>
        <StatCard label="Pending moderation" value={reviews.filter((r) => r.status === "pending").length} icon={Star} />
        <StatCard label="Published" value={reviews.filter((r) => r.status === "published").length} icon={CheckCircle2} />
        <StatCard label="Hidden / rejected" value={reviews.filter((r) => r.status === "hidden" || r.status === "rejected").length} icon={EyeOff} />
        <StatCard label="Reviews with reports" value={reported} icon={Flag} hint="Reported at least once" />
      </StatGrid>

      <DemoNotice>All reviews are fictional sample content created for this template. Moderation actions are stored locally.</DemoNotice>

      <StatusTabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as ReviewStatus)
          setPage(1)
          resetSelection()
        }}
        label="Filter reviews by status"
        tabs={TABS.map((s) => ({ value: s, label: REVIEW_STATUS_LABELS[s], count: reviews.filter((r) => r.status === s).length }))}
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <SearchInput
              value={query}
              onChange={(v) => {
                setQuery(v)
                setPage(1)
              }}
              placeholder="Search reviewer, text or provider…"
              className="w-full sm:w-72"
            />
            <FacetFilter
              title="Provider type"
              options={[
                { value: "hospital", label: "Hospitals" },
                { value: "doctor", label: "Doctors" },
              ]}
              selected={targetType}
              onChange={(v) => {
                setTargetType(v)
                setPage(1)
              }}
            />
            <span className="flex-1" />
            {result.items.length > 0 && (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={allOnPageSelected}
                  onCheckedChange={(v) => result.items.forEach((r) => toggle(r.id, !!v))}
                  aria-label="Select all reviews on this page"
                />
                Select page
              </label>
            )}
          </div>

          {selectedReviews.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-accent px-3 py-2 text-sm">
              <span className="font-medium">{selectedReviews.length} selected</span>
              <span className="flex-1" />
              {tab !== "published" && (
                <Button size="sm" onClick={() => setPending({ reviews: selectedReviews, status: "published", onDone: resetSelection })}>
                  <CheckCircle2 /> Publish selected
                </Button>
              )}
              {tab !== "hidden" && (
                <Button size="sm" variant="outline" onClick={() => setPending({ reviews: selectedReviews, status: "hidden", onDone: resetSelection })}>
                  <EyeOff /> Hide selected
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={resetSelection}>
                Clear
              </Button>
            </div>
          )}

          {result.items.length === 0 ? (
            <EmptyState title={`No ${REVIEW_STATUS_LABELS[tab].toLowerCase()} reviews`} description="Try another tab or clear your search." />
          ) : (
            <ul className="grid gap-4 lg:grid-cols-2">
              {result.items.map((r) => (
                <li key={r.id} className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Checkbox
                      checked={selected.has(r.id)}
                      onCheckedChange={(v) => toggle(r.id, !!v)}
                      aria-label={`Select review by ${r.patientDisplayName}`}
                    />
                    <Badge variant="outline" className="capitalize">
                      {r.targetType}
                    </Badge>
                    {r.reportCount > 0 && (
                      <Badge variant="danger">
                        <Flag aria-hidden="true" /> {r.reportCount} {r.reportCount === 1 ? "report" : "reports"}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1">
                    <ReviewCard review={r} showTarget showStatus hideReport />
                  </div>
                  <div className="flex flex-wrap justify-end gap-2" role="group" aria-label={`Moderation actions for review by ${r.patientDisplayName}`}>
                    {r.status !== "published" && r.status !== "rejected" && (
                      <Button size="sm" onClick={() => act([r], "published")}>
                        <CheckCircle2 /> {r.status === "hidden" ? "Restore" : "Publish"}
                      </Button>
                    )}
                    {r.status === "rejected" && (
                      <Button size="sm" variant="outline" onClick={() => act([r], "pending")}>
                        <RotateCcw /> Restore to pending
                      </Button>
                    )}
                    {r.status !== "hidden" && r.status !== "rejected" && (
                      <Button size="sm" variant="outline" onClick={() => act([r], "hidden")}>
                        <EyeOff /> Hide
                      </Button>
                    )}
                    {r.status !== "rejected" && (
                      <Button size="sm" variant="ghost" className="text-destructive-text" onClick={() => act([r], "rejected")}>
                        <XCircle /> Reject
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {result.pageCount > 1 && (
            <nav className="flex items-center justify-between gap-3 text-sm" aria-label="Review pages">
              <p className="text-muted-foreground" aria-live="polite">
                Page {result.page} of {result.pageCount} · {result.total} reviews
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" aria-label="Previous page" disabled={result.page <= 1} onClick={() => setPage(result.page - 1)}>
                  <ChevronLeft />
                </Button>
                <Button variant="outline" size="icon" aria-label="Next page" disabled={result.page >= result.pageCount} onClick={() => setPage(result.page + 1)}>
                  <ChevronRight />
                </Button>
              </div>
            </nav>
          )}
        </div>
      </StatusTabs>

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title={
          pending
            ? `${ACTION_COPY[pending.status].verb} ${pending.reviews.length === 1 ? `review by ${pending.reviews[0].patientDisplayName}` : `${pending.reviews.length} reviews`}?`
            : ""
        }
        description={pending ? ACTION_COPY[pending.status].description : ""}
        confirmLabel={pending ? ACTION_COPY[pending.status].verb : "Confirm"}
        destructive={pending?.status === "rejected" || pending?.status === "hidden"}
        withNote={pending?.status === "rejected" || pending?.status === "hidden"}
        noteLabel="Moderation reason"
        noteRequired={pending?.status === "rejected"}
        onConfirm={(note) => {
          if (pending) {
            setReviewStatus(pending.reviews, pending.status, note)
            pending.onDone?.()
          }
          setPending(null)
        }}
      />
    </div>
  )
}
