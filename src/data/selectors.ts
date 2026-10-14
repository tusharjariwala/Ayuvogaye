/**
 * Pure relational selectors over the mock collections. Pages call these
 * instead of reaching into raw arrays, which keeps business logic in one place.
 */
import type { Collections } from "@/data"
import type { AppNotification, Doctor, Hospital, Review, ReviewRatings, User } from "@/types"
import { REVIEW_DIMENSIONS } from "@/lib/constants"

export function getHospital(data: Collections, id?: string) {
  return id ? data.hospitals.find((h) => h.id === id) : undefined
}
export function getHospitalBySlug(data: Collections, slug?: string) {
  return slug ? data.hospitals.find((h) => h.slug === slug) : undefined
}
export function getDoctor(data: Collections, id?: string) {
  return id ? data.doctors.find((d) => d.id === id) : undefined
}
export function getDoctorBySlug(data: Collections, slug?: string) {
  return slug ? data.doctors.find((d) => d.slug === slug) : undefined
}
export function getSpecialty(data: Collections, id?: string) {
  return id ? data.specialties.find((s) => s.id === id) : undefined
}
export function getSpecialtyBySlug(data: Collections, slug?: string) {
  return slug ? data.specialties.find((s) => s.slug === slug) : undefined
}
export function getTreatment(data: Collections, id?: string) {
  return id ? data.treatments.find((t) => t.id === id) : undefined
}
export function getTreatmentBySlug(data: Collections, slug?: string) {
  return slug ? data.treatments.find((t) => t.slug === slug) : undefined
}
export function getCity(data: Collections, slug?: string) {
  return slug ? data.cities.find((c) => c.slug === slug) : undefined
}

export function getSpecialtyNames(data: Collections, ids: string[]): string[] {
  return ids.map((id) => getSpecialty(data, id)?.name).filter((n): n is string => !!n)
}

export function getDoctorsForHospital(data: Collections, hospitalId: string): Doctor[] {
  const ids = new Set(
    data.affiliations.filter((a) => a.hospitalId === hospitalId && a.status !== "ended").map((a) => a.doctorId),
  )
  return data.doctors.filter((d) => ids.has(d.id) && d.status !== "suspended")
}

export function getHospitalsForDoctor(data: Collections, doctorId: string): Hospital[] {
  const ids = new Set(
    data.affiliations.filter((a) => a.doctorId === doctorId && a.status !== "ended").map((a) => a.hospitalId),
  )
  return data.hospitals.filter((h) => ids.has(h.id) && h.status !== "suspended")
}

export function getHospitalsForTreatment(data: Collections, treatmentId: string): Hospital[] {
  return data.hospitals.filter((h) => h.treatmentIds.includes(treatmentId) && h.status !== "suspended")
}

export function getDoctorsForTreatment(data: Collections, treatmentId: string): Doctor[] {
  return data.doctors.filter((d) => d.treatmentIds.includes(treatmentId) && d.status !== "suspended")
}

export function getHospitalsForSpecialty(data: Collections, specialtyId: string): Hospital[] {
  return data.hospitals.filter((h) => h.specialtyIds.includes(specialtyId) && h.status !== "suspended")
}

export function getDoctorsForSpecialty(data: Collections, specialtyId: string): Doctor[] {
  return data.doctors.filter((d) => d.specialtyId === specialtyId && d.status !== "suspended")
}

export function getTreatmentsForSpecialty(data: Collections, specialtyId: string) {
  return data.treatments.filter((t) => t.specialtyIds.includes(specialtyId))
}

export function getReviewsFor(
  data: Collections,
  targetType: Review["targetType"],
  targetId: string,
  { publishedOnly = true } = {},
): Review[] {
  return data.reviews.filter(
    (r) => r.targetType === targetType && r.targetId === targetId && (!publishedOnly || r.status === "published"),
  )
}

export interface RatingSummary {
  average: number
  count: number
  dimensions: Record<keyof ReviewRatings, number>
}

export function summarizeReviews(reviews: Review[]): RatingSummary {
  const count = reviews.length
  const dimensions = Object.fromEntries(
    REVIEW_DIMENSIONS.map(({ key }) => [
      key,
      count ? reviews.reduce((sum, r) => sum + r.ratings[key], 0) / count : 0,
    ]),
  ) as Record<keyof ReviewRatings, number>
  return { average: dimensions.overall, count, dimensions }
}

export function getRatingSummary(data: Collections, targetType: Review["targetType"], targetId: string): RatingSummary {
  return summarizeReviews(getReviewsFor(data, targetType, targetId))
}

export function getReviewTargetName(data: Collections, review: Pick<Review, "targetType" | "targetId">): string {
  return review.targetType === "hospital"
    ? (getHospital(data, review.targetId)?.name ?? "Unknown hospital")
    : (getDoctor(data, review.targetId)?.name ?? "Unknown doctor")
}

/** Name of whichever provider an appointment/enquiry is addressed to. */
export function getProviderName(data: Collections, item: { hospitalId?: string; doctorId?: string }): string {
  const doctor = getDoctor(data, item.doctorId)
  const hospital = getHospital(data, item.hospitalId)
  if (doctor && hospital) return `${doctor.name} · ${hospital.name}`
  return doctor?.name ?? hospital?.name ?? "—"
}

export function getNotificationsForUser(data: Collections, user: User | null): AppNotification[] {
  if (!user) return []
  return data.notifications
    .filter((n) => (n.userId ? n.userId === user.id : n.audience === user.role))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Hospital that a hospital admin / staff user manages. */
export function getManagedHospital(data: Collections, user: User | null) {
  return getHospital(data, user?.hospitalId)
}

/** Doctor profile linked to a doctor user. */
export function getManagedDoctor(data: Collections, user: User | null) {
  return getDoctor(data, user?.doctorId)
}

export function isSponsored(data: Collections, entityType: "hospital" | "doctor", entityId: string): boolean {
  if (entityType === "hospital" && getHospital(data, entityId)?.sponsored) return true
  return data.featuredListings.some((l) => l.entityType === entityType && l.entityId === entityId && l.status === "active")
}
