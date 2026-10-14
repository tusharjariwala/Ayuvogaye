import { CalendarCheck, CalendarClock, CheckCircle2, Inbox, MessageSquare, Send, TrendingUp, XCircle } from "lucide-react"
import { StatCard } from "@/components/shared/stat-card"
import { formatPercent } from "@/lib/formatters"
import type { Appointment, Enquiry } from "@/types"

export function EnquiryStats({ enquiries }: { enquiries: Enquiry[] }) {
  const count = (statuses: Enquiry["status"][]) => enquiries.filter((e) => statuses.includes(e.status)).length
  const converted = count(["converted"])
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <StatCard label="New" value={count(["new"])} icon={Inbox} hint="Awaiting first response" />
      <StatCard label="In progress" value={count(["contacted", "under_review"])} icon={MessageSquare} hint="Contacted or under review" />
      <StatCard label="Quote sent" value={count(["quote_sent"])} icon={Send} hint="Illustrative estimates shared" />
      <StatCard
        label="Converted"
        value={converted}
        icon={TrendingUp}
        hint={enquiries.length ? `${formatPercent((converted / enquiries.length) * 100)} of ${enquiries.length} enquiries` : "No enquiries yet"}
      />
    </div>
  )
}

export function AppointmentStats({ appointments }: { appointments: Appointment[] }) {
  const count = (statuses: Appointment["status"][]) => appointments.filter((a) => statuses.includes(a.status)).length
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <StatCard label="Requested" value={count(["requested"])} icon={CalendarClock} hint="Needs a response" />
      <StatCard label="Upcoming" value={count(["confirmed", "rescheduled"])} icon={CalendarCheck} hint="Confirmed or rescheduled" />
      <StatCard label="Completed" value={count(["completed"])} icon={CheckCircle2} />
      <StatCard label="Cancelled" value={count(["cancelled"])} icon={XCircle} />
    </div>
  )
}
