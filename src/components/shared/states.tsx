import { AlertTriangle, Inbox, RotateCcw, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card/50 px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div className="max-w-sm space-y-1">
        <h3 className="text-base font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive-soft px-6 py-10 text-center",
        className,
      )}
    >
      <AlertTriangle className="size-8 text-destructive-text" aria-hidden="true" />
      <div className="space-y-1">
        <h3 className="font-semibold text-destructive-text">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RotateCcw /> Try again
        </Button>
      )}
    </div>
  )
}

type SkeletonVariant = "page" | "cards" | "table" | "detail"

export function LoadingSkeleton({ variant = "page", count = 6 }: { variant?: SkeletonVariant; count?: number }) {
  if (variant === "cards") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <Skeleton className="h-36 rounded-b-none" />
            <CardContent className="space-y-3 pt-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  if (variant === "table") {
    return (
      <div className="space-y-2" aria-busy="true" aria-label="Loading">
        <Skeleton className="h-9 w-64" />
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    )
  }
  if (variant === "detail") {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading">
        <Skeleton className="h-56 w-full" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6 p-1" aria-busy="true" aria-label="Loading">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <Skeleton className="h-72 w-full" />
    </div>
  )
}
