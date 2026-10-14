import type { ColumnDef } from "@tanstack/react-table"
import { CalendarCheck, CalendarClock, CheckCircle2, Eye, MoreHorizontal, XCircle } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DataTable, DataTableColumnHeader, selectColumn } from "@/components/data-table"
import { ActivityTimeline } from "@/components/shared/activity-timeline"
import { ConfirmDialog, DetailList, DetailsSheet, EntityFormDialog } from "@/components/shared/overlays"
import { StatusBadge } from "@/components/shared/status-badge"
import { getProviderName, getSpecialty, getTreatment } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { APPOINTMENT_STATUS_LABELS, CONSULTATION_MODE_LABELS } from "@/lib/constants"
import { formatDate, formatDateTime, formatTime } from "@/lib/formatters"
import type { Appointment, AppointmentStatus } from "@/types"
import { APPOINTMENT_TRANSITIONS, useLeadActions } from "../use-lead-actions"

export type LeadPerspective = "hospital" | "doctor" | "admin" | "patient"

const STATUS_ICON: Partial<Record<AppointmentStatus, typeof CheckCircle2>> = {
  confirmed: CalendarCheck,
  rescheduled: CalendarClock,
  completed: CheckCircle2,
  cancelled: XCircle,
}

const ACTION_LABEL: Record<AppointmentStatus, string> = {
  requested: "Mark requested",
  confirmed: "Accept / confirm",
  rescheduled: "Reschedule…",
  completed: "Mark completed",
  cancelled: "Reject / cancel",
}

