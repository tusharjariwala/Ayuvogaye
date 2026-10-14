import { useCallback } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { useDemoStore } from "@/hooks/use-demo-store"
import type { Favourite } from "@/types"

/** Favourite toggling with user feedback. Requires a demo sign-in. */
export function useFavourites() {
  const { toggleFavourite, isFavourite } = useDemoStore()
  const navigate = useNavigate()

  const toggle = useCallback(
    (entityType: Favourite["entityType"], entityId: string, name: string) => {
      const result = toggleFavourite(entityType, entityId)
      if (result === "signed_out") {
        toast.info("Sign in to save favourites", {
          description: "Use a demo account — no real sign-up required.",
          action: { label: "Sign in", onClick: () => navigate("/account/login") },
        })
      } else if (result === "added") {
        toast.success(`Saved ${name}`, { description: "Find it under Account → Favourites." })
      } else {
        toast(`Removed ${name} from favourites`)
      }
    },
    [toggleFavourite, navigate],
  )

  return { toggle, isFavourite }
}
