import { MoreHorizontal, type LucideIcon } from "lucide-react"
import { Fragment, type ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export interface RowAction {
  label: string
  icon?: LucideIcon
  onSelect: () => void
  destructive?: boolean
  hidden?: boolean
  disabled?: boolean
  /** Render a separator above this item. */
  separator?: boolean
}

/** Kebab menu for table rows. `label` names the row for screen readers. */
export function RowActions({ label, actions, title }: { label: string; actions: RowAction[]; title?: string }) {
  const visible = actions.filter((a) => !a.hidden)
  if (visible.length === 0) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${label}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{title ?? label}</DropdownMenuLabel>
        {visible.map((a, i) => {
          const Icon = a.icon
          return (
            <Fragment key={a.label}>
              {(a.separator || i === 0) && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onSelect={a.onSelect}
                disabled={a.disabled}
                variant={a.destructive ? "destructive" : "default"}
              >
                {Icon && <Icon />} {a.label}
              </DropdownMenuItem>
            </Fragment>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Consistent responsive grid for KPI StatCards. */
export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4", className)}>{children}</div>
}

/** Name + muted secondary line used in many admin table cells. */
export function CellTitle({ title, subtitle, className }: { title: ReactNode; subtitle?: ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-36", className)}>
      <p className="font-medium">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

/** Inline validation message for plain (non-RHF) admin forms. */
export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="text-xs font-medium text-destructive-text">
      {children}
    </p>
  )
}

export interface StatusTab {
  value: string
  label: string
  count: number
}

/** Status tabs with counts; renders `children` as the active panel. Scrolls horizontally on small screens. */
export function StatusTabs({
  value,
  onValueChange,
  tabs,
  label,
  children,
}: {
  value: string
  onValueChange: (value: string) => void
  tabs: StatusTab[]
  label: string
  children: ReactNode
}) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className="gap-4">
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <TabsList aria-label={label}>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="px-2.5">
              {t.label}
              <Badge variant="muted" className="h-5 min-w-5 px-1.5 tabular-nums">
                {t.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <TabsContent value={value}>{children}</TabsContent>
    </Tabs>
  )
}
