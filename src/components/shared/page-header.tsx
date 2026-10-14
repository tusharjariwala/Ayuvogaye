import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: ReactNode
  actions?: ReactNode
  eyebrow?: ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, eyebrow, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 space-y-1.5">
        {eyebrow}
        <h1 className="text-2xl font-semibold sm:text-[1.75rem]">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

interface SectionHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  id?: string
  as?: "h2" | "h3"
}

export function SectionHeader({ title, description, action, id, as: Heading = "h2" }: SectionHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <Heading id={id} className={Heading === "h2" ? "text-xl font-semibold sm:text-2xl" : "text-lg font-semibold"}>
          {title}
        </Heading>
        {description && <p className="text-sm text-muted-foreground sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  )
}
