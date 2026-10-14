import { useContext } from "react"
import type { CollectionName, Collections } from "@/data"
import { DemoStoreContext, type DemoStoreValue } from "@/lib/demo-store"

export function useDemoStore(): DemoStoreValue {
  const ctx = useContext(DemoStoreContext)
  if (!ctx) throw new Error("useDemoStore must be used within <DemoStoreProvider>")
  return ctx
}

/** Read a single collection from the demo store. */
export function useCollection<K extends CollectionName>(name: K): Collections[K] {
  return useDemoStore().data[name]
}

export function useCurrentUser() {
  return useDemoStore().currentUser
}
