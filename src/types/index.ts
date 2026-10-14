/**
 * Domain models for the healthcare discovery template.
 * All records in this project are fictional and illustrative.
 */

export type ID = string
/** ISO 8601 date-time string. */
export type ISODate = string

// ---------- Enumerations ----------

export type UserRole = "patient" | "doctor" | "hospital_admin" | "staff" | "platform_admin"
export type AccountStatus = "active" | "suspended" | "invited"

export type VerificationStatus =
  | "unverified"
  | "submitted"
  | "under_review"
  | "verified"
  | "rejected"
  | "expired"

export type AppointmentStatus = "requested" | "confirmed" | "rescheduled" | "completed" | "cancelled"

export type EnquiryStatus =
  | "new"
  | "contacted"
  | "under_review"
  | "quote_sent"
  | "converted"
  | "closed"

export type ReviewStatus = "pending" | "published" | "hidden" | "rejected"

export type ConsultationMode = "in_person" | "video" | "phone"

export type Gender = "female" | "male" | "other"

/** Where a piece of profile information came from. */
export type DataSource = "provider_submitted" | "platform_verified" | "editorial"

export type EditorialStatus = "draft" | "in_review" | "published"

export type ProviderType = "hospital" | "doctor"
export type EntityType =
  | "hospital"
  | "doctor"
  | "treatment"
  | "specialty"
  | "review"
  | "user"
  | "appointment"
  | "enquiry"
  | "department"
  | "location"
  | "content"
  | "listing"
  | "settings"

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

export type AvailabilityLevel = "available" | "limited" | "unavailable"

// ---------- Shared value objects ----------

export interface SeoMeta {
  title: string
  description: string
  keywords: string[]
}

export interface TimelineEvent {
  id: ID
  at: ISODate
  label: string
  actor: string
  note?: string
}

export interface Verification {
  status: VerificationStatus
  lastVerifiedAt?: ISODate
  reviewedBy?: string
  /** Free-text explanation, e.g. reason for rejection. */
  note?: string
}

export interface OperatingHours {
  day: Weekday
  open: string // "09:00"
  close: string // "20:00"
  closed?: boolean
}

export interface TimeSlot {
  id: ID
  day: Weekday
  start: string
  end: string
  mode: ConsultationMode
  hospitalId?: ID
}

// ---------- Taxonomy ----------

export interface City {
  id: ID
  slug: string
  name: string
  state: string
}

export interface Specialty {
  id: ID
  slug: string
  name: string
  /** Lucide icon name key — resolved in the UI via a lookup map. */
  icon: string
  category: string
  shortDescription: string
  overview: string
  commonConditions: string[]
  editorialStatus: EditorialStatus
  seo: SeoMeta
}

export interface Department {
  id: ID
  slug: string
  name: string
  specialtyId: ID
  description: string
}

export interface Facility {
  id: ID
  name: string
  category: "clinical" | "diagnostics" | "patient_comfort" | "emergency" | "accessibility"
}

export interface Accreditation {
  id: ID
  code: string
  name: string
  description: string
}

// ---------- Users ----------

export interface User {
  id: ID
  name: string
  email: string
  phone?: string
  role: UserRole
  status: AccountStatus
  city: string
  createdAt: ISODate
  lastActiveAt?: ISODate
  /** Linked provider records for provider roles. */
  hospitalId?: ID
  doctorId?: ID
}

// ---------- Hospitals ----------

export interface HospitalLocation {
  id: ID
  label: string
  address: string
  citySlug: string
  pincode: string
  phone: string
  isPrimary: boolean
}

export interface Hospital {
  id: ID
  slug: string
  name: string
  type: "Multi-speciality" | "Super-speciality" | "Speciality clinic" | "Eye hospital" | "Children's hospital" | "Cancer centre"
  tagline: string
  description: string
  citySlug: string
  city: string
  state: string
  address: string
  pincode: string
  phone: string
  email: string
  website?: string
  establishedYear: number
  beds: number
  specialtyIds: ID[]
  departmentIds: ID[]
  facilityIds: ID[]
  accreditationIds: ID[]
  treatmentIds: ID[]
  locations: HospitalLocation[]
  operatingHours: OperatingHours[]
  emergency: { available: boolean; hours: string; ambulance: boolean } | null
  appointmentAvailability: AvailabilityLevel
  verification: Verification
  /** Field groups confirmed by the platform; anything else is provider-submitted. */
  verifiedFields: string[]
  sponsored: boolean
  claimed: boolean
  profileCompleteness: number
  profileViews: number
  status: "active" | "suspended" | "pending"
  /** Gradient hue used by the placeholder image. */
  imageHue: number
  /** Photo URL (e.g. /images/hospitals/my-hospital.jpg). A stock photo is used when omitted. */
  image?: string
  createdAt: ISODate
  updatedAt: ISODate
}

// ---------- Doctors ----------

export interface Qualification {
  id: ID
  degree: string
  institution: string
  year: number
  source: DataSource
}

export interface Doctor {
  id: ID
  slug: string
  name: string
  gender?: Gender
  specialtyId: ID
  subSpecialty?: string
  bio: string
  qualifications: Qualification[]
  experienceYears: number
  languages: string[]
  consultationModes: ConsultationMode[]
  /** INR; undefined when not supplied by the provider. */
  consultationFee?: number
  citySlug: string
  city: string
  state: string
  treatmentIds: ID[]
  availability: TimeSlot[]
  availabilityLevel: AvailabilityLevel
  /** Placeholder only — never a real registration number. */
  registration: { council: string; placeholderRef: string }
  verification: Verification
  claimed: boolean
  profileCompleteness: number
  profileViews: number
  status: "active" | "suspended" | "pending"
  createdAt: ISODate
  updatedAt: ISODate
}

