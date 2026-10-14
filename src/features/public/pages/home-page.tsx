import { useEffect } from "react"
import { APP_NAME, APP_TAGLINE } from "@/lib/constants"
import {
  ComparisonPreview,
  DoctorsBySpecialty,
  FeaturedHospitals,
  HomeHero,
  HowItWorks,
  PopularTreatments,
  ProviderCta,
  SampleReviews,
  SpecialtyGrid,
  TrustSection,
} from "../components/home-sections"

export default function HomePage() {
  useEffect(() => {
    document.title = `${APP_NAME} · ${APP_TAGLINE}`
  }, [])

  return (
    <>
      <HomeHero />
      <SpecialtyGrid />
      <FeaturedHospitals />
      <DoctorsBySpecialty />
      <PopularTreatments />
      <ComparisonPreview />
      <HowItWorks />
      <TrustSection />
      <SampleReviews />
      <ProviderCta />
    </>
  )
}
