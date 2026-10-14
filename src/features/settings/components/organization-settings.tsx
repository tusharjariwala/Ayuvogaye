import { ArrowRight, Building2, Stethoscope } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { DetailList } from "@/components/shared/overlays"
import { EmptyState } from "@/components/shared/states"
import { StatusBadge } from "@/components/shared/status-badge"
import { VerificationBadge } from "@/components/shared/verification-badge"
import { getManagedDoctor, getManagedHospital, getSpecialty } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { formatPercent } from "@/lib/formatters"

function HospitalOrganization() {
  const { data, currentUser } = useDemoStore()
  const hospital = getManagedHospital(data, currentUser)
  if (!hospital) {
    return <EmptyState icon={Building2} title="No hospital linked" description="This account isn't linked to a hospital profile." />
  }
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold">{hospital.name}</h2>
        <CardDescription>Organisation details are edited from the hospital profile.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DetailList
          items={[
            { label: "Type", value: hospital.type },
            { label: "City", value: `${hospital.city}, ${hospital.state}` },
            { label: "Address", value: hospital.address },
            { label: "Phone", value: hospital.phone },
            { label: "Email", value: <span className="break-all">{hospital.email}</span> },
            { label: "Verification", value: <VerificationBadge status={hospital.verification.status} lastVerifiedAt={hospital.verification.lastVerifiedAt} /> },
            { label: "Profile completeness", value: formatPercent(hospital.profileCompleteness) },
            { label: "Locations", value: hospital.locations.length },
          ]}
        />
        <Button asChild variant="outline">
          <Link to="/provider/hospital/profile">
            Edit hospital profile <ArrowRight />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function DoctorOrganization() {
  const { data, currentUser } = useDemoStore()
  const doctor = getManagedDoctor(data, currentUser)
  if (!doctor) {
    return <EmptyState icon={Stethoscope} title="No doctor profile linked" description="This account isn't linked to a doctor profile." />
  }
  const affiliations = data.affiliations.filter((a) => a.doctorId === doctor.id)
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold">Practice & affiliations</h2>
        <CardDescription>
          {doctor.name} · {getSpecialty(data, doctor.specialtyId)?.name ?? "Specialty not set"} · {doctor.city}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {affiliations.length ? (
          <ul className="divide-y rounded-lg border">
            {affiliations.map((a) => {
              const hospital = data.hospitals.find((h) => h.id === a.hospitalId)
              return (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{hospital?.name ?? "Unknown hospital"}</p>
                    <p className="text-xs text-muted-foreground">{a.role}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No hospital affiliations yet.</p>
        )}
        <Button asChild variant="outline">
          <Link to="/provider/doctor/affiliations">
            Manage affiliations <ArrowRight />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function PlatformOrganization() {
  const { data, settings } = useDemoStore()
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold">{settings.platform.platformName}</h2>
        <CardDescription>Operator details would be configured with your legal and billing setup.</CardDescription>
      </CardHeader>
      <CardContent>
        <DetailList
          items={[
            { label: "Legal entity", value: "Placeholder — add your company details" },
            { label: "Support email", value: settings.platform.supportEmail },
            { label: "Listed hospitals", value: data.hospitals.length },
            { label: "Listed doctors", value: data.doctors.length },
            { label: "Platform admins", value: data.users.filter((u) => u.role === "platform_admin").length },
          ]}
        />
      </CardContent>
    </Card>
  )
}

export function OrganizationSettings({ variant }: { variant: "hospital" | "doctor" | "admin" }) {
  if (variant === "hospital") return <HospitalOrganization />
  if (variant === "doctor") return <DoctorOrganization />
  return <PlatformOrganization />
}
