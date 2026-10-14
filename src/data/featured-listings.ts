// Fictional, illustrative sample data. Not real people, providers, credentials or patient records.
import type { FeaturedListing } from "@/types"

export const featuredListings: FeaturedListing[] = [
  { id: "fl-001", entityType: "hospital", entityId: "h-002", placement: "homepage", startDate: "2026-09-01T10:30:00.000Z", endDate: "2026-11-30T10:30:00.000Z", status: "active" },
  { id: "fl-002", entityType: "hospital", entityId: "h-005", placement: "search", startDate: "2026-09-15T10:30:00.000Z", endDate: "2026-11-15T10:30:00.000Z", status: "active" },
  { id: "fl-003", entityType: "hospital", entityId: "h-007", placement: "city_page", startDate: "2026-08-01T10:30:00.000Z", endDate: "2026-10-31T10:30:00.000Z", status: "paused" },
  { id: "fl-004", entityType: "doctor", entityId: "d-001", placement: "search", startDate: "2026-10-20T10:30:00.000Z", endDate: "2026-11-30T10:30:00.000Z", status: "scheduled" },
  { id: "fl-005", entityType: "doctor", entityId: "d-007", placement: "homepage", startDate: "2026-05-01T10:30:00.000Z", endDate: "2026-07-31T10:30:00.000Z", status: "expired" },
]
