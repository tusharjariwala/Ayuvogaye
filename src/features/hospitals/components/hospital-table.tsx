import { GitCompareArrows } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RatingStars, SponsoredBadge } from "@/components/shared/trust-badges"
import { VerificationBadge } from "@/components/shared/verification-badge"
import { isSponsored, type RatingSummary } from "@/data/selectors"
import { useCompare } from "@/hooks/use-compare"
import { useDemoStore } from "@/hooks/use-demo-store"
import { formatDate } from "@/lib/formatters"
import type { Hospital } from "@/types"

interface HospitalTableProps {
  hospitals: Hospital[]
  ratings: Map<string, RatingSummary>
}

/** Compact table view of the hospital directory. */
export function HospitalTable({ hospitals, ratings }: HospitalTableProps) {
  const { data } = useDemoStore()
  const { toggle, isComparing } = useCompare()
  return (
    <div className="rounded-xl border bg-card shadow-soft">
      <Table>
        <TableCaption className="sr-only">Hospitals matching your filters</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-56 pl-5">Hospital</TableHead>
            <TableHead>City</TableHead>
            <TableHead className="text-right">Specialties</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead>Last verified</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="pr-5 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hospitals.map((h) => {
            const rating = ratings.get(h.id)
            const comparing = isComparing(h.id)
            return (
              <TableRow key={h.id}>
                <TableCell className="pl-5">
                  <Link to={`/hospital/${h.slug}`} className="font-medium hover:text-primary hover:underline">
                    {h.name}
                  </Link>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    {h.type}
                    {isSponsored(data, "hospital", h.id) && <SponsoredBadge />}
                  </div>
                </TableCell>
                <TableCell>{h.city}</TableCell>
                <TableCell className="text-right tabular-nums">{h.specialtyIds.length}</TableCell>
                <TableCell>
                  <VerificationBadge status={h.verification.status} lastVerifiedAt={h.verification.lastVerifiedAt} />
                </TableCell>
                <TableCell className="whitespace-nowrap">{h.verification.lastVerifiedAt ? formatDate(h.verification.lastVerifiedAt) : "—"}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <RatingStars value={rating?.average ?? 0} count={rating?.count ?? 0} />
                </TableCell>
                <TableCell className="pr-5">
                  <div className="flex justify-end gap-1.5">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/hospital/${h.slug}`} aria-label={`View ${h.name}`}>
                        View
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant={comparing ? "secondary" : "ghost"}
                      aria-pressed={comparing}
                      aria-label={comparing ? `Remove ${h.name} from comparison` : `Add ${h.name} to comparison`}
                      onClick={() => toggle(h.id, h.name)}
                    >
                      <GitCompareArrows />
                      {comparing ? "Comparing" : "Compare"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
