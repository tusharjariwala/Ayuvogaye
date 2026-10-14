import { Clock, Mail, MapPin, Phone } from "lucide-react"
import { useEffect, type ReactNode } from "react"
import { Link } from "react-router"
import { Card, CardContent } from "@/components/ui/card"
import { DemoNotice } from "@/components/shared/demo-notice"
import { PageHeader } from "@/components/shared/page-header"
import { useDemoStore } from "@/hooks/use-demo-store"
import { APP_NAME } from "@/lib/constants"
import { ContactForm, ReportPicker } from "../components/info-forms"

export type InfoKind = "about" | "contact" | "privacy" | "terms" | "report"

interface InfoSection {
  heading: string
  body: ReactNode
}

interface InfoContent {
  title: string
  eyebrow: string
  description: string
  sections: InfoSection[]
}

const PLACEHOLDER = "[Template placeholder — replace with your organisation's approved text.]"

function getContent(kind: InfoKind, supportEmail: string): InfoContent {
  switch (kind) {
    case "about":
      return {
        title: `About ${APP_NAME}`,
        eyebrow: "Company",
        description: "A transparent way to discover hospitals, doctors and treatments across India.",
        sections: [
          {
            heading: "Our mission",
            body: `${APP_NAME} helps people find and compare healthcare providers using clear, structured information. We show where every detail comes from — platform-verified, provider-submitted or editorial — so you can make informed choices. ${PLACEHOLDER}`,
          },
          {
            heading: "How we stay neutral",
            body: "We don't rank providers or label anyone “best”. Sponsored placements are always labelled and never affect verification status, reviews or comparison results.",
          },
          {
            heading: "What verification means",
            body: "Verification confirms selected profile details against evidence submitted by the provider. It is not an endorsement or an assessment of clinical quality or outcomes.",
          },
          {
            heading: "This is a demo template",
            body: "All hospitals, doctors, reviews and numbers on this site are fictional. Appointment requests, enquiries and verifications are simulated in your browser.",
          },
        ],
      }
    case "contact":
      return {
        title: "Contact us",
        eyebrow: "Support",
        description: "Questions about a listing, your account or partnerships? Get in touch.",
        sections: [],
      }
    case "privacy":
      return {
        title: "Privacy policy",
        eyebrow: "Legal",
        description: "How this template describes the handling of personal information.",
        sections: [
          { heading: "1. Information we collect", body: `Account details you provide (such as name and email), requests you submit, and basic usage data. ${PLACEHOLDER}` },
          { heading: "2. Health information", body: "Do not submit sensitive health information through forms. Requests should contain only what a provider needs to contact you." },
          { heading: "3. How information is used", body: `To show your requests to the provider you contacted, to operate your account and to improve the service. ${PLACEHOLDER}` },
          { heading: "4. Sharing", body: `Information is shared with the provider you choose to contact and with service providers acting on our behalf. ${PLACEHOLDER}` },
          { heading: "5. Your choices", body: `You can update or delete your account details and change notification preferences in account settings. ${PLACEHOLDER}` },
          { heading: "6. Demo storage", body: "In this demo, everything you enter is stored only in your browser's local storage and can be cleared with “Reset demo data”." },
        ],
      }
    case "terms":
      return {
        title: "Terms of use",
        eyebrow: "Legal",
        description: "The rules for using this healthcare discovery template.",
        sections: [
          { heading: "1. Information only", body: "Content on this site is general information and is not medical advice. Always consult a qualified doctor about your health. In an emergency, call 112." },
          { heading: "2. No guarantee of availability", body: "Appointment requests and enquiries are requests only. Providers confirm availability, fees and treatment suitability directly." },
          { heading: "3. Provider information", body: "Profile details are provider-submitted unless marked platform-verified. Verification is limited in scope and does not rate clinical quality." },
          { heading: "4. Reviews", body: `Reviews describe individual experiences and are moderated against our guidelines. ${PLACEHOLDER}` },
          { heading: "5. Sponsored content", body: "Sponsored placements are paid and clearly labelled. They do not affect verification or comparison results." },
          { heading: "6. Changes", body: `We may update these terms. ${PLACEHOLDER}` },
        ],
      }
    case "report":
      return {
        title: "Report a profile",
        eyebrow: "Trust & safety",
        description: "Help keep listings accurate. Tell us about outdated, inaccurate or inappropriate information.",
        sections: [
          { heading: "What you can report", body: "Incorrect contact details, wrong specialties or facilities, impersonation, fake profiles, or inappropriate content." },
          { heading: "What happens next", body: "Reports go to the platform moderation queue. A reviewer checks the profile and may contact the provider or update the listing. In this demo, the review is simulated." },
          { heading: "Medical concerns", body: `If you have a concern about care you received, contact the provider directly or the relevant medical council. For urgent help, call 112. Support: ${supportEmail}` },
        ],
      }
  }
}

export default function InfoPage({ kind }: { kind: InfoKind }) {
  const { settings } = useDemoStore()
  const supportEmail = settings.platform.supportEmail
  const content = getContent(kind, supportEmail)

  useEffect(() => {
    const previous = document.title
    document.title = `${content.title} · ${APP_NAME}`
    return () => {
      document.title = previous
    }
  }, [content.title])

  return (
    <div className="container-page space-y-8 py-10">
      <PageHeader
        eyebrow={<p className="text-sm font-medium text-primary">{content.eyebrow}</p>}
        title={content.title}
        description={content.description}
      />

      {kind === "contact" ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <ContactForm />
          <Card className="gap-0 py-0 shadow-soft lg:self-start">
            <CardContent className="space-y-4 p-5">
              <h2 className="font-semibold">Other ways to reach us</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <a href={`mailto:${supportEmail}`} className="break-all hover:text-primary hover:underline">
                    {supportEmail}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  +91 00000 00000 (placeholder)
                </li>
                <li className="flex gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  Mon–Sat, 9:00 am – 6:00 pm IST
                </li>
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  Sample Office, Demo Road, Pune 411001
                </li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Need to fix a listing? Use <Link to="/report-profile" className="text-primary hover:underline">Report a profile</Link>.
                We can't give medical advice.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <article className="max-w-3xl space-y-6">
            {content.sections.map((s) => (
              <section key={s.heading} className="space-y-2">
                <h2 className="text-lg font-semibold">{s.heading}</h2>
                <p className="leading-relaxed text-muted-foreground">{s.body}</p>
              </section>
            ))}
            {(kind === "privacy" || kind === "terms") && <p className="text-xs text-muted-foreground">Last updated: template placeholder date.</p>}
          </article>
          <div className="space-y-4 lg:self-start">
            {kind === "report" && <ReportPicker />}
            <DemoNotice />
          </div>
        </div>
      )}
    </div>
  )
}
