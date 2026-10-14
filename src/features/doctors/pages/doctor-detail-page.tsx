import { UserRound } from "lucide-react"
import { useEffect } from "react"
import { Link, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/states"
import { getDoctorBySlug } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { APP_NAME } from "@/lib/constants"
import { InPageNav } from "@/features/hospitals/components/detail-section"
import { ProviderReviews } from "@/features/hospitals/components/provider-reviews"
import {
  DoctorAffiliations,
  DoctorAppointment,
  DoctorConsultation,
  DoctorHero,
  DoctorOverview,
  DoctorQualifications,
  DoctorSidebar,
  DoctorSpecialties,
  DoctorVerification,
  UnclaimedNotice,
} from "../components/doctor-sections"

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "qualifications", label: "Qualifications" },
  { id: "specialties", label: "Specialties & treatments" },
  { id: "affiliations", label: "Hospitals" },
  { id: "consultation", label: "Availability" },
  { id: "appointment", label: "Request appointment" },
  { id: "reviews", label: "Reviews" },
  { id: "verification", label: "Verification" },
]

export default function DoctorDetailPage() {
  const { slug } = useParams()
  const { data } = useDemoStore()
  const doctor = getDoctorBySlug(data, slug)

  useEffect(() => {
    if (!doctor) return
    const previous = document.title
    document.title = `${doctor.name} · ${APP_NAME}`
    return () => {
      document.title = previous
    }
  }, [doctor])

  if (!doctor || doctor.status === "suspended") {
    return (
      <div className="container-page py-12">
        <h1 className="sr-only">Doctor not found</h1>
        <EmptyState
          icon={UserRound}
          title="Doctor not found"
          description="This doctor profile doesn't exist or is no longer listed."
          action={
            <Button asChild>
              <Link to="/doctors">Browse doctors</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container-page space-y-6 py-8">
      <DoctorHero doctor={doctor} />
      <UnclaimedNotice doctor={doctor} />
      <InPageNav items={NAV} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <DoctorOverview doctor={doctor} />
          <DoctorQualifications doctor={doctor} />
          <DoctorSpecialties doctor={doctor} />
          <DoctorAffiliations doctor={doctor} />
          <DoctorConsultation doctor={doctor} />
          <DoctorAppointment key={doctor.id} doctor={doctor} />
          <ProviderReviews targetType="doctor" targetId={doctor.id} targetName={doctor.name} />
          <DoctorVerification doctor={doctor} />
        </div>
        <aside aria-label="Doctor summary and actions" className="lg:sticky lg:top-32 lg:self-start">
          <DoctorSidebar doctor={doctor} />
        </aside>
      </div>
    </div>
  )
}
