/**
 * Fictional, illustrative sample data. Not real people, providers, credentials or patient records.
 */
import type { NotificationPreferences, NotificationType, PlatformSettings } from "@/types"

export const platformSettings: PlatformSettings = {
  platformName: "Ayuvoyage",
  supportEmail: "support@ayuvoyage.example.in",
  defaultCity: "pune",
  reviewAutoPublish: false,
  requireReviewModeration: true,
  sponsoredLabel: "Sponsored",
  maxCompare: 4,
}

const allTypes: NotificationType[] = [
  "new_enquiry",
  "appointment_request",
  "appointment_update",
  "verification_update",
  "profile_approval",
  "review_submission",
  "moderation_alert",
]

const allOn = Object.fromEntries(allTypes.map((t) => [t, true])) as Record<NotificationType, boolean>

export const defaultNotificationPreferences: NotificationPreferences = {
  email: { ...allOn, moderation_alert: false },
  inApp: { ...allOn },
}