export interface Affiliation {
  id: ID
  doctorId: ID
  hospitalId: ID
  role: string
  days: Weekday[]
  status: "active" | "pending" | "ended"
}

// ---------- Treatments ----------

export interface FAQ {
  question: string
  answer: string
}

export interface Treatment {
  id: ID
  slug: string
  name: string
  category: string
  overview: string
  specialtyIds: ID[]
  services: string[]
  preparationFaqs: FAQ[]
  typicalStay?: string
  /** Illustrative estimate only, never a quote. */
  priceEstimate?: { min: number; max: number; basis: "illustrative" | "provider_submitted"; note: string }
  editorial: { status: EditorialStatus; reviewedBy?: string; reviewedAt?: ISODate }
  seo: SeoMeta
}

// ---------- Leads ----------

export interface Appointment {
  id: ID
  ref: string
  patientId?: ID
  patientName: string
  contact: string
  hospitalId?: ID
  doctorId?: ID
  specialtyId?: ID
  treatmentId?: ID
  preferredDate: ISODate
  preferredTime: string
  mode: ConsultationMode
  message?: string
  status: AppointmentStatus
  timeline: TimelineEvent[]
  createdAt: ISODate
  updatedAt: ISODate
}

export interface Enquiry {
  id: ID
  ref: string
  patientId?: ID
  patientName: string
  contact: string
  hospitalId?: ID
  doctorId?: ID
  specialtyId?: ID
  treatmentId?: ID
  subject: string
  message?: string
  preferredDate?: ISODate
  preferredTime?: string
  mode?: ConsultationMode
  status: EnquiryStatus
  timeline: TimelineEvent[]
  createdAt: ISODate
  updatedAt: ISODate
}

// ---------- Reviews ----------

export interface ReviewRatings {
  communication: number
  waitingTime: number
  staff: number
  cleanliness: number
  explanation: number
  overall: number
}

export interface Review {
  id: ID
  patientDisplayName: string
  patientId?: ID
  targetType: ProviderType
  targetId: ID
  ratings: ReviewRatings
  text: string
  createdAt: ISODate
  status: ReviewStatus
  providerResponse?: { text: string; at: ISODate; by: string }
  reportCount: number
  /** All seeded reviews are fictional sample content. */
  isSample: boolean
}

// ---------- Trust & operations ----------

export interface EvidenceRef {
  id: ID
  label: string
  /** Placeholder reference — no real documents are stored. */
  reference: string
}

export interface VerificationCase {
  id: ID
  entityType: ProviderType
  entityId: ID
  entityName: string
  status: VerificationStatus
  submittedAt: ISODate
  reviewer?: string
  reviewedAt?: ISODate
  evidence: EvidenceRef[]
  checklist: { label: string; done: boolean }[]
  history: TimelineEvent[]
  notes?: string
}

export interface ChangeRequest {
  id: ID
  entityType: ProviderType
  entityId: ID
  summary: string
  fields: string[]
  status: "pending" | "approved" | "rejected"
  submittedBy: string
  submittedAt: ISODate
}

export type NotificationType =
  | "new_enquiry"
  | "appointment_request"
  | "appointment_update"
  | "verification_update"
  | "profile_approval"
  | "review_submission"
  | "moderation_alert"

export interface AppNotification {
  id: ID
  type: NotificationType
  title: string
  message: string
  createdAt: ISODate
  read: boolean
  /** Deliver to everyone with this role, or to a specific user. */
  audience: UserRole
  userId?: ID
  link?: string
}

export interface AuditLog {
  id: ID
  at: ISODate
  actor: string
  actorRole: UserRole | "system"
  action: string
  entityType: EntityType
  entityId?: ID
  summary: string
}

export interface Favourite {
  id: ID
  userId: ID
  entityType: "hospital" | "doctor" | "treatment"
  entityId: ID
  createdAt: ISODate
}

export interface FeaturedListing {
  id: ID
  entityType: ProviderType
  entityId: ID
  placement: "homepage" | "search" | "city_page"
  startDate: ISODate
  endDate: ISODate
  status: "active" | "scheduled" | "paused" | "expired"
}

export interface ReportedContent {
  id: ID
  entityType: "review" | "hospital" | "doctor"
  entityId: ID
  reason: "inaccurate_information" | "inappropriate_content" | "spam" | "impersonation" | "other"
  details: string
  reportedBy: string
  createdAt: ISODate
  status: "open" | "resolved" | "dismissed"
}

export interface ContentPage {
  id: ID
  title: string
  slug: string
  type: "treatment" | "specialty" | "guide"
  relatedId?: ID
  status: EditorialStatus
  author: string
  updatedAt: ISODate
  seo: SeoMeta
}

export interface NotificationPreferences {
  email: Record<NotificationType, boolean>
  inApp: Record<NotificationType, boolean>
}

export interface PlatformSettings {
  platformName: string
  supportEmail: string
  defaultCity: string
  reviewAutoPublish: boolean
  requireReviewModeration: boolean
  sponsoredLabel: string
  maxCompare: number
}
