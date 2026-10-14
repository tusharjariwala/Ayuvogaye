import { MessageSquareReply, Star } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { EntityFormDialog } from "@/components/shared/overlays"
import { StatusBadge } from "@/components/shared/status-badge"
import { RatingStars, SampleBadge } from "@/components/shared/trust-badges"
import { PersonAvatar } from "@/components/shared/visuals"
import { getReviewTargetName, summarizeReviews } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { REVIEW_DIMENSIONS } from "@/lib/constants"
import { formatDate } from "@/lib/formatters"
import { createId, nowISO } from "@/lib/mock-storage"
import { cn } from "@/lib/utils"
import type { ProviderType, Review, ReviewRatings } from "@/types"
import { ReportDialog } from "./report-dialog"

/** Overall rating plus a bar for each structured review dimension. */
export function ReviewSummary({ reviews, className }: { reviews: Review[]; className?: string }) {
  const summary = summarizeReviews(reviews)
  if (summary.count === 0) {
    return <p className={cn("text-sm text-muted-foreground", className)}>No published reviews yet.</p>
  }
  return (
    <div className={cn("grid gap-6 sm:grid-cols-[auto_1fr]", className)}>
      <div className="flex flex-col items-start gap-1 sm:items-center sm:pr-6 sm:text-center">
        <p className="text-4xl font-semibold tabular-nums">{summary.average.toFixed(1)}</p>
        <RatingStars value={summary.average} showValue={false} size="md" />
        <p className="text-sm text-muted-foreground">{summary.count} sample reviews</p>
      </div>
      <dl className="space-y-2.5">
        {REVIEW_DIMENSIONS.map(({ key, label }) => (
          <div key={key} className="grid grid-cols-[8.5rem_1fr_2.5rem] items-center gap-3 text-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="contents">
              <Progress value={(summary.dimensions[key] / 5) * 100} aria-label={`${label}: ${summary.dimensions[key].toFixed(1)} out of 5`} />
              <span className="text-right font-medium tabular-nums">{summary.dimensions[key].toFixed(1)}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

interface ReviewCardProps {
  review: Review
  showTarget?: boolean
  showStatus?: boolean
  /** Provider portal: allow writing/editing a public response. */
  canRespond?: boolean
  hideReport?: boolean
}

export function ReviewCard({ review, showTarget, showStatus, canRespond, hideReport }: ReviewCardProps) {
  const { data } = useDemoStore()
  const targetName = getReviewTargetName(data, review)
  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap items-start gap-3">
          <PersonAvatar name={review.patientDisplayName} className="size-10" />
          <div className="min-w-0 flex-1">
            <p className="font-medium">{review.patientDisplayName}</p>
            <p className="text-xs text-muted-foreground">
              <time dateTime={review.createdAt}>{formatDate(review.createdAt)}</time>
              {showTarget && (
                <>
                  {" · "}
                  <Link
                    to={review.targetType === "hospital" ? `/hospital/${data.hospitals.find((h) => h.id === review.targetId)?.slug ?? ""}` : `/doctor/${data.doctors.find((d) => d.id === review.targetId)?.slug ?? ""}`}
                    className="hover:text-primary hover:underline"
                  >
                    {targetName}
                  </Link>
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {showStatus && <StatusBadge kind="review" status={review.status} />}
            {review.isSample && <SampleBadge label="Sample review" />}
          </div>
        </div>
        <RatingStars value={review.ratings.overall} />
        <p className="text-sm leading-relaxed">{review.text}</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Rating breakdown">
          {REVIEW_DIMENSIONS.filter((d) => d.key !== "overall").map((d) => (
            <li key={d.key}>
              {d.label}: <span className="font-medium text-foreground">{review.ratings[d.key]}/5</span>
            </li>
          ))}
        </ul>
        {review.providerResponse && (
          <div className="rounded-lg border-l-4 border-primary bg-muted/50 p-3 text-sm">
            <p className="mb-1 font-medium">
              Response from {review.providerResponse.by}
              <span className="ml-2 text-xs font-normal text-muted-foreground">{formatDate(review.providerResponse.at)}</span>
            </p>
            <p className="text-muted-foreground">{review.providerResponse.text}</p>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-end gap-2">
          {canRespond && <ReviewResponseDialog review={review} />}
          {!hideReport && <ReportDialog entityType="review" entityId={review.id} entityName={`review by ${review.patientDisplayName}`} />}
        </div>
      </CardContent>
    </Card>
  )
}

/** Provider response editor (stored locally, shown publicly once the review is published). */
export function ReviewResponseDialog({ review }: { review: Review }) {
  const { update, logAudit, currentUser, data } = useDemoStore()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(review.providerResponse?.text ?? "")
  const by = currentUser?.hospitalId
    ? (data.hospitals.find((h) => h.id === currentUser.hospitalId)?.name ?? currentUser.name)
    : (currentUser?.name ?? "Provider")
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <MessageSquareReply /> {review.providerResponse ? "Edit response" : "Respond"}
      </Button>
      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Respond to review"
        description="Responses are public. Be courteous and never disclose patient health information."
        submitLabel="Publish response"
        onSubmit={() => {
          if (text.trim().length < 10) {
            toast.error("Response must be at least 10 characters")
            return false
          }
          update("reviews", review.id, { providerResponse: { text: text.trim(), at: nowISO(), by } })
          logAudit({ action: "review.responded", entityType: "review", entityId: review.id, summary: `Provider response by ${by}` })
          toast.success("Response saved", { description: "Visible on the public profile (demo)." })
        }}
      >
        <div className="space-y-2">
          <Label htmlFor={`resp-${review.id}`}>Your response</Label>
          <Textarea id={`resp-${review.id}`} rows={4} maxLength={600} value={text} onChange={(e) => setText(e.target.value)} />
          <p className="text-right text-xs text-muted-foreground">{text.length}/600</p>
        </div>
      </EntityFormDialog>
    </>
  )
}

function StarInput({ label, value, onChange, name }: { label: string; value: number; onChange: (v: number) => void; name: string }) {
  return (
    <fieldset className="flex flex-wrap items-center justify-between gap-2">
      <legend className="sr-only">{label}</legend>
      <span className="text-sm" aria-hidden="true">
        {label}
      </span>
      <div className="flex" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer rounded p-0.5 focus-within:ring-2 focus-within:ring-ring">
            <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} className="sr-only" aria-label={`${n} star${n > 1 ? "s" : ""}`} />
            <Star className={cn("size-6", n <= value ? "fill-highlight text-highlight" : "text-muted-foreground/40")} aria-hidden="true" />
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/** Structured review submission — only for signed-in demo patients. Goes to moderation. */
export function ReviewForm({ targetType, targetId, targetName }: { targetType: ProviderType; targetId: string; targetName: string }) {
  const { currentUser, create, logAudit, notify, settings } = useDemoStore()
  const [ratings, setRatings] = useState<ReviewRatings>({ communication: 0, waitingTime: 0, staff: 0, cleanliness: 0, explanation: 0, overall: 0 })
  const [text, setText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (!currentUser || currentUser.role !== "patient") {
    return (
      <div className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
        <p className="mb-3">Only signed-in patients can submit reviews in this demo.</p>
        <Button asChild variant="outline">
          <Link to="/account/login">Sign in with a demo patient account</Link>
        </Button>
      </div>
    )
  }

  const complete = Object.values(ratings).every((v) => v > 0) && text.trim().length >= 20

  const submit = async () => {
    if (!complete || submitting) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 500))
    const autoPublish = settings.platform.reviewAutoPublish && !settings.platform.requireReviewModeration
    const review = create("reviews", {
      id: createId("rev"),
      patientDisplayName: `${currentUser.name.split(" ")[0]} ${currentUser.name.split(" ")[1]?.[0] ?? ""}.`.trim(),
      patientId: currentUser.id,
      targetType,
      targetId,
      ratings,
      text: text.trim(),
      createdAt: nowISO(),
      status: autoPublish ? "published" : "pending",
      reportCount: 0,
      isSample: true,
    })
    logAudit({ action: "review.submitted", entityType: "review", entityId: review.id, summary: `Review for ${targetName}` })
    notify({ type: "review_submission", title: "Review awaiting moderation", message: `New review for ${targetName}.`, audience: "platform_admin", link: "/admin/reviews" })
    toast.success("Review submitted", { description: autoPublish ? "Published (demo)." : "It will appear after moderation (simulated)." })
    setRatings({ communication: 0, waitingTime: 0, staff: 0, cleanliness: 0, explanation: 0, overall: 0 })
    setText("")
    setSubmitting(false)
  }

  return (
    <form
      className="space-y-4 rounded-xl border bg-card p-5"
      onSubmit={(e) => {
        e.preventDefault()
        void submit()
      }}
    >
      <div>
        <h3 className="font-semibold">Share your experience</h3>
        <p className="text-sm text-muted-foreground">Rate your visit experience — not medical outcomes. Avoid sharing health details.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-x-8">
        {REVIEW_DIMENSIONS.map((d) => (
          <StarInput key={d.key} name={`rate-${d.key}`} label={d.label} value={ratings[d.key]} onChange={(v) => setRatings((r) => ({ ...r, [d.key]: v }))} />
        ))}
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-text">Your review</Label>
        <Textarea id="review-text" rows={4} maxLength={800} value={text} onChange={(e) => setText(e.target.value)} placeholder="Describe waiting time, staff courtesy, cleanliness, how clearly things were explained… (min. 20 characters)" />
      </div>
      <Button type="submit" disabled={!complete || submitting}>
        {submitting ? "Submitting…" : "Submit for moderation"}
      </Button>
    </form>
  )
}
