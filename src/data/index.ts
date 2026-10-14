/**
 * Central seed for every mock collection. The demo store clones this on first
 * load and whenever the user resets demo data.
 */
import type {
  Accreditation,
  Affiliation,
  AppNotification,
  Appointment,
  AuditLog,
  ChangeRequest,
  City,
  ContentPage,
  Department,
  Doctor,
  Enquiry,
  Facility,
  Favourite,
  FeaturedListing,
  Hospital,
  NotificationPreferences,
  PlatformSettings,
  ReportedContent,
  Review,
  Specialty,
  Treatment,
  User,
  VerificationCase,
} from "@/types"
import { accreditations } from "./accreditations"
import { affiliations } from "./affiliations"
import { appointments } from "./appointments"
import { auditLogs } from "./audit-logs"
import { changeRequests } from "./change-requests"
import { cities } from "./cities"
import { contentPages } from "./content-pages"
import { departments } from "./departments"
import { doctors } from "./doctors"
import { enquiries } from "./enquiries"
import { facilities } from "./facilities"
import { favourites } from "./favourites"
import { featuredListings } from "./featured-listings"
import { hospitals } from "./hospitals"
import { notifications } from "./notifications"
import { reportedContent } from "./reported-content"
import { reviews } from "./reviews"
import { defaultNotificationPreferences, platformSettings } from "./settings"
import { specialties } from "./specialties"
import { treatments } from "./treatments"
import { users } from "./users"
import { verificationCases } from "./verification-cases"

export { demoAccounts } from "./users"

export interface Collections {
  users: User[]
  cities: City[]
  specialties: Specialty[]
  departments: Department[]
  facilities: Facility[]
  accreditations: Accreditation[]
  treatments: Treatment[]
  hospitals: Hospital[]
  doctors: Doctor[]
  affiliations: Affiliation[]
  appointments: Appointment[]
  enquiries: Enquiry[]
  reviews: Review[]
  verificationCases: VerificationCase[]
  changeRequests: ChangeRequest[]
  notifications: AppNotification[]
  auditLogs: AuditLog[]
  favourites: Favourite[]
  featuredListings: FeaturedListing[]
  reportedContent: ReportedContent[]
  contentPages: ContentPage[]
}

export type CollectionName = keyof Collections
export type EntityOf<K extends CollectionName> = Collections[K][number]

export interface DemoSettings {
  platform: PlatformSettings
  /** Keyed by user id. */
  notificationPreferences: Record<string, NotificationPreferences>
}

export function createSeedCollections(): Collections {
  return structuredClone({
    users,
    cities,
    specialties,
    departments,
    facilities,
    accreditations,
    treatments,
    hospitals,
    doctors,
    affiliations,
    appointments,
    enquiries,
    reviews,
    verificationCases,
    changeRequests,
    notifications,
    auditLogs,
    favourites,
    featuredListings,
    reportedContent,
    contentPages,
  })
}

export function createSeedSettings(): DemoSettings {
  return structuredClone({ platform: platformSettings, notificationPreferences: {} })
}

export { defaultNotificationPreferences }
