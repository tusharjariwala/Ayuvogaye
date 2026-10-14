import { useCallback } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { useDemoStore } from "@/hooks/use-demo-store"

/** Hospital comparison list (2–4 hospitals) with toast feedback. */
export function useCompare() {
  const { compareIds, addToCompare, removeFromCompare, clearCompare, settings } = useDemoStore()
  const navigate = useNavigate()

  const add = useCallback(
    (id: string, name: string) => {
      const result = addToCompare(id)
      if (result === "full") {
        toast.warning(`You can compare up to ${settings.platform.maxCompare} hospitals`, {
          description: "Remove one from the comparison to add another.",
        })
      } else if (result === "exists") {
        toast.info(`${name} is already in your comparison`)
      } else {
        toast.success(`Added ${name} to comparison`, {
          action: { label: "Compare", onClick: () => navigate("/compare/hospitals") },
        })
      }
    },
    [addToCompare, navigate, settings.platform.maxCompare],
  )

  const toggle = useCallback(
    (id: string, name: string) => {
      if (compareIds.includes(id)) {
        removeFromCompare(id)
        toast(`Removed ${name} from comparison`)
      } else {
        add(id, name)
      }
    },
    [add, compareIds, removeFromCompare],
  )

  return {
    compareIds,
    max: settings.platform.maxCompare,
    add,
    toggle,
    remove: removeFromCompare,
    clear: clearCompare,
    isComparing: (id: string) => compareIds.includes(id),
  }
}
