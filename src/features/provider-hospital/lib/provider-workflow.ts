/**
 * Pure helpers for the provider portals (hospital + doctor): profile
 * completeness, verification steps and change-request bookkeeping.
 * Provider edits never change `verification.status` to verified — only the
 * platform can do that (simulated in the admin portal).
 */
import type { Collections } from "@/data"
import type { ChangeRequest, Doctor, Hospital, ProviderType, TimelineEvent, VerificationCase, VerificationStatus, Weekday } from "@/types"

export interface ChecklistItem {
  label: string
  done: boolean
  /** Where the provider can fix a missing item. */
  href?: string
}

export const SUBMITTABLE_STATUSES: VerificationStatus[] = ["unverified", "rejected", "expired"]

export function canSubmitForVerification(status: VerificationStatus): boolean {
  return SUBMITTABLE_STATUSES.includes(status)
}

export const VERIFICATION_EVIDENCE: Record<ProviderType, string[]> = {
  hospital: ["Registration certificate", "Accreditation certificate", "Authorised signatory letter"],
  doctor: ["Medical council registration", "Degree certificate", "Hospital affiliation letter"],
}

export const VERIFICATION_CHECKLIST: Record<ProviderType, string[]> = {
  hospital: [
    "Registration placeholder matches listing name",
    "Address and pincode confirmed",
    "Accreditation categories cross-checked",
    "Facilities list reviewed",
    "Contact details reachable",
  ],
  doctor: [
    "Registration placeholder matches profile name",
    "Qualifications cross-checked",
    "Hospital affiliations confirmed",
    "Contact details reachable",
  ],
}

/** Human-readable labels for change-request field keys. */
export const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  tagline: "Tagline",
  description: "Description",
  type: "Hospital type",
  phone: "Phone",
  email: "Email",
  website: "Website",
  address: "Address",
  pincode: "Pincode",
  establishedYear: "Established year",
  beds: "Beds",
  emergency: "Emergency services",
  locations: "Locations",
  departmentIds: "Departments",
  specialtyIds: "Specialties",
  facilityIds: "Facilities",
  accreditationIds: "Accreditations",
  treatmentIds: "Treatments",
  operatingHours: "Operating hours",
  bio: "Bio",
  gender: "Gender",
  languages: "Languages",
  consultationModes: "Consultation modes",
  consultationFee: "Consultation fee",
  subSpecialty: "Sub-specialty",
  specialtyId: "Primary specialty",
  qualifications: "Qualifications",
  availability: "Availability",
}

export function fieldLabel(key: string): string {
  return FIELD_LABELS[key] ?? key
}

/** Field groups the platform can confirm for hospitals (see `Hospital.verifiedFields`). */
export const HOSPITAL_FIELD_GROUPS: { key: string; label: string; description: string }[] = [
  { key: "basic_info", label: "Basic information", description: "Name, type, address and contact details" },
  { key: "accreditations", label: "Accreditations", description: "Accreditation categories listed" },
  { key: "facilities", label: "Facilities", description: "Facilities and infrastructure" },
  { key: "departments", label: "Departments", description: "Departments and specialties" },
  { key: "locations", label: "Locations", description: "Branches and clinics" },
]

/** Profile fields whose change means "basic_info" is no longer platform-confirmed. */
export const BASIC_INFO_FIELDS = ["name", "type", "address", "pincode", "phone", "email", "establishedYear"]

export function getPendingChanges(data: Collections, entityType: ProviderType, entityId?: string): ChangeRequest[] {
  if (!entityId) return []
  return data.changeRequests
    .filter((c) => c.entityType === entityType && c.entityId === entityId && c.status === "pending")
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
}

export function getLatestCase(data: Collections, entityType: ProviderType, entityId?: string): VerificationCase | undefined {
  if (!entityId) return undefined
  return data.verificationCases
    .filter((c) => c.entityType === entityType && c.entityId === entityId)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0]
}

export function completenessPercent(items: ChecklistItem[]): number {
  if (items.length === 0) return 0
  return Math.round((items.filter((i) => i.done).length / items.length) * 100)
}

const H = "/provider/hospital"
const D = "/provider/doctor"

export function getHospitalCompleteness(data: Collections, h: Hospital): ChecklistItem[] {
  const activeDoctors = data.affiliations.filter((a) => a.hospitalId === h.id && a.status === "active").length
  return [
    { label: "Description of at least 80 characters", done: h.description.trim().length >= 80, href: `${H}/profile` },
    { label: "Tagline", done: h.tagline.trim().length > 0, href: `${H}/profile` },
    { label: "Phone and email", done: !!h.phone && !!h.email, href: `${H}/profile` },
    { label: "Website", done: !!h.website, href: `${H}/profile` },
    { label: "At least one location", done: h.locations.length > 0, href: `${H}/locations` },
    { label: "At least three departments", done: h.departmentIds.length >= 3, href: `${H}/departments` },
    { label: "Affiliated doctors", done: activeDoctors > 0, href: `${H}/doctors` },
    { label: "At least three treatments", done: h.treatmentIds.length >= 3, href: `${H}/treatments` },
    { label: "At least five facilities", done: h.facilityIds.length >= 5, href: `${H}/facilities` },
    { label: "Accreditations listed", done: h.accreditationIds.length > 0, href: `${H}/accreditations` },
    { label: "Operating hours", done: h.operatingHours.some((o) => !o.closed), href: `${H}/availability` },
  ]
}

