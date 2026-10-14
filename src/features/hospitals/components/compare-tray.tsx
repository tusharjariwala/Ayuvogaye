import { GitCompareArrows, X } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { getHospital } from "@/data/selectors"
import { useCompare } from "@/hooks/use-compare"
import { useDemoStore } from "@/hooks/use-demo-store"
import { MAX_COMPARE, MIN_COMPARE } from "@/lib/constants"
import type { Hospital } from "@/types"

/** Sticky bottom bar listing hospitals selected for comparison. */
export function CompareTray() {
  const { data } = useDemoStore()
  const { compareIds, remove, clear } = useCompare()
  if (compareIds.length === 0) return null
  const hospitals = compareIds.map((id) => getHospital(data, id)).filter((h): h is Hospital => !!h)
  const ready = hospitals.length >= MIN_COMPARE

  return (
    <aside
      aria-label="Hospital comparison selection"
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 shadow-raised backdrop-blur supports-[backdrop-filter]:bg-card/85"
    >
      <div className="container-page flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span className="text-sm font-medium">
            Comparing {hospitals.length}/{MAX_COMPARE}
          </span>
          <ul className="flex min-w-0 flex-wrap gap-1.5">
            {hospitals.map((h) => (
              <li key={h.id} className="flex max-w-full items-center gap-1 rounded-full border bg-background py-0.5 pr-0.5 pl-3 text-xs">
                <span className="truncate">{h.name}</span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-full"
                  onClick={() => remove(h.id)}
                  aria-label={`Remove ${h.name} from comparison`}
                >
                  <X />
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-2">
          {!ready && <span className="text-xs text-muted-foreground">Select at least {MIN_COMPARE}</span>}
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear
          </Button>
          {ready ? (
            <Button asChild size="sm">
              <Link to="/compare/hospitals">
                <GitCompareArrows /> Compare ({hospitals.length})
              </Link>
            </Button>
          ) : (
            <Button size="sm" disabled>
              <GitCompareArrows /> Compare ({hospitals.length})
            </Button>
          )}
        </div>
      </div>
    </aside>
  )
}
