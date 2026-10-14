import { BadgeCheck, FlaskConical, Megaphone, PenLine, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { DataSource } from "@/types"

/** Labels paid placement. Sponsored never implies verification or quality. */
export function SponsoredBadge({ className }: { className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="highlight" className={cn("gap-1", className)} tabIndex={0}>
          <Megaphone aria-hidden="true" />
          Sponsored
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        Paid placement. Sponsorship does not affect verification status or imply medical superiority.
      </TooltipContent>
    </Tooltip>
  )
}

/** Marks fictional content such as seeded reviews. */
export function SampleBadge({ label = "Sample content", className }: { label?: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn("gap-1 border-dashed text-muted-foreground", className)}>
      <FlaskConical aria-hidden="true" />
      {label}
    </Badge>
  )
}

const SOURCE_META: Record<DataSource, { label: string; description: string; icon: typeof BadgeCheck; variant: "success" | "muted" | "info" }> = {
  platform_verified: {
    label: "Platform-verified",
    description: "Checked by the platform against submitted evidence.",
    icon: BadgeCheck,
    variant: "success",
  },
  provider_submitted: {
    label: "Provider-submitted",
    description: "Supplied by the provider and not independently verified.",
    icon: PenLine,
    variant: "muted",
  },
  editorial: {
    label: "Editorial",
    description: "Written by the platform's editorial team for general information.",
    icon: PenLine,
    variant: "info",
  },
}

export function SourceBadge({ source, className }: { source: DataSource; className?: string }) {
  const meta = SOURCE_META[source]
  const Icon = meta.icon
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={meta.variant} className={cn("gap-1", className)} tabIndex={0}>
          <Icon aria-hidden="true" />
          {meta.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{meta.description}</TooltipContent>
    </Tooltip>
  )
}

interface RatingProps {
  value: number
  count?: number
  className?: string
  size?: "sm" | "md"
  showValue?: boolean
}

/** Star rating with a text equivalent for screen readers. */
export function RatingStars({ value, count, className, size = "sm", showValue = true }: RatingProps) {
  const rounded = Math.round(value * 2) / 2
  const iconSize = size === "sm" ? "size-3.5" : "size-4.5"
  if (count === 0) {
    return <span className={cn("text-sm text-muted-foreground", className)}>No reviews yet</span>
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="inline-flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              iconSize,
              i <= rounded ? "fill-highlight text-highlight" : i - 0.5 === rounded ? "fill-highlight/50 text-highlight" : "text-muted-foreground/40",
            )}
          />
        ))}
      </span>
      <span className="sr-only">
        Rated {value.toFixed(1)} out of 5{count !== undefined ? ` from ${count} reviews` : ""}
      </span>
      {showValue && (
        <span aria-hidden="true" className="text-sm font-medium text-foreground">
          {value.toFixed(1)}
          {count !== undefined && <span className="font-normal text-muted-foreground"> ({count})</span>}
        </span>
      )}
    </span>
  )
}
