import { lazy, type ComponentType, type LazyExoticComponent } from "react"
import { createBrowserRouter, Navigate, Outlet, ScrollRestoration } from "react-router"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PublicLayout } from "@/components/layout/public-layout"
import { RequireRole } from "@/components/layout/require-role"
import { getManagedDoctor, getManagedHospital } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { adminNav, doctorNav, hospitalNav } from "./navigation"

type Page = LazyExoticComponent<ComponentType>

/* ---------- Public ---------- */
const HomePage: Page = lazy(() => import("@/features/public/pages/home-page"))
const InfoPage = lazy(() => import("@/features/public/pages/info-page"))
const NotFoundPage: Page = lazy(() => import("@/features/public/pages/not-found-page"))
const SearchPage: Page = lazy(() => import("@/features/search/pages/search-page"))
const HospitalDirectoryPage: Page = lazy(() => import("@/features/hospitals/pages/hospital-directory-page"))
const HospitalDetailPage: Page = lazy(() => import("@/features/hospitals/pages/hospital-detail-page"))
const DoctorDirectoryPage: Page = lazy(() => import("@/features/doctors/pages/doctor-directory-page"))
const DoctorDetailPage: Page = lazy(() => import("@/features/doctors/pages/doctor-detail-page"))
const TreatmentDirectoryPage: Page = lazy(() => import("@/features/treatments/pages/treatment-directory-page"))
const TreatmentDetailPage: Page = lazy(() => import("@/features/treatments/pages/treatment-detail-page"))
const SpecialtyDetailPage: Page = lazy(() => import("@/features/specialties/pages/specialty-detail-page"))
const CompareHospitalsPage: Page = lazy(() => import("@/features/comparison/pages/compare-hospitals-page"))
const BlogPage: Page = lazy(() => import("@/features/blog/pages/blog-page"))
const VideosPage: Page = lazy(() => import("@/features/videos/pages/videos-page"))

/* ---------- Account ---------- */
const LoginPage: Page = lazy(() => import("@/features/account/pages/login-page"))
const RegisterPage: Page = lazy(() => import("@/features/account/pages/register-page"))
const ResetPasswordPage: Page = lazy(() => import("@/features/account/pages/reset-password-page"))
const FavouritesPage: Page = lazy(() => import("@/features/account/pages/favourites-page"))
const AccountAppointmentsPage: Page = lazy(() => import("@/features/account/pages/appointments-page"))
const ProfilePage: Page = lazy(() => import("@/features/account/pages/profile-page"))
const NotificationsPage: Page = lazy(() => import("@/features/notifications/pages/notifications-page"))
const SettingsPage = lazy(() => import("@/features/settings/pages/settings-page"))

/* ---------- Hospital portal ---------- */
const HP = {
  dashboard: lazy(() => import("@/features/provider-hospital/pages/dashboard-page")),
  profile: lazy(() => import("@/features/provider-hospital/pages/profile-page")),
  locations: lazy(() => import("@/features/provider-hospital/pages/locations-page")),
  departments: lazy(() => import("@/features/provider-hospital/pages/departments-page")),
  doctors: lazy(() => import("@/features/provider-hospital/pages/doctors-page")),
  treatments: lazy(() => import("@/features/provider-hospital/pages/treatments-page")),
  facilities: lazy(() => import("@/features/provider-hospital/pages/facilities-page")),
  accreditations: lazy(() => import("@/features/provider-hospital/pages/accreditations-page")),
  availability: lazy(() => import("@/features/provider-hospital/pages/availability-page")),
  enquiries: lazy(() => import("@/features/provider-hospital/pages/enquiries-page")),
  appointments: lazy(() => import("@/features/provider-hospital/pages/appointments-page")),
  reviews: lazy(() => import("@/features/provider-hospital/pages/reviews-page")),
  analytics: lazy(() => import("@/features/provider-hospital/pages/analytics-page")),
} satisfies Record<string, Page>

/* ---------- Doctor portal ---------- */
const DP = {
  dashboard: lazy(() => import("@/features/provider-doctor/pages/dashboard-page")),
  profile: lazy(() => import("@/features/provider-doctor/pages/profile-page")),
  qualifications: lazy(() => import("@/features/provider-doctor/pages/qualifications-page")),
  specialties: lazy(() => import("@/features/provider-doctor/pages/specialties-page")),
  affiliations: lazy(() => import("@/features/provider-doctor/pages/affiliations-page")),
  availability: lazy(() => import("@/features/provider-doctor/pages/availability-page")),
  enquiries: lazy(() => import("@/features/provider-doctor/pages/enquiries-page")),
  appointments: lazy(() => import("@/features/provider-doctor/pages/appointments-page")),
  reviews: lazy(() => import("@/features/provider-doctor/pages/reviews-page")),
} satisfies Record<string, Page>