export function getDoctorCompleteness(data: Collections, d: Doctor): ChecklistItem[] {
  const affiliations = data.affiliations.filter((a) => a.doctorId === d.id && a.status === "active").length
  return [
    { label: "Bio of at least 80 characters", done: d.bio.trim().length >= 80, href: `${D}/profile` },
    { label: "Languages spoken", done: d.languages.length > 0, href: `${D}/profile` },
    { label: "Consultation modes", done: d.consultationModes.length > 0, href: `${D}/profile` },
    { label: "Consultation fee", done: d.consultationFee !== undefined, href: `${D}/profile` },
    { label: "Qualifications", done: d.qualifications.length > 0, href: `${D}/qualifications` },
    { label: "Sub-specialty", done: !!d.subSpecialty, href: `${D}/specialties` },
    { label: "Treatments offered", done: d.treatmentIds.length > 0, href: `${D}/specialties` },
    { label: "Hospital affiliation", done: affiliations > 0, href: `${D}/affiliations` },
    { label: "Weekly availability", done: d.availability.length > 0, href: `${D}/availability` },
  ]
}

function reviewSteps(status: VerificationStatus): ChecklistItem[] {
  const submitted = status === "submitted" || status === "under_review" || status === "verified"
  return [
    { label: "Evidence references submitted (placeholders)", done: submitted },
    { label: "Platform review started", done: status === "under_review" || status === "verified" },
    { label: "Verified by the platform", done: status === "verified" },
  ]
}

export function getHospitalVerificationSteps(h: Hospital): ChecklistItem[] {
  return [
    { label: "Profile claimed by the hospital", done: h.claimed },
    {
      label: "Basic details complete (address, phone, email)",
      done: !!h.address && !!h.pincode && !!h.phone && !!h.email,
      href: `${H}/profile`,
    },
    { label: "Accreditations listed", done: h.accreditationIds.length > 0, href: `${H}/accreditations` },
    ...reviewSteps(h.verification.status),
  ]
}

export function getDoctorVerificationSteps(d: Doctor): ChecklistItem[] {
  return [
    { label: "Profile claimed", done: d.claimed },
    { label: "Registration placeholder on file", done: !!d.registration.placeholderRef },
    { label: "Qualifications added", done: d.qualifications.length > 0, href: `${D}/qualifications` },
    ...reviewSteps(d.verification.status),
  ]
}

/** "Updated name, phone and 2 more" style summary. */
export function summarizeFields(prefix: string, fields: string[]): string {
  const labels = fields.map((f) => fieldLabel(f).toLowerCase())
  if (labels.length <= 3) return `${prefix} ${joinList(labels)}`
  return `${prefix} ${labels.slice(0, 2).join(", ")} and ${labels.length - 2} more fields`
}

export function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("")
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
}

export const WEEKDAY_SHORT: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
}

/** Compare HH:mm strings. */
export function timeToMinutes(value: string): number {
  const [h = "0", m = "0"] = value.split(":")
  return Number(h) * 60 + Number(m)
}

/** Percentage change between the last two points of a series. */
export function lastDelta(values: number[]): number | undefined {
  if (values.length < 2) return undefined
  const prev = values[values.length - 2] ?? 0
  const last = values[values.length - 1] ?? 0
  if (!prev) return undefined
  return Math.round(((last - prev) / prev) * 1000) / 10
}

/** Audit-log entries and lead timeline events related to one provider, newest first. */
export function getProviderActivity(data: Collections, entityType: ProviderType, entityId: string, limit = 8): TimelineEvent[] {
  const key = entityType === "hospital" ? "hospitalId" : "doctorId"
  const appointments = data.appointments.filter((a) => a[key] === entityId)
  const enquiries = data.enquiries.filter((e) => e[key] === entityId)
  const leadIds = new Set([...appointments.map((a) => a.id), ...enquiries.map((e) => e.id)])
  const fromLogs: TimelineEvent[] = data.auditLogs
    .filter((l) => (l.entityType === entityType && l.entityId === entityId) || (l.entityId !== undefined && leadIds.has(l.entityId)))
    .map((l) => ({ id: l.id, at: l.at, label: l.summary, actor: l.actor }))
  const fromTimelines: TimelineEvent[] = appointments.flatMap((a) =>
    a.timeline.map((e) => ({ ...e, id: `${a.id}-${e.id}`, label: `${a.ref}: ${e.label}` })),
  )
  return [...fromLogs, ...fromTimelines].sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit)
}

export function isSameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const set = new Set(a)
  return b.every((x) => set.has(x))
}

export interface AffiliationDraft {
  targetId: string
  role: string
  days: Weekday[]
}

export type AffiliationErrors = Partial<Record<keyof AffiliationDraft, string>>

export function validateAffiliation(d: AffiliationDraft, requireTarget: boolean): AffiliationErrors {
  const e: AffiliationErrors = {}
  if (requireTarget && !d.targetId) e.targetId = "Make a selection"
  if (d.role.trim().length < 3) e.role = "Enter a role, e.g. Visiting Consultant"
  if (d.days.length === 0) e.days = "Choose at least one day"
  return e
}

/** Requested / confirmed / rescheduled appointments from today onwards, soonest first. */
export function getUpcomingAppointments<T extends { status: string; preferredDate: string; preferredTime: string }>(appointments: T[]): T[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return appointments
    .filter((a) => ["confirmed", "rescheduled", "requested"].includes(a.status) && new Date(a.preferredDate) >= today)
    .sort((a, b) => a.preferredDate.localeCompare(b.preferredDate) || a.preferredTime.localeCompare(b.preferredTime))
}
