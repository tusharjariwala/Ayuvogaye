import { BadgeCheck, CircleHelp, Clock, FileClock, ShieldAlert, ShieldOff, ShieldQuestion, type LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { VERIFICATION_DESCRIPTIONS, VERIFICATION_LABELS } from "@/lib/constants"
import { formatDate } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { VerificationStatus } from "@/types"

const CONFIG: Record<VerificationStatus, { icon: LucideIcon; variant: "success" | "warning" | "info" | "danger" | "muted" }> = {
  verified: { icon: BadgeCheck, variant: "success" },
  under_review: { icon: Clock, variant: "warning" },
  submitted: { icon: FileClock, variant: "info" },
  unverified: { icon: ShieldQuestion, variant: "muted" },
  rejected: { icon: ShieldOff, variant: "danger" },
  expired: { icon: ShieldAlert, variant: "warning" },
}

export const VERIFICATION_ORDER: VerificationStatus[] = [
  "unverified",
  "submitted",
  "under_review",
  "verified",
  "rejected",
  "expired",
]

interface VerificationBadgeProps {
  status: VerificationStatus
  lastVerifiedAt?: string
  className?: string
  /** Show a tooltip with the meaning of the status (default true). */
  withTooltip?: boolean
}

export function VerificationBadge({ status, lastVerifiedAt, className, withTooltip = true }: VerificationBadgeProps) {
  const { icon: Icon, variant } = CONFIG[status]
  const badge = (
    <Badge variant={variant} className={cn("gap-1", className)} tabIndex={withTooltip ? 0 : undefined}>
      <Icon aria-hidden="true" />
      {VERIFICATION_LABELS[status]}
    </Badge>
  )
  if (!withTooltip) return badge
  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent className="max-w-xs text-pretty">
        {VERIFICATION_DESCRIPTIONS[status]}
        {status === "verified" && lastVerifiedAt && <> Last verified {formatDate(lastVerifiedAt)}.</>}
      </TooltipContent>
    </Tooltip>
  )
}

/** Dialog that explains every verification state. */
export function VerificationExplainer({ trigger }: { trigger?: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="link" size="sm" className="h-auto px-0">
            <CircleHelp /> What does verification mean?
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>How verification works</DialogTitle>
          <DialogDescription>
            Verification confirms selected profile details against evidence the provider submits. It is not a
            ranking, endorsement or assessment of medical quality. Sponsored placement never affects verification.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3">
          {VERIFICATION_ORDER.map((s) => (
            <li key={s} className="flex flex-col gap-1.5 rounded-lg border p-3">
              <VerificationBadge status={s} withTooltip={false} />
              <p className="text-sm text-muted-foreground">{VERIFICATION_DESCRIPTIONS[s]}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          In this demo template, verification states are fictional and simulated locally.
        </p>
      </DialogContent>
    </Dialog>
  )
}
