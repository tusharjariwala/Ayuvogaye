import { ChevronDown, Code2, ShieldAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatDate } from "@/lib/formatters"
import type { EditorialStatus, SeoMeta } from "@/types"

interface EditorialStatusProps {
  status: EditorialStatus
  reviewedBy?: string
  reviewedAt?: string
}

/** Editorial workflow status with reviewer and date. */
export function EditorialStatusLine({ status, reviewedBy, reviewedAt }: EditorialStatusProps) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <span>Editorial status</span>
      <StatusBadge kind="generic" status={status} />
      {reviewedBy && <span>Reviewed by {reviewedBy}</span>}
      {reviewedAt && (
        <span>
          · <time dateTime={reviewedAt}>{formatDate(reviewedAt)}</time>
        </span>
      )}
    </p>
  )
}

/** Standard medical-information disclaimer for editorial content. */
export function MedicalDisclaimer() {
  return (
    <Alert className="border-warning-text/30 bg-warning-soft">
      <ShieldAlert aria-hidden="true" className="text-warning-text" />
      <AlertTitle className="text-warning-text">General information, not medical advice</AlertTitle>
      <AlertDescription>
        This page is written for general understanding only. It does not diagnose, recommend or replace professional care.
        Always consult a qualified doctor about your own situation. In an emergency, call 112.
      </AlertDescription>
    </Alert>
  )
}

/** Collapsible preview of the mock SEO metadata for a content page. */
export function SeoPanel({ seo }: { seo: SeoMeta }) {
  return (
    <Collapsible className="rounded-xl border border-dashed bg-card/50">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="group w-full justify-between rounded-xl px-5 py-6">
          <span className="inline-flex items-center gap-2">
            <Code2 aria-hidden="true" /> SEO metadata (mock)
          </span>
          <ChevronDown className="transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 px-5 pb-5 text-sm">
        <dl className="space-y-3">
          <div>
            <dt className="text-xs text-muted-foreground">Title</dt>
            <dd className="font-medium">{seo.title}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Description</dt>
            <dd>{seo.description}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Keywords</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {seo.keywords.map((k) => (
                <Badge key={k} variant="outline">
                  {k}
                </Badge>
              ))}
            </dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground">Shown for template demonstration. A real deployment would render these as meta tags.</p>
      </CollapsibleContent>
    </Collapsible>
  )
}
