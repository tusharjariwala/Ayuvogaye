import { Check, ExternalLink, FileText, Pencil, X } from "lucide-react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ActivityTimeline } from "@/components/shared/activity-timeline"
import { ConfirmDialog, DetailList, DetailsSheet } from "@/components/shared/overlays"
import { StatusBadge } from "@/components/shared/status-badge"
import { SponsoredBadge } from "@/components/shared/trust-badges"
import { VerificationBadge } from "@/components/shared/verification-badge"
import { getSpecialty, isSponsored } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { formatDate, formatDateTime } from "@/lib/formatters"
import type { ProviderType, VerificationCase } from "@/types"
import { useProviderActions } from "../hooks/use-provider-actions"
import { VERIFICATION_DECISIONS, availableDecisions, type VerificationDecision } from "../hooks/use-verification-actions"
import { PROVIDER_LABEL, getCasesFor, getProvider, providerPublicPath } from "../lib/admin-helpers"

interface ProviderDetailsSheetProps {
  type: ProviderType
  providerId: string | null
  onOpenChange: (open: boolean) => void
  onDecision: (decision: VerificationDecision) => void
  onEdit: () => void
}

export function ProviderDetailsSheet({ type, providerId, onOpenChange, onDecision, onEdit }: ProviderDetailsSheetProps) {
  const { data } = useDemoStore()
  const { decideChangeRequest } = useProviderActions()
  const provider = providerId ? getProvider(data, type, providerId) : undefined
  const cases = providerId ? getCasesFor(data, type, providerId) : []
  const current = cases[0]
  const changes = providerId
    ? data.changeRequests.filter((c) => c.entityType === type && c.entityId === providerId && c.status === "pending")
    : []
  const publicPath = providerId ? providerPublicPath(data, type, providerId) : undefined

  const specific =
    provider && "beds" in provider
      ? [
          { label: "Hospital type", value: provider.type },
          { label: "Email", value: provider.email },
          { label: "Phone", value: provider.phone },
          { label: "Beds", value: provider.beds || "—" },
          { label: "Address", value: `${provider.address}, ${provider.city} ${provider.pincode}` },
        ]
      : provider
        ? [
            { label: "Specialty", value: getSpecialty(data, provider.specialtyId)?.name ?? "—" },
            { label: "Experience", value: `${provider.experienceYears} years` },
            { label: "Registration", value: `${provider.registration.council} · ${provider.registration.placeholderRef}` },
          ]
        : []

  return (
    <DetailsSheet
      open={!!provider}
      onOpenChange={onOpenChange}
      title={provider?.name ?? ""}
      description={`${PROVIDER_LABEL[type]} listing · fictional demo record`}
      footer={
        provider && (
          <>
            {publicPath && (
              <Button variant="ghost" asChild>
                <Link to={publicPath} target="_blank" rel="noreferrer">
                  <ExternalLink /> Public profile
                </Link>
              </Button>
            )}
            <Button variant="outline" onClick={onEdit}>
              <Pencil /> Edit
            </Button>
            {availableDecisions(provider.verification.status).map((d) => (
              <Button
                key={d}
                variant={d === "approve" ? "default" : d === "reject" ? "destructive" : "outline"}
                onClick={() => onDecision(d)}
              >
                {VERIFICATION_DECISIONS[d].verb}
              </Button>
            ))}
          </>
        )
      }
    >
      {provider && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <VerificationBadge status={provider.verification.status} lastVerifiedAt={provider.verification.lastVerifiedAt} />
            <StatusBadge status={provider.status} />
            {isSponsored(data, type, provider.id) && <SponsoredBadge />}
            <Badge variant={provider.claimed ? "secondary" : "outline"}>{provider.claimed ? "Claimed" : "Unclaimed"}</Badge>
          </div>
          <DetailList
            items={[
              { label: "City", value: `${provider.city}, ${provider.state}` },
              ...specific,
              {
                label: "Profile completeness",
                value: (
                  <span className="flex items-center gap-2">
                    <Progress value={provider.profileCompleteness} className="max-w-40" aria-label={`Profile ${provider.profileCompleteness}% complete`} />
                    <span className="tabular-nums">{provider.profileCompleteness}%</span>
                  </span>
                ),
              },
              { label: "Created", value: formatDate(provider.createdAt) },
              { label: "Last updated", value: formatDateTime(provider.updatedAt) },
            ]}
          />

          <section aria-labelledby="pv-verification" className="space-y-3">
            <h3 id="pv-verification" className="font-semibold">
              Verification
            </h3>
            <DetailList
              items={[
                { label: "Reviewer", value: provider.verification.reviewedBy ?? current?.reviewer ?? "Not assigned" },
                { label: "Last verified", value: provider.verification.lastVerifiedAt ? formatDateTime(provider.verification.lastVerifiedAt) : "Never" },
                { label: "Last reviewed", value: current?.reviewedAt ? formatDateTime(current.reviewedAt) : "—" },
                { label: "Note", value: provider.verification.note ?? "—" },
              ]}
            />
            <EvidenceList evidence={current?.evidence ?? []} />
          </section>

          <section aria-labelledby="pv-changes" className="space-y-3">
            <h3 id="pv-changes" className="font-semibold">
              Pending change requests
            </h3>
            {changes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending change requests.</p>
            ) : (
              <ul className="space-y-2">
                {changes.map((cr) => (
                  <li key={cr.id} className="space-y-2 rounded-lg border p-3">
                    <p className="text-sm font-medium">{cr.summary}</p>
                    <p className="text-xs text-muted-foreground">
                      Fields: {cr.fields.join(", ")} · by {cr.submittedBy} · {formatDate(cr.submittedAt)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <ConfirmDialog
                        title="Approve change request?"
                        description={`“${cr.summary}” will be marked approved. Profile fields are not modified in this demo.`}
                        confirmLabel="Approve"
                        onConfirm={() => decideChangeRequest(cr, "approved")}
                        trigger={
                          <Button size="sm" variant="outline">
                            <Check /> Approve
                          </Button>
                        }
                      />
                      <ConfirmDialog
                        title="Reject change request?"
                        description={`“${cr.summary}” will be marked rejected and the provider notified (simulated).`}
                        confirmLabel="Reject"
                        destructive
                        onConfirm={() => decideChangeRequest(cr, "rejected")}
                        trigger={
                          <Button size="sm" variant="ghost">
                            <X /> Reject
                          </Button>
                        }
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="pv-history" className="space-y-3">
            <h3 id="pv-history" className="font-semibold">
              Verification history
            </h3>
            <ActivityTimeline events={cases.flatMap((c) => c.history)} emptyText="No verification case on file yet." />
          </section>
        </div>
      )}
    </DetailsSheet>
  )
}

/** Evidence placeholders — no documents are ever stored in this template. */
export function EvidenceList({ evidence }: { evidence: VerificationCase["evidence"] }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Evidence</p>
      {evidence.length === 0 ? (
        <p className="text-sm text-muted-foreground">No evidence references on file.</p>
      ) : (
        <ul className="space-y-1.5">
          {evidence.map((e) => (
            <li key={e.id} className="flex items-start gap-2 rounded-md border border-dashed bg-muted/40 px-3 py-2 text-sm">
              <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block font-medium">{e.label}</span>
                <span className="block font-mono text-xs break-all text-muted-foreground">{e.reference}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">Placeholder — no documents stored. References are fictional.</p>
    </div>
  )
}
