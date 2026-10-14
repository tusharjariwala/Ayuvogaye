import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationControlsProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  className?: string
}

/** Compact page-number pagination for client-side lists. */
export function PaginationControls({ page, pageCount, onPageChange, className }: PaginationControlsProps) {
  if (pageCount <= 1) return null
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  )
  const go = (p: number) => {
    onPageChange(p)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  return (
    <nav aria-label="Pagination" className={cn("flex flex-wrap items-center justify-center gap-1", className)}>
      <Button variant="outline" size="sm" onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft /> <span className="hidden sm:inline">Previous</span>
      </Button>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1">
          {i > 0 && pages[i - 1] !== p - 1 && (
            <span className="px-1 text-muted-foreground" aria-hidden="true">
              …
            </span>
          )}
          <Button
            variant={p === page ? "default" : "ghost"}
            size="icon-sm"
            onClick={() => go(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </Button>
        </span>
      ))}
      <Button variant="outline" size="sm" onClick={() => go(page + 1)} disabled={page >= pageCount} aria-label="Next page">
        <span className="hidden sm:inline">Next</span> <ChevronRight />
      </Button>
    </nav>
  )
}
