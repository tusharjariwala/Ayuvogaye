import { CalendarCheck, MessageSquare } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { CONSULTATION_MODE_LABELS } from "@/lib/constants"
import { formatDate, formatRelative, formatTime } from "@/lib/formatters"
import type { Appointment, Enquiry } from "@/types"
import { getUpcomingAppointments } from "../lib/provider-workflow"

export function RecentEnquiriesCard({ enquiries, href, limit = 5 }: { enquiries: Enquiry[]; href: string; limit?: number }) {
  const shown = [...enquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent enquiries</CardTitle>
        <CardDescription>Latest {shown.length} of {enquiries.length}</CardDescription>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link to={href}>View all</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {shown.length === 0 ? (
          <p className="text-sm text-muted-foreground">No enquiries yet.</p>
        ) : (
          <ul className="divide-y">
            {shown.map((e) => (
              <li key={e.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <MessageSquare className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{e.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.patientName} · <time dateTime={e.createdAt}>{formatRelative(e.createdAt)}</time>
                  </p>
                </div>
                <StatusBadge kind="enquiry" status={e.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

/** Next confirmed / rescheduled / requested appointments from today onwards. */
export function UpcomingAppointmentsCard({ appointments, href, limit = 5, describe }: { appointments: Appointment[]; href: string; limit?: number; describe?: (a: Appointment) => string }) {
  const upcoming = getUpcomingAppointments(appointments)
  const shown = upcoming.slice(0, limit)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming appointments</CardTitle>
        <CardDescription>{upcoming.length} requested or confirmed from today</CardDescription>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link to={href}>View all</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {shown.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming appointment requests.</p>
        ) : (
          <ul className="divide-y">
            {shown.map((a) => (
              <li key={a.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CalendarCheck className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.patientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(a.preferredDate, "EEE d MMM")} · {formatTime(a.preferredTime)} · {CONSULTATION_MODE_LABELS[a.mode]}
                    {describe ? ` · ${describe(a)}` : ""}
                  </p>
                </div>
                <StatusBadge kind="appointment" status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
