import { Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { StatusBadge } from "@/components/shared/status-badge"
import type { AppointmentStatus, EnquiryStatus } from "@/types"

const APPOINTMENT_HELP: Record<AppointmentStatus, string> = {
  requested: "Your request was recorded. The provider hasn't responded yet.",
  confirmed: "The provider accepted your preferred date and time.",
  rescheduled: "The provider proposed a different date or time — check the details.",
  completed: "The visit took place. You may leave a review of your experience.",
  cancelled: "The request was cancelled by you or the provider.",
}

const ENQUIRY_HELP: Record<EnquiryStatus, string> = {
  new: "Your enquiry was recorded and is waiting for the provider.",
  contacted: "The provider has reached out using your contact details.",
  under_review: "The provider is reviewing your question or reports.",
  quote_sent: "An illustrative cost estimate was shared — not a final quote.",
  converted: "The enquiry led to an appointment or admission.",
  closed: "No further action is expected on this enquiry.",
}

function StatusList<T extends string>({ kind, help }: { kind: "appointment" | "enquiry"; help: Record<T, string> }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {(Object.keys(help) as T[]).map((status) => (
        <div key={status} className="space-y-1">
          <dt>
            <StatusBadge kind={kind} status={status} />
          </dt>
          <dd className="text-sm text-muted-foreground">{help[status]}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Patient-facing explanation of what each request status means. */
export function StatusGuide() {
  return (
    <Card>
      <CardHeader>
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Info className="size-4 text-primary" aria-hidden="true" /> What do the statuses mean?
        </h2>
        <CardDescription>
          Statuses are simulated in this demo — providers don't receive or act on your requests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple">
          <AccordionItem value="appointment">
            <AccordionTrigger>Appointment statuses</AccordionTrigger>
            <AccordionContent>
              <StatusList kind="appointment" help={APPOINTMENT_HELP} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="enquiry">
            <AccordionTrigger>Enquiry statuses</AccordionTrigger>
            <AccordionContent>
              <StatusList kind="enquiry" help={ENQUIRY_HELP} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
