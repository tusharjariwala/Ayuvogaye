import { Circle } from "lucide-react"
import { formatDateTime } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { TimelineEvent } from "@/types"

interface ActivityTimelineProps {
  events: TimelineEvent[]
  className?: string
  emptyText?: string
  /** Newest first by default. */
  order?: "newest" | "oldest"
}

export function ActivityTimeline({ events, className, emptyText = "No activity yet.", order = "newest" }: ActivityTimelineProps) {
  const sorted = [...events].sort((a, b) => (order === "newest" ? b.at.localeCompare(a.at) : a.at.localeCompare(b.at)))
  if (sorted.length === 0) return <p className="text-sm text-muted-foreground">{emptyText}</p>
  return (
    <ol className={cn("relative space-y-5 border-l border-border pl-5", className)}>
      {sorted.map((e, i) => (
        <li key={e.id} className="relative">
          <span className="absolute top-1 -left-[1.6rem] flex size-3 items-center justify-center rounded-full bg-card">
            <Circle className={cn("size-3", i === 0 ? "fill-primary text-primary" : "text-muted-foreground")} aria-hidden="true" />
          </span>
          <p className="text-sm font-medium">{e.label}</p>
          <p className="text-xs text-muted-foreground">
            <time dateTime={e.at}>{formatDateTime(e.at)}</time> · {e.actor}
          </p>
          {e.note && <p className="mt-1 text-sm text-muted-foreground">{e.note}</p>}
        </li>
      ))}
    </ol>
  )
}
