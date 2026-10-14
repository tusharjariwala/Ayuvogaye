import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavourites } from "@/hooks/use-favourites"
import { cn } from "@/lib/utils"

interface FavouriteToggleProps {
  type: "hospital" | "doctor" | "treatment"
  id: string
  name: string
  className?: string
}

export function FavouriteToggle({ type, id, name, className }: FavouriteToggleProps) {
  const { toggle, isFavourite } = useFavourites()
  const active = isFavourite(type, id)
  return (
    <Button
      variant="outline"
      className={className}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from favourites` : `Save ${name} to favourites`}
      onClick={() => toggle(type, id, name)}
    >
      <Heart className={cn(active && "fill-destructive text-destructive")} />
      {active ? "Saved" : "Save"}
    </Button>
  )
}