/* ---------- Admin ---------- */
const AD = {
  dashboard: lazy(() => import("@/features/admin/pages/dashboard-page")),
  users: lazy(() => import("@/features/admin/pages/users-page")),
  hospitals: lazy(() => import("@/features/admin/pages/hospitals-page")),
  doctors: lazy(() => import("@/features/admin/pages/doctors-page")),
  departments: lazy(() => import("@/features/admin/pages/departments-page")),
  specialties: lazy(() => import("@/features/admin/pages/specialties-page")),
  treatments: lazy(() => import("@/features/admin/pages/treatments-page")),
  locations: lazy(() => import("@/features/admin/pages/locations-page")),
  verifications: lazy(() => import("@/features/admin/pages/verifications-page")),
  enquiries: lazy(() => import("@/features/admin/pages/enquiries-page")),
  appointments: lazy(() => import("@/features/admin/pages/appointments-page")),
  reviews: lazy(() => import("@/features/admin/pages/reviews-page")),
  "reported-content": lazy(() => import("@/features/admin/pages/reported-content-page")),
  content: lazy(() => import("@/features/admin/pages/content-page")),
  "featured-listings": lazy(() => import("@/features/admin/pages/featured-listings-page")),
  "audit-logs": lazy(() => import("@/features/admin/pages/audit-logs-page")),
  analytics: lazy(() => import("@/features/admin/pages/analytics-page")),
} satisfies Record<string, Page>

function toRoutes(pages: Record<string, Page>) {
  return Object.entries(pages).map(([path, Component]) => ({ path, element: <Component /> }))
}

function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  )
}

function HospitalPortalLayout() {
  const { data, currentUser } = useDemoStore()
  return (
    <RequireRole roles={["hospital_admin", "staff"]}>
      <DashboardLayout nav={hospitalNav} portalName="Hospital portal" portalSubtitle={getManagedHospital(data, currentUser)?.name} />
    </RequireRole>
  )
}

function DoctorPortalLayout() {
  const { data, currentUser } = useDemoStore()
  return (
    <RequireRole roles={["doctor"]}>
      <DashboardLayout nav={doctorNav} portalName="Doctor portal" portalSubtitle={getManagedDoctor(data, currentUser)?.name} />
    </RequireRole>
  )
}

function AdminLayout() {
  return (
    <RequireRole roles={["platform_admin"]}>
      <DashboardLayout nav={adminNav} portalName="Platform admin" portalSubtitle="Trust & operations" />
    </RequireRole>
  )
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "hospitals", element: <HospitalDirectoryPage /> },
          { path: "hospitals/:city", element: <HospitalDirectoryPage /> },
          { path: "hospital/:slug", element: <HospitalDetailPage /> },
          { path: "doctors", element: <DoctorDirectoryPage /> },
          { path: "doctors/:city/:specialty", element: <DoctorDirectoryPage /> },
          { path: "doctor/:slug", element: <DoctorDetailPage /> },
          { path: "treatments", element: <TreatmentDirectoryPage /> },
          { path: "treatment/:slug", element: <TreatmentDetailPage /> },
          { path: "specialties/:slug", element: <SpecialtyDetailPage /> },
          { path: "compare/hospitals", element: <CompareHospitalsPage /> },
          { path: "search", element: <SearchPage /> },
          { path: "blog", element: <BlogPage /> },
          { path: "blog/:slug", element: <BlogPage /> },
          { path: "videos", element: <VideosPage /> },
          { path: "videos/:slug", element: <VideosPage /> },
          { path: "about", element: <InfoPage kind="about" /> },
          { path: "contact", element: <InfoPage kind="contact" /> },
          { path: "privacy", element: <InfoPage kind="privacy" /> },
          { path: "terms", element: <InfoPage kind="terms" /> },
          { path: "report-profile", element: <InfoPage kind="report" /> },
          {
            path: "account",
            children: [
              { index: true, element: <Navigate to="/account/appointments" replace /> },
              { path: "login", element: <LoginPage /> },
              { path: "register", element: <RegisterPage /> },
              { path: "reset-password", element: <ResetPasswordPage /> },
              { path: "favourites", element: <RequireRole><FavouritesPage /></RequireRole> },
              { path: "appointments", element: <RequireRole><AccountAppointmentsPage /></RequireRole> },
              { path: "notifications", element: <RequireRole><NotificationsPage /></RequireRole> },
              { path: "profile", element: <RequireRole><ProfilePage /></RequireRole> },
              { path: "settings", element: <RequireRole><SettingsPage variant="patient" /></RequireRole> },
            ],
          },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
      {
        path: "provider/hospital",
        element: <HospitalPortalLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          ...toRoutes(HP),
          { path: "settings", element: <SettingsPage variant="hospital" /> },
        ],
      },
      {
        path: "provider/doctor",
        element: <DoctorPortalLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          ...toRoutes(DP),
          { path: "settings", element: <SettingsPage variant="doctor" /> },
        ],
      },
      { path: "provider", element: <Navigate to="/provider/hospital/dashboard" replace /> },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          ...toRoutes(AD),
          { path: "settings", element: <SettingsPage variant="admin" /> },
        ],
      },
    ],
  },
])
