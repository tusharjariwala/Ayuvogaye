import {
  Award,
  BarChart3,
  BedDouble,
  BookOpen,
  Building2,
  CalendarCheck,
  CalendarClock,
  Flag,
  GraduationCap,
  Heart,
  Hospital,
  LayoutDashboard,
  Link2,
  MapPin,
  Megaphone,
  MessageSquare,
  Network,
  Bell,
  ScrollText,
  Settings,
  ShieldCheck,
  Star,
  Stethoscope,
  Syringe,
  Tags,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react"
import type { UserRole } from "@/types"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  description?: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const publicNav: NavItem[] = [
  { title: "Hospitals", href: "/hospitals", icon: Hospital },
  { title: "Doctors", href: "/doctors", icon: Stethoscope },
  { title: "Treatments", href: "/treatments", icon: Syringe },
  { title: "Compare", href: "/compare/hospitals", icon: Network },
]

export const accountNav: NavItem[] = [
  { title: "Appointments & enquiries", href: "/account/appointments", icon: CalendarCheck },
  { title: "Favourites", href: "/account/favourites", icon: Heart },
  { title: "Notifications", href: "/account/notifications", icon: Bell },
  { title: "Profile", href: "/account/profile", icon: UserRound },
  { title: "Settings", href: "/account/settings", icon: Settings },
]

const H = "/provider/hospital"
export const hospitalNav: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: `${H}/dashboard`, icon: LayoutDashboard },
      { title: "Analytics", href: `${H}/analytics`, icon: BarChart3 },
    ],
  },
  {
    label: "Leads",
    items: [
      { title: "Enquiries", href: `${H}/enquiries`, icon: MessageSquare },
      { title: "Appointments", href: `${H}/appointments`, icon: CalendarCheck },
      { title: "Availability", href: `${H}/availability`, icon: CalendarClock },
      { title: "Reviews", href: `${H}/reviews`, icon: Star },
    ],
  },
  {
    label: "Profile",
    items: [
      { title: "Hospital profile", href: `${H}/profile`, icon: Building2 },
      { title: "Locations", href: `${H}/locations`, icon: MapPin },
      { title: "Departments", href: `${H}/departments`, icon: Network },
      { title: "Doctors", href: `${H}/doctors`, icon: Stethoscope },
      { title: "Treatments", href: `${H}/treatments`, icon: Syringe },
      { title: "Facilities", href: `${H}/facilities`, icon: BedDouble },
      { title: "Accreditations", href: `${H}/accreditations`, icon: Award },
    ],
  },
  { label: "Account", items: [{ title: "Settings", href: `${H}/settings`, icon: Settings }] },
]

const D = "/provider/doctor"
export const doctorNav: NavGroup[] = [
  { label: "Overview", items: [{ title: "Dashboard", href: `${D}/dashboard`, icon: LayoutDashboard }] },
  {
    label: "Leads",
    items: [
      { title: "Appointments", href: `${D}/appointments`, icon: CalendarCheck },
      { title: "Enquiries", href: `${D}/enquiries`, icon: MessageSquare },
      { title: "Availability", href: `${D}/availability`, icon: CalendarClock },
      { title: "Reviews", href: `${D}/reviews`, icon: Star },
    ],
  },
  {
    label: "Profile",
    items: [
      { title: "Profile", href: `${D}/profile`, icon: UserRound },
      { title: "Qualifications", href: `${D}/qualifications`, icon: GraduationCap },
      { title: "Specialties", href: `${D}/specialties`, icon: Tags },
      { title: "Affiliations", href: `${D}/affiliations`, icon: Link2 },
    ],
  },
  { label: "Account", items: [{ title: "Settings", href: `${D}/settings`, icon: Settings }] },
]

const A = "/admin"
export const adminNav: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: `${A}/dashboard`, icon: LayoutDashboard },
      { title: "Analytics", href: `${A}/analytics`, icon: BarChart3 },
    ],
  },
  {
    label: "Providers",
    items: [
      { title: "Hospitals", href: `${A}/hospitals`, icon: Hospital },
      { title: "Doctors", href: `${A}/doctors`, icon: Stethoscope },
      { title: "Verifications", href: `${A}/verifications`, icon: ShieldCheck },
      { title: "Featured listings", href: `${A}/featured-listings`, icon: Megaphone },
    ],
  },
  {
    label: "Taxonomy",
    items: [
      { title: "Specialties", href: `${A}/specialties`, icon: Tags },
      { title: "Departments", href: `${A}/departments`, icon: Network },
      { title: "Treatments", href: `${A}/treatments`, icon: Syringe },
      { title: "Locations", href: `${A}/locations`, icon: MapPin },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Users", href: `${A}/users`, icon: Users },
      { title: "Enquiries", href: `${A}/enquiries`, icon: MessageSquare },
      { title: "Appointments", href: `${A}/appointments`, icon: CalendarCheck },
      { title: "Reviews", href: `${A}/reviews`, icon: Star },
      { title: "Reported content", href: `${A}/reported-content`, icon: Flag },
      { title: "Content", href: `${A}/content`, icon: BookOpen },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Audit logs", href: `${A}/audit-logs`, icon: ScrollText },
      { title: "Settings", href: `${A}/settings`, icon: Settings },
    ],
  },
]

export const ROLE_SETTINGS: Record<UserRole, string> = {
  patient: "/account/settings",
  doctor: `${D}/settings`,
  hospital_admin: `${H}/settings`,
  staff: `${H}/settings`,
  platform_admin: `${A}/settings`,
}


/** Flat lookup used by breadcrumbs and the command menu. */
export const ALL_NAV_ITEMS: NavItem[] = [
  ...publicNav,
  ...accountNav,
  ...hospitalNav.flatMap((g) => g.items),
  ...doctorNav.flatMap((g) => g.items),
  ...adminNav.flatMap((g) => g.items),
]
