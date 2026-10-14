/**
 * Pure helpers shared by the admin console. No React here so they can be
 * imported from hooks, components and pages alike.
 */
import type { Collections } from "@/data"
import { getDoctor, getHospital, getSpecialty } from "@/data/selectors"
import { APPOINTMENT_STATUS_LABELS } from "@/lib/constants"
import type {
  AppointmentStatus,
  Doctor,
  Hospital,
  ProviderType,
  User,
  Verification,
  VerificationCase,
} from "@/types"

export const PROVIDER_LABEL: Record<ProviderType, string> = { hospital: "Hospital", doctor: "Doctor" }

export const HOSPITAL_TYPES: Hospital["type"][] = [
  "Multi-speciality",
  "Super-speciality",
  "Speciality clinic",
  "Eye hospital",
  "Children's hospital",
  "Cancer centre",
]

export const PROVIDER_STATUSES: Hospital["status"][] = ["active", "pending", "suspended"]

export const PROVIDER_STATUS_LABELS: Record<Hospital["status"], string> = {
  active: "Active",
  pending: "Pending",
  suspended: "Suspended",
}

/** The 12 specialty icon keys supported by `SpecialtyIcon`. */
export const SPECIALTY_ICON_KEYS = [
  "heart-pulse",
  "bone",
  "brain",
  "ribbon",
  "baby",
  "heart-handshake",
  "scan-face",
  "eye",
  "ear",
  "pill",
  "droplets",
  "stethoscope",
] as const

export const EDITORIAL_LABELS = { draft: "Draft", in_review: "In review", published: "Published" } as const

export function actorName(user: User | null): string {
  return user?.name ?? "Platform admin"
}

export function getProvider(data: Collections, type: ProviderType, id: string): Hospital | Doctor | undefined {
  return type === "hospital" ? getHospital(data, id) : getDoctor(data, id)
}

export function getProviderLabel(data: Collections, type: ProviderType, id: string): string {
  return getProvider(data, type, id)?.name ?? `Unknown ${type}`
}

/** Public profile path, or undefined when the provider no longer exists. */
export function providerPublicPath(data: Collections, type: ProviderType, id: string): string | undefined {
  const p = getProvider(data, type, id)
  if (!p) return undefined
  return type === "hospital" ? `/hospital/${p.slug}` : `/doctor/${p.slug}`
}

/** Portal page where the provider sees verification / profile updates. */
export function providerPortalLink(type: ProviderType): string {
  return type === "hospital" ? "/provider/hospital/profile" : "/provider/doctor/profile"
}

/** The user account linked to a provider record (hospital admin or doctor), if any. */
export function findProviderUser(data: Collections, type: ProviderType, id: string): User | undefined {
  return data.users.find((u) =>
    type === "hospital" ? u.role === "hospital_admin" && u.hospitalId === id : u.role === "doctor" && u.doctorId === id,
  )
}

/** Most recent verification case for a provider. */
export function latestCase(data: Collections, type: ProviderType, id: string): VerificationCase | undefined {
  return data.verificationCases
    .filter((c) => c.entityType === type && c.entityId === id)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0]
}

export function getCasesFor(data: Collections, type: ProviderType, id: string): VerificationCase[] {
  return data.verificationCases
    .filter((c) => c.entityType === type && c.entityId === id)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
}

// ---------- Provider rows (shared shape for hospital & doctor tables) ----------

export interface ProviderRow {
  id: string
  type: ProviderType
  name: string
  slug: string
  city: string
  citySlug: string
  status: Hospital["status"]
  verification: Verification
  verificationStatus: Verification["status"]
  /** Hospital type or doctor specialty name. */
  category: string
  sponsored: boolean
  claimed: boolean
  profileCompleteness: number
  pendingChanges: number
  updatedAt: string
}

export function toProviderRows(data: Collections, type: ProviderType): ProviderRow[] {
  const pending = (id: string) =>
    data.changeRequests.filter((c) => c.entityType === type && c.entityId === id && c.status === "pending").length
  if (type === "hospital") {
    return data.hospitals.map((h) => ({
      id: h.id,
      type,
      name: h.name,
      slug: h.slug,
      city: h.city,
      citySlug: h.citySlug,
      status: h.status,
      verification: h.verification,
      verificationStatus: h.verification.status,
      category: h.type,
      sponsored: h.sponsored,
      claimed: h.claimed,
      profileCompleteness: h.profileCompleteness,
      pendingChanges: pending(h.id),
      updatedAt: h.updatedAt,
    }))
  }
  return data.doctors.map((d) => ({
    id: d.id,
    type,
    name: d.name,
    slug: d.slug,
    city: d.city,
    citySlug: d.citySlug,
    status: d.status,
    verification: d.verification,
    verificationStatus: d.verification.status,
    category: getSpecialty(data, d.specialtyId)?.name ?? "—",
    sponsored: data.featuredListings.some((l) => l.entityType === "doctor" && l.entityId === d.id && l.status === "active"),
    claimed: d.claimed,
    profileCompleteness: d.profileCompleteness,
    pendingChanges: pending(d.id),
    updatedAt: d.updatedAt,
  }))
}

// ---------- Chart data ----------

export function providerDistribution(data: Collections, citySlug?: string) {
  return data.cities
    .filter((c) => !citySlug || c.slug === citySlug)
    .map((c) => ({
      city: c.name,
      hospitals: data.hospitals.filter((h) => h.citySlug === c.slug).length,
      doctors: data.doctors.filter((d) => d.citySlug === c.slug).length,
    }))
    .filter((p) => p.hospitals + p.doctors > 0)
    .sort((a, b) => b.hospitals + b.doctors - (a.hospitals + a.doctors))
}

export function appointmentStatusData(appointments: { status: AppointmentStatus }[]) {
  return (Object.keys(APPOINTMENT_STATUS_LABELS) as AppointmentStatus[]).map((s) => ({
    status: APPOINTMENT_STATUS_LABELS[s],
    count: appointments.filter((a) => a.status === s).length,
  }))
}

/** Count occurrences of each key, preserving the order of `keys`. */
export function countBy<T, K extends string>(items: T[], keys: readonly K[], get: (item: T) => K): Record<K, number> {
  const out = Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>
  for (const item of items) {
    const k = get(item)
    if (k in out) out[k] += 1
  }
  return out
}

/** `yyyy-mm-dd` for date inputs. */
export function toDateInput(iso?: string): string {
  return iso ? iso.slice(0, 10) : ""
}

export function fromDateInput(value: string, endOfDay = false): string {
  return new Date(`${value}T${endOfDay ? "23:59:00" : "00:00:00"}`).toISOString()
}
