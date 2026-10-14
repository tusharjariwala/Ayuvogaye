import { createContext } from "react"
import type { CollectionName, Collections, DemoSettings, EntityOf } from "@/data"
import type {
  AppNotification,
  EntityType,
  Favourite,
  NotificationPreferences,
  PlatformSettings,
  User,
  UserRole,
} from "@/types"

export type Patch<T> = Partial<T> | ((prev: T) => T)

export interface AuditInput {
  action: string
  entityType: EntityType
  entityId?: string
  summary: string
}

export type NotificationInput = Omit<AppNotification, "id" | "createdAt" | "read">

export interface DemoStoreValue {
  data: Collections
  settings: DemoSettings
  currentUser: User | null
  compareIds: string[]

  /** Generic local CRUD over any collection. */
  create: <K extends CollectionName>(name: K, item: EntityOf<K>) => EntityOf<K>
  update: <K extends CollectionName>(name: K, id: string, patch: Patch<EntityOf<K>>) => void
  remove: <K extends CollectionName>(name: K, id: string) => void

  /** Records a simulated action in the local audit trail. */
  logAudit: (entry: AuditInput) => void
  /** Adds a local in-app notification (never delivered externally). */
  notify: (notification: NotificationInput) => void

  signIn: (userId: string) => void
  signInAsRole: (role: UserRole) => User | null
  signOut: () => void

  toggleFavourite: (entityType: Favourite["entityType"], entityId: string) => "added" | "removed" | "signed_out"
  isFavourite: (entityType: Favourite["entityType"], entityId: string) => boolean

  addToCompare: (hospitalId: string) => "added" | "exists" | "full"
  removeFromCompare: (hospitalId: string) => void
  clearCompare: () => void

  updatePlatformSettings: (patch: Partial<PlatformSettings>) => void
  getNotificationPreferences: (userId: string) => NotificationPreferences
  setNotificationPreferences: (userId: string, prefs: NotificationPreferences) => void

  resetDemoData: () => void
}

export const DemoStoreContext = createContext<DemoStoreValue | null>(null)
