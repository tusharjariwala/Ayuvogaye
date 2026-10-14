import { ArrowRight, CalendarDays, type LucideIcon } from "lucide-react"
import { useState, type ReactNode } from "react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BrandMark } from "@/components/shared/visuals"
import { formatDate } from "@/lib/formatters"
import { cn } from "@/lib/utils"

function greetingFor(date: Date) {
  const h = date.getHours()
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"
}

interface DashboardHeroProps {
  name?: string
  /** Small label above the greeting, e.g. the organisation name. */
  context?: ReactNode
  description: ReactNode
  actions?: ReactNode
  highlights?: { label: string; value: ReactNode }[]
}

/** Welcome banner used at the top of every dashboard. Provides the page's h1. */
export function DashboardHero({ name, context, description, actions, highlights }: DashboardHeroProps) {
  const [now] = useState(() => new Date())
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_100%_0%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_55%)]"
      />
      <BrandMark className="pointer-events-none absolute -right-10 -bottom-14 size-56 opacity-[0.06] sm:size-64" />
      <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4" aria-hidden="true" />
            <time dateTime={now.toISOString()}>{formatDate(now, "EEEE, d MMMM")}</time>
            {context && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-foreground">{context}</span>
              </>
            )}
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {greetingFor(now)}
            {name ? `, ${name}` : ""}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>
          {actions && <div className="flex flex-wrap gap-2 pt-2">{actions}</div>}
        </div>
        {highlights && highlights.length > 0 && (
          <dl className="grid shrink-0 grid-cols-3 gap-2 sm:gap-3 lg:flex lg:gap-4">
            {highlights.map((h) => (
              <div key={h.label} className="min-w-0 rounded-xl border border-border/80 bg-background/70 px-3 py-2.5 backdrop-blur-sm sm:px-4 sm:py-3 lg:min-w-28">
                <dt className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">{h.label}</dt>
                <dd className="mt-1 truncate text-sm font-bold tabular-nums sm:text-lg">{h.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  )
}

export interface TaskItem {
  label: string
  description: string
  count: number
  href: string
  icon: LucideIcon
}

/** "Needs your attention" list linking to the relevant queue. */
export function TaskListCard({ title = "Needs your attention", description, items, className }: { title?: string; description?: string; items: TaskItem[]; className?: string }) {
  const open = items.filter((i) => i.count > 0).length
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description ?? (open ? `${open} area${open === 1 ? "" : "s"} with pending items` : "You're all caught up")}</CardDescription>
        <CardAction>
          <Badge variant={open ? "warning" : "success"}>{open ? `${open} open` : "Clear"}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((t) => (
            <li key={t.href + t.label}>
              <Link
                to={t.href}
                className="group flex items-center gap-3 rounded-xl border border-border/80 p-3 transition-colors hover:border-primary/30 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", t.count > 0 ? "bg-warning-soft text-warning-text" : "bg-muted text-muted-foreground")}>
                  <t.icon className="size-4.5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{t.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{t.description}</span>
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {t.count}
                  <span className="sr-only"> pending</span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
