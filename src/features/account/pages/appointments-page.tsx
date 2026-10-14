import { CalendarCheck, CheckCircle2, Hourglass, MessageSquare } from "lucide-react"
import { useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DemoNotice } from "@/components/shared/demo-notice"
import { StatCard } from "@/components/shared/stat-card"
import { AppointmentsTable } from "@/features/appointments/components/appointments-table"
import { EnquiriesTable } from "@/features/enquiries/components/enquiries-table"
import { useDemoStore } from "@/hooks/use-demo-store"
import { AccountShell } from "../components/account-shell"
import { NewRequestDialog } from "../components/new-request-dialog"
import { StatusGuide } from "../components/status-guide"

type Tab = "appointments" | "enquiries"

export default function AppointmentsPage() {
  const { data, currentUser } = useDemoStore()
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get("tab") === "enquiries" ? "enquiries" : "appointments"

  const appointments = useMemo(
    () => data.appointments.filter((a) => currentUser && a.patientId === currentUser.id),
    [data.appointments, currentUser],
  )
  const enquiries = useMemo(
    () => data.enquiries.filter((e) => currentUser && e.patientId === currentUser.id),
    [data.enquiries, currentUser],
  )

  const [today] = useState(() => new Date().toISOString().slice(0, 10))
  const stats = useMemo(() => {
    return {
      upcoming: appointments.filter(
        (a) => (a.status === "confirmed" || a.status === "rescheduled") && a.preferredDate.slice(0, 10) >= today,
      ).length,
      awaiting:
        appointments.filter((a) => a.status === "requested").length +
        enquiries.filter((e) => e.status === "new" || e.status === "under_review").length,
      completed: appointments.filter((a) => a.status === "completed").length + enquiries.filter((e) => e.status === "converted").length,
    }
  }, [appointments, enquiries, today])

  const changeTab = (value: string) => {
    const next = new URLSearchParams(params)
    if (value === "enquiries") next.set("tab", "enquiries")
    else next.delete("tab")
    setParams(next, { replace: true })
  }

  return (
    <AccountShell
      title="Appointments & enquiries"
      description="Track the requests you've sent to hospitals and doctors."
      actions={<NewRequestDialog defaultTab={tab === "enquiries" ? "enquiry" : "appointment"} />}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Upcoming" value={stats.upcoming} icon={CalendarCheck} hint="Confirmed or rescheduled" />
        <StatCard label="Awaiting response" value={stats.awaiting} icon={Hourglass} hint="Requested or new enquiries" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} hint="Visits & converted enquiries" />
      </div>

      <DemoNotice>
        Request statuses are simulated. No provider receives your request and nothing here is a confirmed booking or medical
        advice.
      </DemoNotice>

      <StatusGuide />

      <Tabs value={tab} onValueChange={changeTab} className="gap-4">
        <TabsList>
          <TabsTrigger value="appointments" className="px-3">
            <CalendarCheck aria-hidden="true" /> Appointments
            <Badge variant="muted" className="ml-0.5 px-1.5 tabular-nums">
              {appointments.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="enquiries" className="px-3">
            <MessageSquare aria-hidden="true" /> Enquiries
            <Badge variant="muted" className="ml-0.5 px-1.5 tabular-nums">
              {enquiries.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="appointments">
          <AppointmentsTable appointments={appointments} perspective="patient" />
        </TabsContent>
        <TabsContent value="enquiries">
          <EnquiriesTable enquiries={enquiries} perspective="patient" />
        </TabsContent>
      </Tabs>
    </AccountShell>
  )
}
