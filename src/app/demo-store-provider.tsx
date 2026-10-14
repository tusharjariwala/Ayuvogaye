import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  createSeedCollections,
  createSeedSettings,
  defaultNotificationPreferences,
  demoAccounts,
  type CollectionName,
  type Collections,
  type DemoSettings,
  type EntityOf,
} from "@/data"
import { createItem, deleteItem, updateItem } from "@/lib/data-access"
import { DemoStoreContext, type AuditInput, type DemoStoreValue, type NotificationInput, type Patch } from "@/lib/demo-store"
import { clearDemoStorage, createId, nowISO, readStorage, writeStorage } from "@/lib/mock-storage"
import type { NotificationPreferences, PlatformSettings, UserRole } from "@/types"

const DATA_KEY = "collections-v2"
const SETTINGS_KEY = "settings-v2"
const SESSION_KEY = "session-v1"
const COMPARE_KEY = "compare-v1"

/**
 * Holds every mock collection in React state and mirrors it to localStorage so
 * the demo survives refreshes. Nothing here talks to a server.
 */
export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Collections>(() => readStorage(DATA_KEY, createSeedCollections()))
  const [settings, setSettings] = useState<DemoSettings>(() => readStorage(SETTINGS_KEY, createSeedSettings()))
  const [sessionUserId, setSessionUserId] = useState<string | null>(() => readStorage<string | null>(SESSION_KEY, null))
  const [compareIds, setCompareIds] = useState<string[]>(() => readStorage<string[]>(COMPARE_KEY, []))

  useEffect(() => writeStorage(DATA_KEY, data), [data])
  useEffect(() => writeStorage(SETTINGS_KEY, settings), [settings])
  useEffect(() => writeStorage(SESSION_KEY, sessionUserId), [sessionUserId])
  useEffect(() => writeStorage(COMPARE_KEY, compareIds), [compareIds])

  const currentUser = useMemo(
    () => data.users.find((u) => u.id === sessionUserId && u.status !== "suspended") ?? null,
    [data.users, sessionUserId],
  )

  const create = useCallback(<K extends CollectionName>(name: K, item: EntityOf<K>) => {
    setData((prev) => ({ ...prev, [name]: createItem(prev[name] as EntityOf<K>[], item) }) as Collections)
    return item
  }, [])

  const update = useCallback(<K extends CollectionName>(name: K, id: string, patch: Patch<EntityOf<K>>) => {
    setData((prev) => ({ ...prev, [name]: updateItem(prev[name] as EntityOf<K>[], id, patch) }) as Collections)
  }, [])

  const remove = useCallback(<K extends CollectionName>(name: K, id: string) => {
    setData((prev) => ({ ...prev, [name]: deleteItem(prev[name] as EntityOf<K>[], id) }) as Collections)
  }, [])

  const logAudit = useCallback(
    (entry: AuditInput) => {
      setData((prev) => ({
        ...prev,
        auditLogs: [
          {
            id: createId("log"),
            at: nowISO(),
            actor: currentUser?.name ?? "Guest (demo)",
            actorRole: currentUser?.role ?? "system",
            ...entry,
          },
          ...prev.auditLogs,
        ],
      }))
    },
    [currentUser],
  )

  const notify = useCallback((n: NotificationInput) => {
    setData((prev) => ({
      ...prev,
      notifications: [{ ...n, id: createId("ntf"), createdAt: nowISO(), read: false }, ...prev.notifications],
    }))
  }, [])

  const signIn = useCallback((userId: string) => setSessionUserId(userId), [])
  const signOut = useCallback(() => setSessionUserId(null), [])
  const signInAsRole = useCallback(
    (role: UserRole) => {
      const user = data.users.find((u) => u.id === demoAccounts[role]) ?? data.users.find((u) => u.role === role)
      if (user) setSessionUserId(user.id)
      return user ?? null
    },
    [data.users],
  )

  const isFavourite = useCallback(
    (entityType: "hospital" | "doctor" | "treatment", entityId: string) =>
      !!currentUser &&
      data.favourites.some((f) => f.userId === currentUser.id && f.entityType === entityType && f.entityId === entityId),
    [currentUser, data.favourites],
  )

  const toggleFavourite = useCallback(
    (entityType: "hospital" | "doctor" | "treatment", entityId: string) => {
      if (!currentUser) return "signed_out" as const
      const existing = data.favourites.find(
        (f) => f.userId === currentUser.id && f.entityType === entityType && f.entityId === entityId,
      )
      if (existing) {
        remove("favourites", existing.id)
        return "removed" as const
      }
      create("favourites", { id: createId("fav"), userId: currentUser.id, entityType, entityId, createdAt: nowISO() })
      return "added" as const
    },
    [currentUser, data.favourites, create, remove],
  )

  const addToCompare = useCallback(
    (hospitalId: string) => {
      if (compareIds.includes(hospitalId)) return "exists" as const
      if (compareIds.length >= settings.platform.maxCompare) return "full" as const
      setCompareIds((prev) => [...prev, hospitalId])
      return "added" as const
    },
    [compareIds, settings.platform.maxCompare],
  )
  const removeFromCompare = useCallback((id: string) => setCompareIds((prev) => prev.filter((x) => x !== id)), [])
  const clearCompare = useCallback(() => setCompareIds([]), [])

  const updatePlatformSettings = useCallback((patch: Partial<PlatformSettings>) => {
    setSettings((prev) => ({ ...prev, platform: { ...prev.platform, ...patch } }))
  }, [])

  const getNotificationPreferences = useCallback(
    (userId: string) => settings.notificationPreferences[userId] ?? defaultNotificationPreferences,
    [settings.notificationPreferences],
  )
  const setNotificationPreferences = useCallback((userId: string, prefs: NotificationPreferences) => {
    setSettings((prev) => ({ ...prev, notificationPreferences: { ...prev.notificationPreferences, [userId]: prefs } }))
  }, [])

  const resetDemoData = useCallback(() => {
    clearDemoStorage()
    setData(createSeedCollections())
    setSettings(createSeedSettings())
    setCompareIds([])
    // Keep the reviewer signed in to the same demo role after a reset when possible.
  }, [])

  const value = useMemo<DemoStoreValue>(
    () => ({
      data,
      settings,
      currentUser,
      compareIds,
      create,
      update,
      remove,
      logAudit,
      notify,
      signIn,
      signInAsRole,
      signOut,
      toggleFavourite,
      isFavourite,
      addToCompare,
      removeFromCompare,
      clearCompare,
      updatePlatformSettings,
      getNotificationPreferences,
      setNotificationPreferences,
      resetDemoData,
    }),
    [
      data,
      settings,
      currentUser,
      compareIds,
      create,
      update,
      remove,
      logAudit,
      notify,
      signIn,
      signInAsRole,
      signOut,
      toggleFavourite,
      isFavourite,
      addToCompare,
      removeFromCompare,
      clearCompare,
      updatePlatformSettings,
      getNotificationPreferences,
      setNotificationPreferences,
      resetDemoData,
    ],
  )

  return <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>
}
