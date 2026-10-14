// Fictional, illustrative sample data. Not real people, providers, credentials or patient records.
import type { ReportedContent } from "@/types"

export const reportedContent: ReportedContent[] = [
  { id: "rc-001", entityType: "review", entityId: "rev-005", reason: "inappropriate_content", details: "Review mentions staff members by full name.", reportedBy: "Greenleaf Care Hospital", createdAt: "2026-06-30T14:00:00.000Z", status: "resolved" },
  { id: "rc-002", entityType: "review", entityId: "rev-003", reason: "inaccurate_information", details: "Hospital says the discharge timing described is not accurate.", reportedBy: "Greenleaf Care Hospital", createdAt: "2026-07-22T10:30:00.000Z", status: "dismissed" },
  { id: "rc-003", entityType: "review", entityId: "rev-010", reason: "spam", details: "Contains promotional text unrelated to the consultation.", reportedBy: "Dr. Meera Iyer", createdAt: "2026-04-11T15:00:00.000Z", status: "resolved" },
  { id: "rc-004", entityType: "hospital", entityId: "h-013", reason: "inaccurate_information", details: "Listed timings appear outdated; clinic seems closed on Sundays.", reportedBy: "Tanvi M.", createdAt: "2026-10-05T10:30:00.000Z", status: "open" },
  { id: "rc-005", entityType: "doctor", entityId: "d-020", reason: "impersonation", details: "Claimant may not be the doctor listed on this profile.", reportedBy: "Platform Trust Team", createdAt: "2026-07-25T10:30:00.000Z", status: "open" },
  { id: "rc-006", entityType: "review", entityId: "rev-018", reason: "other", details: "Hospital requests clarification on which block the review refers to.", reportedBy: "Gomti Riverside Hospital", createdAt: "2026-03-20T10:30:00.000Z", status: "open" },
]
