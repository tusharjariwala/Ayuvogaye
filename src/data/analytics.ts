// Fictional, illustrative sample data. Not real people, providers, credentials or patient records.
// All figures are made up for chart demos. Revenue values are illustrative INR thousands.

export const userAcquisition: { month: string; patients: number; providers: number }[] = [
  { month: "Nov 25", patients: 420, providers: 18 },
  { month: "Dec 25", patients: 465, providers: 21 },
  { month: "Jan 26", patients: 510, providers: 24 },
  { month: "Feb 26", patients: 540, providers: 22 },
  { month: "Mar 26", patients: 610, providers: 27 },
  { month: "Apr 26", patients: 655, providers: 30 },
  { month: "May 26", patients: 700, providers: 29 },
  { month: "Jun 26", patients: 735, providers: 33 },
  { month: "Jul 26", patients: 790, providers: 35 },
  { month: "Aug 26", patients: 842, providers: 38 },
  { month: "Sep 26", patients: 905, providers: 41 },
  { month: "Oct 26", patients: 968, providers: 44 },
]

export const enquiryConversion: { month: string; enquiries: number; converted: number }[] = [
  { month: "Nov 25", enquiries: 310, converted: 74 },
  { month: "Dec 25", enquiries: 295, converted: 70 },
  { month: "Jan 26", enquiries: 340, converted: 85 },
  { month: "Feb 26", enquiries: 362, converted: 92 },
  { month: "Mar 26", enquiries: 398, converted: 104 },
  { month: "Apr 26", enquiries: 415, converted: 110 },
  { month: "May 26", enquiries: 440, converted: 118 },
  { month: "Jun 26", enquiries: 472, converted: 129 },
  { month: "Jul 26", enquiries: 505, converted: 138 },
  { month: "Aug 26", enquiries: 530, converted: 147 },
  { month: "Sep 26", enquiries: 568, converted: 160 },
  { month: "Oct 26", enquiries: 602, converted: 171 },
]

export const revenueSeries: { month: string; sponsored: number; subscriptions: number }[] = [
  { month: "Nov 25", sponsored: 120, subscriptions: 210 },
  { month: "Dec 25", sponsored: 135, subscriptions: 220 },
  { month: "Jan 26", sponsored: 128, subscriptions: 236 },
  { month: "Feb 26", sponsored: 142, subscriptions: 245 },
  { month: "Mar 26", sponsored: 156, subscriptions: 260 },
  { month: "Apr 26", sponsored: 160, subscriptions: 272 },
  { month: "May 26", sponsored: 171, subscriptions: 281 },
  { month: "Jun 26", sponsored: 168, subscriptions: 295 },
  { month: "Jul 26", sponsored: 182, subscriptions: 304 },
  { month: "Aug 26", sponsored: 190, subscriptions: 318 },
  { month: "Sep 26", sponsored: 205, subscriptions: 330 },
  { month: "Oct 26", sponsored: 214, subscriptions: 342 },
]

/** Greenleaf Care Hospital (h-001) portal metrics. */
export const hospitalMonthly: { month: string; enquiries: number; appointments: number; profileViews: number }[] = [
  { month: "Nov 25", enquiries: 34, appointments: 58, profileViews: 720 },
  { month: "Dec 25", enquiries: 31, appointments: 54, profileViews: 690 },
  { month: "Jan 26", enquiries: 38, appointments: 63, profileViews: 810 },
  { month: "Feb 26", enquiries: 41, appointments: 66, profileViews: 860 },
  { month: "Mar 26", enquiries: 45, appointments: 72, profileViews: 920 },
  { month: "Apr 26", enquiries: 43, appointments: 75, profileViews: 940 },
  { month: "May 26", enquiries: 48, appointments: 79, profileViews: 1010 },
  { month: "Jun 26", enquiries: 52, appointments: 84, profileViews: 1060 },
  { month: "Jul 26", enquiries: 55, appointments: 88, profileViews: 1110 },
  { month: "Aug 26", enquiries: 57, appointments: 91, profileViews: 1180 },
  { month: "Sep 26", enquiries: 61, appointments: 96, profileViews: 1240 },
  { month: "Oct 26", enquiries: 64, appointments: 101, profileViews: 1290 },
]

/** Dr. Meera Iyer (d-001) portal metrics. */
export const doctorMonthly: { month: string; appointments: number; enquiries: number; profileViews: number }[] = [
  { month: "Nov 25", appointments: 22, enquiries: 9, profileViews: 480 },
  { month: "Dec 25", appointments: 20, enquiries: 8, profileViews: 455 },
  { month: "Jan 26", appointments: 25, enquiries: 11, profileViews: 530 },
  { month: "Feb 26", appointments: 27, enquiries: 12, profileViews: 560 },
  { month: "Mar 26", appointments: 29, enquiries: 13, profileViews: 610 },
  { month: "Apr 26", appointments: 28, enquiries: 12, profileViews: 625 },
  { month: "May 26", appointments: 31, enquiries: 14, profileViews: 670 },
  { month: "Jun 26", appointments: 33, enquiries: 15, profileViews: 705 },
  { month: "Jul 26", appointments: 34, enquiries: 15, profileViews: 740 },
  { month: "Aug 26", appointments: 36, enquiries: 16, profileViews: 772 },
  { month: "Sep 26", appointments: 38, enquiries: 18, profileViews: 810 },
  { month: "Oct 26", appointments: 40, enquiries: 19, profileViews: 845 },
]
