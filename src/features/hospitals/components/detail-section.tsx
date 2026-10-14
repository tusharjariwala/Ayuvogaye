import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DetailSectionProps {
  id: string
  title: string
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}

/** Titled card section used on detail pages, linkable from the in-page nav. */
export function DetailSection({ id, title, description, action, children, className }: DetailSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("scroll-mt-32", className)}>
      <Card className="gap-0 py-0 shadow-soft">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <h2 id={`${id}-title`} className="text-lg font-semibold">
                {title}
              </h2>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
          {children}
        </CardContent>
      </Card>
    </section>
  )
}

/** Horizontal, scrollable jump links to sections of a detail page. */
export function InPageNav({ items, label = "On this page" }: { items: { id: string; label: string }[]; label?: string }) {
  return (
    <nav
      aria-label={label}
      className="sticky top-16 z-20 -mx-4 border-b bg-background/90 px-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-2"
    >
      <ul className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none]">
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              className="inline-flex h-8 items-center rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
