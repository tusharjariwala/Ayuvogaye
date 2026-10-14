import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react"
import { useId, type ReactNode } from "react"
import { Link } from "react-router"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Tone = "primary" | "highlight" | "info" | "success" | "warning"

const TONE_CHIP: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  highlight: "bg-highlight/15 text-highlight-foreground dark:text-highlight",
  info: "bg-info-soft text-info-text",
  success: "bg-success-soft text-success-text",
  warning: "bg-warning-soft text-warning-text",
}

interface StatCardProps {
  label: string
  value: ReactNode
  icon?: LucideIcon
  /** Percentage change vs. previous period. */
  delta?: number
  hint?: string
  /** Recent values for a decorative sparkline (oldest → newest). */
  trend?: number[]
  tone?: Tone
  /** Makes the whole card a link. */
  href?: string
  className?: string
}

/** Thin, decorative trend line. The card's text carries the actual information. */
export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const id = useId()
  if (values.length < 2) return null
  const w = 120
  const h = 36
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const points = values.map((v, i) => [(i / (values.length - 1)) * w, h - 3 - ((v - min) / span) * (h - 6)] as const)
  const line = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")
  const [lx, ly] = points[points.length - 1]
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-9 w-28 overflow-visible", className)} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w} ${h} L0 ${h} Z`} fill={`url(#spark-${id})`} />
      <path d={line} fill="none" stroke="var(--chart-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={lx} cy={ly} r="2.5" fill="var(--chart-1)" stroke="var(--card)" strokeWidth="1.5" />
    </svg>
  )
}

export function StatCard({ label, value, icon: Icon, delta, hint, trend, tone = "primary", href, className }: StatCardProps) {
  const positive = delta !== undefined && delta >= 0
  const body = (
    <div className="flex h-full flex-col gap-3 p-4 sm:gap-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        {Icon ? (
          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl sm:size-10", TONE_CHIP[tone])}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
        ) : (
          <span />
        )}
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
              positive ? "bg-success-soft text-success-text" : "bg-destructive-soft text-destructive-text",
            )}
          >
            {positive ? <ArrowUpRight className="size-3.5" aria-hidden="true" /> : <ArrowDownRight className="size-3.5" aria-hidden="true" />}
            <span className="sr-only">{positive ? "Up" : "Down"} </span>
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className="mt-auto flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</p>
          <p className="text-2xl leading-none font-bold tracking-tight tabular-nums sm:text-[1.75rem]">{value}</p>
          {hint && <p className="pt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {trend && <Sparkline values={trend} className="hidden shrink-0 sm:block" />}
      </div>
    </div>
  )
  return (
    <Card className={cn("gap-0 py-0 transition-shadow", href && "hover:shadow-raised", className)}>
      {href ? (
        <Link to={href} className="h-full rounded-2xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
          {body}
        </Link>
      ) : (
        body
      )}
    </Card>
  )
}
