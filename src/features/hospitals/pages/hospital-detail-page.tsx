import { Building2 } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Link, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { DoctorCard } from "@/components/shared/entity-cards"
import { EmptyState } from "@/components/shared/states"
import { getDoctorsForHospital, getHospitalBySlug } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { APP_NAME } from "@/lib/constants"
import { CompareTray } from "../components/compare-tray"
import { DetailSection, InPageNav } from "../components/detail-section"
import {
  HospitalAccreditations,
  HospitalContactCard,
  HospitalDepartments,
  HospitalFacilities,
  HospitalHero,
  HospitalHours,
  HospitalOverview,
  HospitalTreatments,
  HospitalVerification,
} from "../components/hospital-sections"
import { ProviderReviews } from "../components/provider-reviews"

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "departments", label: "Departments & specialties" },
  { id: "doctors", label: "Doctors" },
  { id: "treatments", label: "Treatments" },
  { id: "facilities", label: "Facilities" },
  { id: "accreditations", label: "Accreditations" },
  { id: "hours", label: "Hours" },
  { id: "reviews", label: "Reviews" },
  { id: "verification", label: "Verification" },
]

export default function HospitalDetailPage() {
  const { slug } = useParams()
  const { data } = useDemoStore()
  const hospital = getHospitalBySlug(data, slug)
  const doctors = useMemo(() => (hospital ? getDoctorsForHospital(data, hospital.id).filter((d) => d.status !== "suspended") : []), [data, hospital])

  useEffect(() => {
    if (!hospital) return
    const previous = document.title
    document.title = `${hospital.name}, ${hospital.city} · ${APP_NAME}`
    return () => {
      document.title = previous
    }
  }, [hospital])

  if (!hospital || hospital.status === "suspended") {
    return (
      <div className="container-page py-12">
        <h1 className="sr-only">Hospital not found</h1>
        <EmptyState
          icon={Building2}
          title="Hospital not found"
          description="This hospital profile doesn't exist or is no longer listed. It may have been removed or renamed."
          action={
            <Button asChild>
              <Link to="/hospitals">Browse hospitals</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container-page space-y-6 py-8 pb-32">
      <HospitalHero hospital={hospital} />
      <InPageNav items={NAV} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <HospitalOverview hospital={hospital} />
          <HospitalDepartments hospital={hospital} />
          <DetailSection
            id="doctors"
            title="Doctors"
            description="Doctors with an active or pending association with this hospital."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to={`/doctors/${hospital.citySlug}/all`}>All doctors in {hospital.city}</Link>
              </Button>
            }
          >
            {doctors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No associated doctors listed yet.</p>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2">
                {doctors.map((d) => (
                  <li key={d.id}>
                    <DoctorCard doctor={d} />
                  </li>
                ))}
              </ul>
            )}
          </DetailSection>
          <HospitalTreatments hospital={hospital} />
          <HospitalFacilities hospital={hospital} />
          <HospitalAccreditations hospital={hospital} />
          <HospitalHours hospital={hospital} />
          <ProviderReviews targetType="hospital" targetId={hospital.id} targetName={hospital.name} />
          <HospitalVerification hospital={hospital} />
        </div>
        <aside aria-label="Contact and actions" className="lg:sticky lg:top-32 lg:self-start">
          <HospitalContactCard hospital={hospital} />
        </aside>
      </div>
      <CompareTray />
    </div>
  )
}
