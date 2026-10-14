import { HeartOff } from "lucide-react"
import type { ReactNode } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useDemoStore } from "@/hooks/use-demo-store"
import { formatDate } from "@/lib/formatters"
import type { Favourite } from "@/types"

export interface FavouriteEntry {
  favourite: Favourite
  name: string
  card: ReactNode
}

/** Responsive grid of favourite cards with an explicit remove action and undo. */
export function FavouriteGrid({ entries }: { entries: FavouriteEntry[] }) {
  const { remove, create } = useDemoStore()

  const handleRemove = ({ favourite, name }: FavouriteEntry) => {
    remove("favourites", favourite.id)
    toast(`Removed ${name} from favourites`, {
      action: { label: "Undo", onClick: () => create("favourites", favourite) },
    })
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {entries.map((entry) => (
        <li key={entry.favourite.id} className="flex flex-col gap-2">
          <div className="flex-1">{entry.card}</div>
          <div className="flex items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
            <span>Saved {formatDate(entry.favourite.createdAt)}</span>
            <Button variant="ghost" size="xs" onClick={() => handleRemove(entry)} aria-label={`Remove ${entry.name} from favourites`}>
              <HeartOff /> Remove
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
