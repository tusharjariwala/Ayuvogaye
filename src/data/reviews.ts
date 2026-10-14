// Fictional, illustrative sample data. Not real people, providers, credentials or patient records.
import type { Review, ReviewRatings } from "@/types"

/** communication, waitingTime, staff, cleanliness, explanation, overall */
function r(communication: number, waitingTime: number, staff: number, cleanliness: number, explanation: number, overall: number): ReviewRatings {
  return { communication, waitingTime, staff, cleanliness, explanation, overall }
}

export const reviews: Review[] = [
  // ---------- Greenleaf Care Hospital (h-001) ----------
  {
    id: "rev-001", patientDisplayName: "Aarav S.", patientId: "u-p-001", targetType: "hospital", targetId: "h-001",
    ratings: r(5, 3, 5, 5, 4, 4),
    text: "Front desk staff were courteous and the wards looked clean. Waiting time at the OPD was longer than expected on a Monday morning.",
    createdAt: "2026-09-12T10:30:00.000Z", status: "published",
    providerResponse: { text: "Thank you for the feedback. We are adding an extra registration counter on Monday mornings.", at: "2026-09-14T10:30:00.000Z", by: "Greenleaf Care Hospital" },
    reportCount: 0, isSample: true,
  },
  {
    id: "rev-002", patientDisplayName: "Rohit D.", patientId: "u-p-007", targetType: "hospital", targetId: "h-001",
    ratings: r(4, 4, 4, 5, 4, 4),
    text: "Billing was explained clearly before admission. Parking was difficult to find during visiting hours.",
    createdAt: "2026-08-03T10:30:00.000Z", status: "published", reportCount: 0, isSample: true,
  },
  {
    id: "rev-003", patientDisplayName: "Pooja J.", patientId: "u-p-012", targetType: "hospital", targetId: "h-001",
    ratings: r(3, 2, 4, 4, 3, 3),
    text: "Nursing staff were kind, but discharge paperwork took most of the afternoon.",
    createdAt: "2026-07-21T10:30:00.000Z", status: "published",
    providerResponse: { text: "We are sorry about the delay and are reviewing our discharge process.", at: "2026-07-23T10:30:00.000Z", by: "Greenleaf Care Hospital" },
    reportCount: 1, isSample: true,
  },
  {
    id: "rev-004", patientDisplayName: "Aditya K.", patientId: "u-p-017", targetType: "hospital", targetId: "h-001",
    ratings: r(5, 4, 5, 5, 5, 5),
    text: "Signage inside the campus was easy to follow and the cafeteria was clean. Appointment started close to the scheduled time.",
    createdAt: "2026-10-04T10:30:00.000Z", status: "pending", reportCount: 0, isSample: true,
  },
  {
    id: "rev-005", patientDisplayName: "Sunita K.", targetType: "hospital", targetId: "h-001",
    ratings: r(1, 1, 2, 3, 1, 1),
    text: "Content removed by moderators for including personal details of staff members.",
    createdAt: "2026-06-30T10:30:00.000Z", status: "hidden", reportCount: 3, isSample: true,
  },
  {
    id: "rev-006", patientDisplayName: "Neha T.", targetType: "hospital", targetId: "h-001",
    ratings: r(4, 3, 4, 4, 4, 4),
    text: "The paediatric waiting area had space for children to play. Pharmacy queue moved slowly in the evening.",
    createdAt: "2026-05-17T10:30:00.000Z", status: "published", reportCount: 0, isSample: true,
  },

  // ---------- Dr. Meera Iyer (d-001) ----------
  {
    id: "rev-007", patientDisplayName: "Aarav S.", patientId: "u-p-001", targetType: "doctor", targetId: "d-001",
    ratings: r(5, 4, 5, 5, 5, 5),
    text: "The doctor took time to explain the test reports in simple language and answered all my questions without rushing.",
    createdAt: "2026-10-06T10:30:00.000Z", status: "published",
    providerResponse: { text: "Thank you for taking the time to share your experience.", at: "2026-10-07T10:30:00.000Z", by: "Dr. Meera Iyer" },
    reportCount: 0, isSample: true,
  },
  {
    id: "rev-008", patientDisplayName: "Tanvi M.", patientId: "u-p-020", targetType: "doctor", targetId: "d-001",
    ratings: r(4, 5, 4, 5, 4, 4),
    text: "The video consultation started on time and the connection was smooth. I would have liked a written summary afterwards.",
    createdAt: "2026-09-02T10:30:00.000Z", status: "published", reportCount: 0, isSample: true,
  },
  {
    id: "rev-009", patientDisplayName: "Rohit D.", patientId: "u-p-007", targetType: "doctor", targetId: "d-001",
    ratings: r(5, 3, 4, 4, 5, 4),
    text: "Clear explanation of next steps. The clinic was busy so we waited around forty minutes.",
    createdAt: "2026-10-08T10:30:00.000Z", status: "pending", reportCount: 0, isSample: true,
  },
  {
    id: "rev-010", patientDisplayName: "Guest user", targetType: "doctor", targetId: "d-001",
    ratings: r(1, 1, 1, 1, 1, 1),
    text: "Promotional content unrelated to the consultation.",
    createdAt: "2026-04-11T10:30:00.000Z", status: "rejected", reportCount: 2, isSample: true,
  },

  // ---------- Other hospitals ----------
  {
    id: "rev-011", patientDisplayName: "Fatima S.", patientId: "u-p-010", targetType: "hospital", targetId: "h-002",
    ratings: r(4, 3, 4, 5, 4, 4),
    text: "Reception was helpful when our appointment had to be moved. The lounge area was comfortable for families.",
    createdAt: "2026-08-19T10:30:00.000Z", status: "published",
    providerResponse: { text: "We appreciate your patience with the rescheduling.", at: "2026-08-21T10:30:00.000Z", by: "Riverbend Heart Institute" },
    reportCount: 0, isSample: true,
  },
  {
    id: "rev-012", patientDisplayName: "Ananya R.", patientId: "u-p-002", targetType: "hospital", targetId: "h-003",
    ratings: r(5, 4, 5, 5, 5, 5),
    text: "Staff were gentle with my daughter and the play area kept her calm while we waited.",
    createdAt: "2026-09-08T10:30:00.000Z", status: "published", reportCount: 0, isSample: true,
  },
  {
    id: "rev-013", patientDisplayName: "Meenakshi S.", patientId: "u-p-006", targetType: "hospital", targetId: "h-004",
    ratings: r(4, 4, 5, 5, 4, 4),
    text: "The day-care process was well organised and the staff explained each step of the visit.",
    createdAt: "2026-10-08T10:30:00.000Z", status: "pending", reportCount: 0, isSample: true,
  },
  {
    id: "rev-014", patientDisplayName: "Ishaan V.", patientId: "u-p-003", targetType: "hospital", targetId: "h-006",
    ratings: r(3, 2, 3, 4, 3, 3),
    text: "Large campus with good facilities, but it was hard to find the right department without help.",
    createdAt: "2026-06-14T10:30:00.000Z", status: "published",
    providerResponse: { text: "Thank you. Volunteer guides are now available at the main entrance.", at: "2026-06-17T10:30:00.000Z", by: "Banyan Multispeciality Hospital" },
    reportCount: 0, isSample: true,
  },
  {
    id: "rev-015", patientDisplayName: "Arjun M.", patientId: "u-p-011", targetType: "hospital", targetId: "h-007",
    ratings: r(5, 4, 5, 4, 5, 5),
    text: "Maternity ward staff were attentive and visiting rules were explained clearly at admission.",
    createdAt: "2026-07-29T10:30:00.000Z", status: "published", reportCount: 0, isSample: true,
  },
  {
    id: "rev-016", patientDisplayName: "Diya P.", patientId: "u-p-004", targetType: "hospital", targetId: "h-009",
    ratings: r(4, 3, 4, 4, 4, 4),
    text: "Clean rooms and friendly nurses. The cafeteria closed earlier than we expected.",
    createdAt: "2026-05-05T10:30:00.000Z", status: "published", reportCount: 0, isSample: true,
  },
  {
    id: "rev-017", patientDisplayName: "Yash A.", patientId: "u-p-015", targetType: "hospital", targetId: "h-010",
    ratings: r(2, 2, 3, 3, 2, 2),
    text: "Text included claims about other patients that could not be moderated.",
    createdAt: "2026-04-22T10:30:00.000Z", status: "hidden", reportCount: 2, isSample: true,
  },
  {
    id: "rev-018", patientDisplayName: "Siddharth G.", patientId: "u-p-013", targetType: "hospital", targetId: "h-011",
    ratings: r(3, 3, 4, 3, 3, 3),
    text: "Helpful staff at the help desk. Washrooms in the OPD block could be cleaned more often.",
    createdAt: "2026-03-18T10:30:00.000Z", status: "published", reportCount: 1, isSample: true,
  },

  // ---------- Other doctors ----------
  {
    id: "rev-019", patientDisplayName: "Kabir S.", patientId: "u-p-005", targetType: "doctor", targetId: "d-004",
    ratings: r(5, 4, 4, 4, 5, 5),
    text: "Patient and thorough during the consultation. The follow-up plan was written down for us.",
    createdAt: "2026-08-25T10:30:00.000Z", status: "published", reportCount: 0, isSample: true,
  },
  {
    id: "rev-020", patientDisplayName: "Sneha B.", patientId: "u-p-008", targetType: "doctor", targetId: "d-009",
    ratings: r(5, 3, 5, 4, 5, 4),
    text: "Explained the plan calmly and gave us time for questions. The clinic was crowded on the day.",
    createdAt: "2026-09-19T10:30:00.000Z", status: "published",
    providerResponse: { text: "Thank you for your kind words and patience.", at: "2026-09-21T10:30:00.000Z", by: "Dr. Ananya Ghosh" },
    reportCount: 0, isSample: true,
  },
  {
    id: "rev-021", patientDisplayName: "Lakshmi H.", patientId: "u-p-018", targetType: "doctor", targetId: "d-017",
    ratings: r(5, 5, 5, 5, 5, 5),
    text: "Our son felt comfortable throughout the visit and the appointment started on time.",
    createdAt: "2026-07-10T10:30:00.000Z", status: "published", reportCount: 0, isSample: true,
  },
  {
    id: "rev-022", patientDisplayName: "Vivaan R.", patientId: "u-p-009", targetType: "doctor", targetId: "d-012",
    ratings: r(4, 4, 3, 4, 4, 4),
    text: "Clear explanation of the exercises to follow. Reception was a little disorganised.",
    createdAt: "2026-10-03T10:30:00.000Z", status: "pending", reportCount: 0, isSample: true,
  },
  {
    id: "rev-023", patientDisplayName: "Zoya S.", patientId: "u-p-025", targetType: "doctor", targetId: "d-016",
    ratings: r(1, 1, 1, 1, 1, 1),
    text: "Duplicate submission of another review.",
    createdAt: "2026-06-02T10:30:00.000Z", status: "rejected", reportCount: 1, isSample: true,
  },
  {
    id: "rev-024", patientDisplayName: "Harpreet K.", patientId: "u-p-021", targetType: "doctor", targetId: "d-015",
    ratings: r(4, 3, 4, 4, 4, 4),
    text: "Good explanation of the tests needed. The waiting area was full and seating was limited.",
    createdAt: "2026-09-27T10:30:00.000Z", status: "published", reportCount: 0, isSample: true,
  },
]
