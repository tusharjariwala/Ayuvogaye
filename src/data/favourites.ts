// Fictional, illustrative sample data. Not real people, providers, credentials or patient records.
import type { Favourite } from "@/types"

export const favourites: Favourite[] = [
  { id: "fav-001", userId: "u-p-001", entityType: "hospital", entityId: "h-001", createdAt: "2026-09-10T10:30:00.000Z" },
  { id: "fav-002", userId: "u-p-001", entityType: "hospital", entityId: "h-006", createdAt: "2026-09-28T10:30:00.000Z" },
  { id: "fav-003", userId: "u-p-001", entityType: "doctor", entityId: "d-001", createdAt: "2026-09-11T10:30:00.000Z" },
  { id: "fav-004", userId: "u-p-001", entityType: "doctor", entityId: "d-002", createdAt: "2026-09-19T10:30:00.000Z" },
  { id: "fav-005", userId: "u-p-001", entityType: "treatment", entityId: "tr-knee-replacement", createdAt: "2026-09-19T10:35:00.000Z" },
  { id: "fav-006", userId: "u-p-001", entityType: "hospital", entityId: "h-002", createdAt: "2026-10-01T10:30:00.000Z" },
]
