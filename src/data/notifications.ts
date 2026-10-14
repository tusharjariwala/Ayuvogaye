// Fictional, illustrative sample data. Not real people, providers, credentials or patient records.
import type { AppNotification } from "@/types"

export const notifications: AppNotification[] = [
  // ---------- Patient (u-p-001) ----------
  { id: "ntf-001", type: "appointment_update", title: "Appointment confirmed", message: "Your appointment APT-1002 at Greenleaf Care Hospital has been confirmed.", createdAt: "2026-10-03T09:15:00.000Z", read: false, audience: "patient", userId: "u-p-001", link: "/account/appointments" },
  { id: "ntf-002", type: "appointment_update", title: "Appointment rescheduled", message: "APT-1004 has been moved to 23 Oct. Please review the new time.", createdAt: "2026-10-06T14:20:00.000Z", read: false, audience: "patient", userId: "u-p-001", link: "/account/appointments" },
  { id: "ntf-003", type: "new_enquiry", title: "Estimate received", message: "Greenleaf Care Hospital shared an illustrative estimate for ENQ-2001.", createdAt: "2026-09-24T12:00:00.000Z", read: true, audience: "patient", userId: "u-p-001", link: "/account/appointments?tab=enquiries" },
  { id: "ntf-004", type: "review_submission", title: "Your review is live", message: "Your review of Dr. Meera Iyer has been published.", createdAt: "2026-10-06T16:00:00.000Z", read: true, audience: "patient", userId: "u-p-001", link: "/account/appointments" },
  { id: "ntf-005", type: "appointment_request", title: "Request sent", message: "Your appointment request APT-1001 has been sent to the hospital.", createdAt: "2026-10-08T10:31:00.000Z", read: false, audience: "patient", userId: "u-p-001", link: "/account/appointments" },

  // ---------- Hospital admins ----------
  { id: "ntf-006", type: "new_enquiry", title: "New enquiry received", message: "ENQ-2006 — Maternity package enquiry from a guest user.", createdAt: "2026-10-09T13:46:00.000Z", read: false, audience: "hospital_admin", link: "/provider/hospital/enquiries" },
  { id: "ntf-007", type: "appointment_request", title: "New appointment request", message: "APT-1007 requested with Dr. Meera Iyer for 21 Oct.", createdAt: "2026-10-09T10:31:00.000Z", read: false, audience: "hospital_admin", link: "/provider/hospital/appointments" },
  { id: "ntf-008", type: "profile_approval", title: "Profile changes approved", message: "Your request to change the primary email address was approved.", createdAt: "2026-08-24T10:30:00.000Z", read: true, audience: "hospital_admin", link: "/provider/hospital/profile" },
  { id: "ntf-009", type: "review_submission", title: "New review awaiting moderation", message: "A new review for your hospital is pending moderation.", createdAt: "2026-10-04T10:35:00.000Z", read: true, audience: "hospital_admin", link: "/provider/hospital/reviews" },
  { id: "ntf-010", type: "verification_update", title: "Verification renewed", message: "Your hospital verification was approved by the Platform Trust Team.", createdAt: "2026-08-14T10:30:00.000Z", read: true, audience: "hospital_admin", link: "/provider/hospital/dashboard" },

  // ---------- Doctor (u-d-001) ----------
  { id: "ntf-011", type: "appointment_request", title: "New video consultation request", message: "APT-1008 — guest request for a video consultation on 15 Oct.", createdAt: "2026-10-09T15:11:00.000Z", read: false, audience: "doctor", userId: "u-d-001", link: "/provider/doctor/appointments" },
  { id: "ntf-012", type: "review_submission", title: "New review published", message: "A patient review on your profile has been published.", createdAt: "2026-10-06T16:00:00.000Z", read: true, audience: "doctor", userId: "u-d-001", link: "/provider/doctor/reviews" },
  { id: "ntf-013", type: "profile_approval", title: "Change request received", message: "Your availability update is pending platform review.", createdAt: "2026-10-08T10:31:00.000Z", read: false, audience: "doctor", userId: "u-d-001", link: "/provider/doctor/profile" },
  { id: "ntf-014", type: "new_enquiry", title: "New enquiry", message: "ENQ-2003 — Video consultation availability.", createdAt: "2026-10-09T10:31:00.000Z", read: false, audience: "doctor", userId: "u-d-001", link: "/provider/doctor/enquiries" },

  // ---------- Platform admins ----------
  { id: "ntf-015", type: "verification_update", title: "New verification submitted", message: "Harbour Lights Hospital submitted documents for verification.", createdAt: "2026-10-03T10:31:00.000Z", read: false, audience: "platform_admin", link: "/admin/verifications" },
  { id: "ntf-016", type: "moderation_alert", title: "Review reported multiple times", message: "A review on Greenleaf Care Hospital has received 3 reports.", createdAt: "2026-07-01T10:30:00.000Z", read: true, audience: "platform_admin", link: "/admin/reported-content" },
  { id: "ntf-017", type: "moderation_alert", title: "Listing reported", message: "A hospital listing was reported for possibly inaccurate information.", createdAt: "2026-10-05T10:30:00.000Z", read: false, audience: "platform_admin", link: "/admin/reported-content" },
  { id: "ntf-018", type: "profile_approval", title: "Change requests pending", message: "3 provider change requests are waiting for review.", createdAt: "2026-10-09T10:35:00.000Z", read: false, audience: "platform_admin", link: "/admin/hospitals" },
  { id: "ntf-019", type: "review_submission", title: "Reviews awaiting moderation", message: "4 sample reviews are pending moderation.", createdAt: "2026-10-08T10:40:00.000Z", read: true, audience: "platform_admin", link: "/admin/reviews" },

  // ---------- Staff ----------
  { id: "ntf-020", type: "appointment_update", title: "Appointment cancelled", message: "A patient cancelled an upcoming appointment. The slot is now free.", createdAt: "2026-10-04T08:01:00.000Z", read: true, audience: "staff", link: "/provider/hospital/appointments" },
]