const TIMES = ["09:00", "10:00", "10:30", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

interface AppointmentsTableProps {
  appointments: Appointment[]
  perspective: LeadPerspective
  pageSize?: number
}

/** Appointment management table with status actions, details sheet and timeline. */
export function AppointmentsTable({ appointments, perspective, pageSize = 10 }: AppointmentsTableProps) {
  const { data } = useDemoStore()
  const { changeAppointmentStatus, addAppointmentNote } = useLeadActions()
  const [detailId, setDetailId] = useState<string | null>(null)
  const [reschedule, setReschedule] = useState<Appointment | null>(null)
  const [confirm, setConfirm] = useState<{ appt: Appointment; status: AppointmentStatus } | null>(null)
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("10:00")
  const [note, setNote] = useState("")

  const detail = appointments.find((a) => a.id === detailId) ?? null

  const allowedTransitions = (a: Appointment): AppointmentStatus[] =>
    perspective === "patient" ? (a.status === "requested" || a.status === "confirmed" || a.status === "rescheduled" ? ["cancelled"] : []) : APPOINTMENT_TRANSITIONS[a.status]

  const runAction = (a: Appointment, status: AppointmentStatus) => {
    if (status === "rescheduled") {
      setReschedule(a)
      setNewDate(a.preferredDate.slice(0, 10))
      setNewTime(a.preferredTime)
      return
    }
    setConfirm({ appt: a, status })
  }

  const columns = useMemo<ColumnDef<Appointment, unknown>[]>(() => {
    const cols: ColumnDef<Appointment, unknown>[] = [
      ...(perspective === "patient" ? [] : [selectColumn<Appointment>()]),
      {
        accessorKey: "ref",
        meta: { label: "Reference" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ref" />,
        cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.ref}</span>,
      },
      ...(perspective === "patient"
        ? []
        : [
            {
              accessorKey: "patientName",
              meta: { label: "Patient" },
              header: ({ column }) => <DataTableColumnHeader column={column} title="Patient" />,
              cell: ({ row }) => (
                <div className="min-w-32">
                  <p className="font-medium">{row.original.patientName}</p>
                  <p className="text-xs text-muted-foreground">{row.original.contact}</p>
                </div>
              ),
            } satisfies ColumnDef<Appointment, unknown>,
          ]),
      ...(perspective === "hospital"
        ? []
        : [
            {
              id: "provider",
              meta: { label: "Provider" },
              accessorFn: (a) => getProviderName(data, a),
              header: ({ column }) => <DataTableColumnHeader column={column} title="Provider" />,
              cell: ({ getValue }) => <span className="block max-w-56 truncate">{String(getValue())}</span>,
            } satisfies ColumnDef<Appointment, unknown>,
          ]),
      ...(perspective === "hospital"
        ? [
            {
              id: "doctor",
              meta: { label: "Doctor" },
              accessorFn: (a) => data.doctors.find((d) => d.id === a.doctorId)?.name ?? "Any available",
              header: "Doctor",
            } satisfies ColumnDef<Appointment, unknown>,
          ]
        : []),
      {
        accessorKey: "preferredDate",
        meta: { label: "Preferred date" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Preferred" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {formatDate(row.original.preferredDate)}
            <span className="block text-xs text-muted-foreground">{formatTime(row.original.preferredTime)}</span>
          </span>
        ),
      },
      {
        accessorKey: "mode",
        meta: { label: "Mode" },
        header: "Mode",
        cell: ({ row }) => CONSULTATION_MODE_LABELS[row.original.mode],
      },
      {
        accessorKey: "status",
        meta: { label: "Status" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => <StatusBadge kind="appointment" status={row.original.status} />,
      },
      {
        accessorKey: "updatedAt",
        meta: { label: "Last updated" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
        cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(row.original.updatedAt)}</span>,
      },
      {
        id: "actions",
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const a = row.original
          const transitions = allowedTransitions(a)
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${a.ref}`}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{a.ref}</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setDetailId(a.id)}>
                  <Eye /> View details
                </DropdownMenuItem>
                {transitions.length > 0 && <DropdownMenuSeparator />}
                {transitions.map((s) => {
                  const Icon = STATUS_ICON[s] ?? CheckCircle2
                  return (
                    <DropdownMenuItem key={s} onSelect={() => runAction(a, s)} variant={s === "cancelled" ? "destructive" : "default"}>
                      <Icon /> {perspective === "patient" ? "Cancel request" : ACTION_LABEL[s]}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ]
    return cols
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, perspective])

  return (
    <>
      <DataTable
        columns={columns}
        data={appointments}
        pageSize={pageSize}
        getRowId={(a) => a.id}
        getSearchText={(a) => `${a.ref} ${a.patientName} ${a.contact} ${getProviderName(data, a)}`}
        searchPlaceholder="Search by reference, patient or provider…"
        initialSorting={[{ id: "updatedAt", desc: true }]}
        filters={[
          {
            columnId: "status",
            title: "Status",
            options: (Object.keys(APPOINTMENT_STATUS_LABELS) as AppointmentStatus[]).map((s) => ({
              value: s,
              label: APPOINTMENT_STATUS_LABELS[s],
              count: appointments.filter((a) => a.status === s).length,
            })),
          },
          {
            columnId: "mode",
            title: "Mode",
            options: Object.entries(CONSULTATION_MODE_LABELS).map(([value, label]) => ({ value, label })),
          },
        ]}
        onRowClick={(a) => setDetailId(a.id)}
        exportFilename={perspective === "patient" ? undefined : "appointments"}
        exportColumns={[
          { header: "Reference", value: (a) => a.ref },
          { header: "Patient", value: (a) => a.patientName },
          { header: "Provider", value: (a) => getProviderName(data, a) },
          { header: "Preferred date", value: (a) => formatDate(a.preferredDate) },
          { header: "Time", value: (a) => a.preferredTime },
          { header: "Mode", value: (a) => CONSULTATION_MODE_LABELS[a.mode] },
          { header: "Status", value: (a) => APPOINTMENT_STATUS_LABELS[a.status] },
        ]}
        bulkActions={
          perspective === "patient"
            ? undefined
            : (rows, clear) => {
                const confirmable = rows.filter((r) => APPOINTMENT_TRANSITIONS[r.status].includes("confirmed"))
                return (
                  <Button
                    size="sm"
                    disabled={confirmable.length === 0}
                    onClick={() => {
                      confirmable.forEach((r) => changeAppointmentStatus(r, "confirmed"))
                      clear()
                    }}
                  >
                    <CalendarCheck /> Confirm {confirmable.length}
                  </Button>
                )
              }
        }
        emptyTitle="No appointments"
        emptyDescription="Appointment requests will appear here."
        caption="Appointments"
      />

      <DetailsSheet
        open={!!detail}
        onOpenChange={(o) => !o && setDetailId(null)}
        title={detail ? `Appointment ${detail.ref}` : ""}
        description="Simulated appointment request — no real booking exists."
        footer={
          detail &&
          allowedTransitions(detail).map((s) => (
            <Button key={s} variant={s === "cancelled" ? "destructive" : s === "confirmed" ? "default" : "outline"} onClick={() => runAction(detail, s)}>
              {perspective === "patient" ? "Cancel request" : ACTION_LABEL[s]}
            </Button>
          ))
        }
      >
        {detail && (
          <div className="space-y-6">
            <DetailList
              items={[
                { label: "Status", value: <StatusBadge kind="appointment" status={detail.status} /> },
                { label: "Patient", value: detail.patientName },
                { label: "Contact", value: detail.contact },
                { label: "Provider", value: getProviderName(data, detail) },
                { label: "Specialty", value: getSpecialty(data, detail.specialtyId)?.name ?? "—" },
                { label: "Treatment", value: getTreatment(data, detail.treatmentId)?.name ?? "—" },
                { label: "Preferred", value: `${formatDate(detail.preferredDate)} · ${formatTime(detail.preferredTime)}` },
                { label: "Mode", value: CONSULTATION_MODE_LABELS[detail.mode] },
                { label: "Message", value: detail.message ?? "—" },
                { label: "Requested", value: formatDateTime(detail.createdAt) },
              ]}
            />
            <section aria-labelledby="appt-timeline" className="space-y-3">
              <h3 id="appt-timeline" className="font-semibold">
                Activity timeline
              </h3>
              <ActivityTimeline events={detail.timeline} />
            </section>
            {perspective !== "patient" && (
              <section className="space-y-2">
                <Label htmlFor="appt-note">Add internal note</Label>
                <Textarea id="appt-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Visible only to your team (demo)" />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={note.trim().length < 2}
                  onClick={() => {
                    addAppointmentNote(detail, note.trim())
                    setNote("")
                  }}
                >
                  Add note
                </Button>
              </section>
            )}
          </div>
        )}
      </DetailsSheet>

      <EntityFormDialog
        open={!!reschedule}
        onOpenChange={(o) => !o && setReschedule(null)}
        title={`Reschedule ${reschedule?.ref ?? ""}`}
        description="Propose a new date and time. The patient sees the update in their (demo) account."
        submitLabel="Reschedule"
        onSubmit={() => {
          if (!reschedule || !newDate) return false
          changeAppointmentStatus(reschedule, "rescheduled", { newDate: new Date(`${newDate}T00:00:00`).toISOString(), newTime })
          setReschedule(null)
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="resched-date">New date</Label>
            <Input id="resched-date" type="date" value={newDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setNewDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resched-time">New time</Label>
            <Select value={newTime} onValueChange={setNewTime}>
              <SelectTrigger id="resched-time" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {formatTime(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </EntityFormDialog>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm ? `${perspective === "patient" ? "Cancel" : ACTION_LABEL[confirm.status]} ${confirm.appt.ref}?` : ""}
        description={
          confirm?.status === "cancelled"
            ? "The request will be marked cancelled. This is a local demo change."
            : "The status will be updated locally and added to the activity timeline."
        }
        confirmLabel={confirm ? (perspective === "patient" ? "Cancel request" : APPOINTMENT_STATUS_LABELS[confirm.status]) : "Confirm"}
        destructive={confirm?.status === "cancelled"}
        withNote
        noteLabel={confirm?.status === "cancelled" ? "Reason" : "Note"}
        onConfirm={(n) => {
          if (confirm) changeAppointmentStatus(confirm.appt, confirm.status, { note: n })
          setConfirm(null)
        }}
      />
    </>
  )
}
