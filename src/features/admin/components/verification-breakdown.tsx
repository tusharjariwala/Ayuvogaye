import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VERIFICATION_ORDER, VerificationBadge } from "@/components/shared/verification-badge"
import { formatPercent } from "@/lib/formatters"
import type { Verification } from "@/types"

/** Accessible bar list of verification states across providers (text + bar, never colour alone). */
export function VerificationBreakdown({
  providers,
  title = "Verification status",
  description,
}: {
  providers: { verification: Verification }[]
  title?: string
  description?: string
}) {
  const total = providers.length
  const rows = VERIFICATION_ORDER.map((status) => ({
    status,
    count: providers.filter((p) => p.verification.status === status).length,
  }))
  const max = Math.max(1, ...rows.map((r) => r.count))
  const verified = rows.find((r) => r.status === "verified")?.count ?? 0
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description ?? `${total} providers in the current selection`}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.status} className="grid grid-cols-[9.5rem_1fr_3.5rem] items-center gap-3 text-sm">
              <VerificationBadge status={r.status} withTooltip={false} className="justify-self-start" />
              <span className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                <span className="block h-full rounded-full bg-primary" style={{ width: `${(r.count / max) * 100}%` }} />
              </span>
              <span className="text-right tabular-nums">
                {r.count}
                <span className="sr-only"> providers</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          {total === 0
            ? "No providers match this filter."
            : `${verified} of ${total} providers (${formatPercent((verified / total) * 100)}) are verified. Verification confirms selected details only — it is not a quality rating.`}
        </p>
      </CardContent>
    </Card>
  )
}
