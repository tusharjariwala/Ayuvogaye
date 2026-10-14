import type {
  AppointmentStatus,
  AvailabilityLevel,
  ConsultationMode,
  EnquiryStatus,
  NotificationType,
  ReviewRatings,
  ReviewStatus,
  UserRole,
  VerificationStatus,
  Weekday,
} from "@/types"

export const APP_NAME = "Ayuvoyage"
export const APP_TAGLINE = "Medical Tourism"
export const MAX_COMPARE = 4
export const MIN_COMPARE = 2
export const DEFAULT_PAGE_SIZE = 9

export const ROLE_LABELS: Record<UserRole, string> = {
  patient: "Patient",
  doctor: "Doctor",
  hospital_admin: "Hospital Admin",
  staff: "Hospital Staff",
  platform_admin: "Platform Admin",
}

export const ROLE_HOME: Record<UserRole, string> = {
  patient: "/account/appointments",
  doctor: "/provider/doctor/dashboard",
  hospital_admin: "/provider/hospital/dashboard",
  staff: "/provider/hospital/dashboard",
  platform_admin: "/admin/dashboard",
}

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  unverified: "Unverified",
  submitted: "Submitted",
  under_review: "Under Review",
  verified: "Verified",
  rejected: "Rejected",
  expired: "Needs Reverification",
}

export const VERIFICATION_DESCRIPTIONS: Record<VerificationStatus, string> = {
  unverified:
    "The provider has not submitted documents for verification. Information shown is provider-submitted or compiled and has not been checked by the platform.",
  submitted: "The provider has submitted documents. The platform has not started reviewing them yet.",
  under_review: "A platform reviewer is checking the submitted documents. Information is not yet confirmed.",
  verified:
    "The platform has checked selected details (such as registration and basic information) against submitted evidence. Verification does not rate clinical quality or outcomes.",
  rejected: "The submitted documents could not be confirmed. The provider may correct and resubmit.",
  expired: "A previous verification has lapsed and must be renewed. Details may be out of date.",
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  rescheduled: "Rescheduled",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  under_review: "Under Review",
  quote_sent: "Quote Sent",
  converted: "Converted",
  closed: "Closed",
}

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "Pending",
  published: "Published",
  hidden: "Hidden",
  rejected: "Rejected",
}

export const CONSULTATION_MODE_LABELS: Record<ConsultationMode, string> = {
  in_person: "In-person",
  video: "Video",
  phone: "Phone",
}

export const AVAILABILITY_LABELS: Record<AvailabilityLevel, string> = {
  available: "Accepting requests",
  limited: "Limited availability",
  unavailable: "Not accepting requests",
}

export const WEEKDAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
}

export const REVIEW_DIMENSIONS: { key: keyof ReviewRatings; label: string }[] = [
  { key: "communication", label: "Communication" },
  { key: "waitingTime", label: "Waiting time" },
  { key: "staff", label: "Staff" },
  { key: "cleanliness", label: "Cleanliness" },
  { key: "explanation", label: "Explanation" },
  { key: "overall", label: "Overall experience" },
]

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  new_enquiry: "New enquiry",
  appointment_request: "Appointment request",
  appointment_update: "Appointment status update",
  verification_update: "Verification update",
  profile_approval: "Profile approval",
  review_submission: "Review submission",
  moderation_alert: "Moderation alert",
}

export const NOTIFICATION_TYPES = Object.keys(NOTIFICATION_TYPE_LABELS) as NotificationType[]

export const LANGUAGES = [
  "English",
  "Hindi",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Bengali",
  "Gujarati",
  "Malayalam",
  "Punjabi",
  "Urdu",
]

export const DEMO_NOTICE =
  "Demo template: all providers, reviews and data are fictional. Actions are simulated in your browser — no real bookings, messages or verifications occur."
