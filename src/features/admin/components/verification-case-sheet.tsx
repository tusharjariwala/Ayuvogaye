import { ExternalLink } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ActivityTimeline } from "@/components/shared/activity-timeline"
import { DetailList, DetailsSheet } from "@/components/shared/overlays"
import { StatusBadge } from "@/components/shared/status-badge"
import { VerificationBadge } from "@/components/shared/verification-badge"
import { getSpecialty } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { formatDateTime } from "@/lib/formatters"
import { VERIFICATION_DECISIONS, availableDecisions, useVerificationActions, type VerificationDecision } from "../hooks/use-verification-actions"
import { PROVIDER_LABEL, getProvider, providerPublicPath } from "../lib/admin-helpers"
import { EvidenceList } from "./provider-details-sheet"

interface VerificationCaseSheetProps {
  caseId: string | null
  onOpenChange: (open: boolean) => void
  onDecision: (decision: VerificationDecision) => void
}

export function VerificationCaseSheet({ caseId, onOpenChange, onDecision }: VerificationCaseSheetProps) {
  const { data } = useDemoStore()
  const { toggleChecklistItem } = useVerificationActions()
  const vc = caseId ? data.verificationCases.find((c) => c.id === caseId) : undefined
  const provider = vc ? getProvider(data, vc.entityType, vc.entityId) : undefined
  const publicPath = vc ? providerPublicPath(data, vc.entityType, vc.entityId) : undefined
  const done = vc ? vc.checklist.filter((i) => i.done).length : 0

  return (
    <DetailsSheet
      open={!!vc}
      onOpenChange={onOpenChange}
      title={vc ? `Verification · ${vc.entityName}` : ""}
      description={vc ? `${PROVIDER_LABEL[vc.entityType]} case ${vc.id} · simulated review, no documents stored` : undefined}
      footer={
        vc &&
        provider &&
        availableDecisions(vc.status).map((d) => (
          <Button key={d} variant={d === "approve" ? "default" : d === "reject" ? "destructive" : "outline"} onClick={() => onDecision(d)}>
            {VERIFICATION_DECISIONS[d].verb}
          </Button>
        ))
      }
    >
      {vc && (
        <div className="space-y-6">
          <section aria-labelledby="vc-summary" className="space-y-3">
            <h3 id="vc-summary" className="font-semibold">
              Entity summary
            </h3>
            {provider ? (
              <DetailList
                items={[
                  { label: "Name", value: provider.name },
                  { label: "Type", value: PROVIDER_LABEL[vc.entityType] },
                  {
                    label: vc.entityType === "hospital" ? "Hospital type" : "Specialty",
                    value: "beds" in provider ? provider.type : (getSpecialty(data, provider.specialtyId)?.name ?? "—"),
                  },
                  { label: "City", value: `${provider.city}, ${provider.state}` },
                  { label: "Listing status", value: <StatusBadge status={provider.status} /> },
                  { label: "Profile badge", value: <VerificationBadge status={provider.verification.status} lastVerifiedAt={provider.verification.lastVerifiedAt} /> },
                  {
                    label: "Public profile",
                    value: publicPath ? (
                      <Link to={publicPath} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                        Open <ExternalLink className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </Link>
                    ) : (
                      "—"
                    ),
                  },
                ]}
              />
            ) : (
              <p className="text-sm text-muted-foreground">The linked provider no longer exists in the demo data. Decisions are disabled.</p>
            )}
          </section>

          <section aria-labelledby="vc-review" className="space-y-3">
            <h3 id="vc-review" className="font-semibold">
              Review
            </h3>
            <DetailList
              items={[
                { label: "Case status", value: <VerificationBadge status={vc.status} withTooltip={false} /> },
                { label: "Submitted", value: formatDateTime(vc.submittedAt) },
                { label: "Reviewer", value: vc.reviewer ?? "Not assigned" },
                { label: "Reviewed", value: vc.reviewedAt ? formatDateTime(vc.reviewedAt) : "—" },
                { label: "Notes", value: vc.notes ?? "—" },
              ]}
            />
          </section>

          <section aria-labelledby="vc-evidence" className="space-y-3">
            <h3 id="vc-evidence" className="sr-only">
              Evidence
            </h3>
            <EvidenceList evidence={vc.evidence} />
          </section>

          <section aria-labelledby="vc-checklist" className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 id="vc-checklist" className="font-semibold">
                Reviewer checklist
              </h3>
              <span className="text-sm text-muted-foreground tabular-nums">
                {done}/{vc.checklist.length} done
              </span>
            </div>
            <Progress value={vc.checklist.length ? (done / vc.checklist.length) * 100 : 0} aria-label={`${done} of ${vc.checklist.length} checklist items done`} />
            <ul className="space-y-2">
              {vc.checklist.map((item, i) => {
                const id = `vc-check-${vc.id}-${i}`
                return (
                  <li key={item.label} className="flex items-start gap-3 rounded-md border p-2.5">
                    <Checkbox id={id} checked={item.done} onCheckedChange={() => toggleChecklistItem(vc.id, i)} className="mt-0.5" />
                    <label htmlFor={id} className="text-sm leading-snug">
                      {item.label}
                    </label>
                  </li>
                )
              })}
            </ul>
            <p className="text-xs text-muted-foreground">Checklist ticks are local working notes and are not shown to the provider.</p>
          </section>

          <section aria-labelledby="vc-history" className="space-y-3">
            <h3 id="vc-history" className="font-semibold">
              History
            </h3>
            <ActivityTimeline events={vc.history} />
          </section>
        </div>
      )}
    </DetailsSheet>
  )
}
