// Fictional, illustrative sample data. Not real people, providers, credentials or patient records.
import type { User, UserRole } from "@/types"

export const users: User[] = [
  // ---------- Patients ----------
  { id: "u-p-001", name: "Aarav Sharma", email: "aarav.s@example.com", phone: "+91 00000 12001", role: "patient", status: "active", city: "Pune", createdAt: "2025-10-12T10:30:00.000Z", lastActiveAt: "2026-10-09T10:30:00.000Z" },
  { id: "u-p-002", name: "Ananya Rao", email: "ananya.r@example.com", phone: "+91 00000 12002", role: "patient", status: "active", city: "Bengaluru", createdAt: "2025-10-19T10:30:00.000Z", lastActiveAt: "2026-10-07T10:30:00.000Z" },
  { id: "u-p-003", name: "Ishaan Verma", email: "ishaan.v@example.com", role: "patient", status: "active", city: "Delhi", createdAt: "2025-11-02T10:30:00.000Z", lastActiveAt: "2026-09-30T10:30:00.000Z" },
  { id: "u-p-004", name: "Diya Patel", email: "diya.p@example.com", phone: "+91 00000 12004", role: "patient", status: "active", city: "Ahmedabad", createdAt: "2025-11-10T10:30:00.000Z", lastActiveAt: "2026-10-02T10:30:00.000Z" },
  { id: "u-p-005", name: "Kabir Singh", email: "kabir.s@example.com", role: "patient", status: "active", city: "Chandigarh", createdAt: "2025-11-21T10:30:00.000Z", lastActiveAt: "2026-09-18T10:30:00.000Z" },
  { id: "u-p-006", name: "Meenakshi Sundaram", email: "meenakshi.s@example.com", phone: "+91 00000 12006", role: "patient", status: "active", city: "Chennai", createdAt: "2025-12-01T10:30:00.000Z", lastActiveAt: "2026-10-05T10:30:00.000Z" },
  { id: "u-p-007", name: "Rohit Deshpande", email: "rohit.d@example.com", phone: "+91 00000 12007", role: "patient", status: "active", city: "Pune", createdAt: "2025-12-09T10:30:00.000Z", lastActiveAt: "2026-10-08T10:30:00.000Z" },
  { id: "u-p-008", name: "Sneha Banerjee", email: "sneha.b@example.com", role: "patient", status: "active", city: "Kolkata", createdAt: "2025-12-18T10:30:00.000Z", lastActiveAt: "2026-09-22T10:30:00.000Z" },
  { id: "u-p-009", name: "Vivaan Reddy", email: "vivaan.r@example.com", phone: "+91 00000 12009", role: "patient", status: "active", city: "Hyderabad", createdAt: "2026-01-04T10:30:00.000Z", lastActiveAt: "2026-10-01T10:30:00.000Z" },
  { id: "u-p-010", name: "Fatima Shaikh", email: "fatima.s@example.com", role: "patient", status: "active", city: "Mumbai", createdAt: "2026-01-11T10:30:00.000Z", lastActiveAt: "2026-09-27T10:30:00.000Z" },
  { id: "u-p-011", name: "Arjun Menon", email: "arjun.m@example.com", phone: "+91 00000 12011", role: "patient", status: "active", city: "Kochi", createdAt: "2026-01-23T10:30:00.000Z", lastActiveAt: "2026-10-03T10:30:00.000Z" },
  { id: "u-p-012", name: "Pooja Joshi", email: "pooja.j@example.com", role: "patient", status: "suspended", city: "Pune", createdAt: "2026-02-02T10:30:00.000Z", lastActiveAt: "2026-07-14T10:30:00.000Z" },
  { id: "u-p-013", name: "Siddharth Gupta", email: "siddharth.g@example.com", phone: "+91 00000 12013", role: "patient", status: "active", city: "Lucknow", createdAt: "2026-02-15T10:30:00.000Z", lastActiveAt: "2026-09-29T10:30:00.000Z" },
  { id: "u-p-014", name: "Nandini Krishnan", email: "nandini.k@example.com", role: "patient", status: "active", city: "Chennai", createdAt: "2026-02-27T10:30:00.000Z", lastActiveAt: "2026-10-06T10:30:00.000Z" },
  { id: "u-p-015", name: "Yash Agarwal", email: "yash.a@example.com", phone: "+91 00000 12015", role: "patient", status: "active", city: "Jaipur", createdAt: "2026-03-08T10:30:00.000Z", lastActiveAt: "2026-09-16T10:30:00.000Z" },
  { id: "u-p-016", name: "Riya Kapoor", email: "riya.k@example.com", role: "patient", status: "active", city: "Delhi", createdAt: "2026-03-19T10:30:00.000Z", lastActiveAt: "2026-10-04T10:30:00.000Z" },
  { id: "u-p-017", name: "Aditya Kulkarni", email: "aditya.k@example.com", phone: "+91 00000 12017", role: "patient", status: "active", city: "Pune", createdAt: "2026-04-01T10:30:00.000Z", lastActiveAt: "2026-10-09T10:30:00.000Z" },
  { id: "u-p-018", name: "Lakshmi Hegde", email: "lakshmi.h@example.com", role: "patient", status: "active", city: "Bengaluru", createdAt: "2026-04-14T10:30:00.000Z", lastActiveAt: "2026-09-25T10:30:00.000Z" },
  { id: "u-p-019", name: "Manish Tiwari", email: "manish.t@example.com", phone: "+91 00000 12019", role: "patient", status: "suspended", city: "Lucknow", createdAt: "2026-04-29T10:30:00.000Z", lastActiveAt: "2026-08-03T10:30:00.000Z" },
  { id: "u-p-020", name: "Tanvi Mehta", email: "tanvi.m@example.com", role: "patient", status: "active", city: "Mumbai", createdAt: "2026-05-12T10:30:00.000Z", lastActiveAt: "2026-10-07T10:30:00.000Z" },
  { id: "u-p-021", name: "Harpreet Kaur", email: "harpreet.k@example.com", phone: "+91 00000 12021", role: "patient", status: "active", city: "Chandigarh", createdAt: "2026-05-30T10:30:00.000Z", lastActiveAt: "2026-09-20T10:30:00.000Z" },
  { id: "u-p-022", name: "Sourav Das", email: "sourav.d@example.com", role: "patient", status: "active", city: "Kolkata", createdAt: "2026-06-16T10:30:00.000Z", lastActiveAt: "2026-10-02T10:30:00.000Z" },
  { id: "u-p-023", name: "Kavitha Nair", email: "kavitha.n@example.com", phone: "+91 00000 12023", role: "patient", status: "active", city: "Kochi", createdAt: "2026-07-08T10:30:00.000Z", lastActiveAt: "2026-10-08T10:30:00.000Z" },
  { id: "u-p-024", name: "Neel Shah", email: "neel.s@example.com", role: "patient", status: "invited", city: "Ahmedabad", createdAt: "2026-09-28T10:30:00.000Z" },
  { id: "u-p-025", name: "Zoya Siddiqui", email: "zoya.s@example.com", phone: "+91 00000 12025", role: "patient", status: "active", city: "Hyderabad", createdAt: "2026-08-19T10:30:00.000Z", lastActiveAt: "2026-10-05T10:30:00.000Z" },

  // ---------- Doctors ----------
  { id: "u-d-001", name: "Dr. Meera Iyer", email: "meera.iyer@greenleaf.example.in", phone: "+91 00000 13001", role: "doctor", status: "active", city: "Pune", createdAt: "2025-10-05T10:30:00.000Z", lastActiveAt: "2026-10-09T10:30:00.000Z", doctorId: "d-001" },
  { id: "u-d-002", name: "Dr. Arjun Kulkarni", email: "arjun.kulkarni@greenleaf.example.in", role: "doctor", status: "active", city: "Pune", createdAt: "2025-10-08T10:30:00.000Z", lastActiveAt: "2026-10-06T10:30:00.000Z", doctorId: "d-002" },
  { id: "u-d-003", name: "Dr. Sana Qureshi", email: "sana.qureshi@greenleaf.example.in", role: "doctor", status: "active", city: "Pune", createdAt: "2025-10-15T10:30:00.000Z", lastActiveAt: "2026-10-04T10:30:00.000Z", doctorId: "d-003" },
  { id: "u-d-004", name: "Dr. Vikram Rao", email: "vikram.rao@greenleaf.example.in", role: "doctor", status: "active", city: "Pune", createdAt: "2025-10-18T10:30:00.000Z", lastActiveAt: "2026-09-29T10:30:00.000Z", doctorId: "d-004" },
  { id: "u-d-005", name: "Dr. Priya Nair", email: "priya.nair@greenleaf.example.in", role: "doctor", status: "active", city: "Pune", createdAt: "2025-10-22T10:30:00.000Z", lastActiveAt: "2026-10-03T10:30:00.000Z", doctorId: "d-005" },

  // ---------- Hospital admins ----------
  { id: "u-h-001", name: "Kavita Deshmukh", email: "kavita.d@greenleaf.example.in", phone: "+91 00000 14001", role: "hospital_admin", status: "active", city: "Pune", createdAt: "2025-10-04T10:30:00.000Z", lastActiveAt: "2026-10-09T10:30:00.000Z", hospitalId: "h-001" },
  { id: "u-h-002", name: "Sanjay Pillai", email: "sanjay.p@riverbend.example.in", role: "hospital_admin", status: "active", city: "Mumbai", createdAt: "2025-10-12T10:30:00.000Z", lastActiveAt: "2026-10-05T10:30:00.000Z", hospitalId: "h-002" },
  { id: "u-h-003", name: "Revathi Gowda", email: "revathi.g@lotuschildren.example.in", role: "hospital_admin", status: "active", city: "Bengaluru", createdAt: "2025-10-20T10:30:00.000Z", lastActiveAt: "2026-10-01T10:30:00.000Z", hospitalId: "h-003" },

  // ---------- Staff ----------
  { id: "u-s-001", name: "Neha Pawar", email: "neha.p@greenleaf.example.in", role: "staff", status: "active", city: "Pune", createdAt: "2025-11-01T10:30:00.000Z", lastActiveAt: "2026-10-09T10:30:00.000Z", hospitalId: "h-001" },
  { id: "u-s-002", name: "Omkar Jadhav", email: "omkar.j@greenleaf.example.in", role: "staff", status: "active", city: "Pune", createdAt: "2026-01-15T10:30:00.000Z", lastActiveAt: "2026-10-08T10:30:00.000Z", hospitalId: "h-001" },
  { id: "u-s-003", name: "Ayesha Khan", email: "ayesha.k@riverbend.example.in", role: "staff", status: "active", city: "Mumbai", createdAt: "2026-02-10T10:30:00.000Z", lastActiveAt: "2026-10-02T10:30:00.000Z", hospitalId: "h-002" },

  // ---------- Platform admins ----------
  { id: "u-a-001", name: "Rohan Mehta", email: "rohan.m@platform.example.com", role: "platform_admin", status: "active", city: "Mumbai", createdAt: "2025-10-01T10:30:00.000Z", lastActiveAt: "2026-10-10T10:30:00.000Z" },
  { id: "u-a-002", name: "Shalini Rao", email: "shalini.r@platform.example.com", role: "platform_admin", status: "active", city: "Bengaluru", createdAt: "2025-10-01T10:30:00.000Z", lastActiveAt: "2026-10-08T10:30:00.000Z" },
]

/** User IDs for the role switcher's one-click demo accounts. */
export const demoAccounts: Record<UserRole, string> = {
  patient: "u-p-001",
  doctor: "u-d-001",
  hospital_admin: "u-h-001",
  staff: "u-s-001",
  platform_admin: "u-a-001",
}
