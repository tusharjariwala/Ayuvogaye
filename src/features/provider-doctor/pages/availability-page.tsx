import { Building2, Phone, Plus, Video, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmDialog, EntityFormDialog } from "@/components/shared/overlays"
import { PageHeader } from "@/components/shared/page-header"
import { getHospital, getHospitalsForDoctor } from "@/data/selectors"
import { InlineError } from "@/features/provider-hospital/components/inline-error"
import { MissingProviderState } from "@/features/provider-hospital/components/portal-widgets"
import { timeToMinutes } from "@/features/provider-hospital/lib/provider-workflow"
import { AVAILABILITY_LABELS, CONSULTATION_MODE_LABELS, WEEKDAYS, WEEKDAY_LABELS } from "@/lib/constants"
import { formatTime } from "@/lib/formatters"
import { createId } from "@/lib/mock-storage"
import type { AvailabilityLevel, ConsultationMode, TimeSlot, Weekday } from "@/types"
import { AvailabilityOverview } from "../components/availability-overview"
import { useManagedDoctor } from "../use-managed-doctor"

interface Draft {
  day: Weekday
  start: string
  end: string
  mode: ConsultationMode
  hospitalId: string
}
type Errors = Partial<Record<keyof Draft, string>>

const MODE_ICON = { in_person: Building2, video: Video, phone: Phone } as const

export default function AvailabilityPage() {
  const { doctor, data, saveDoctor } = useManagedDoctor()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>({ day: "mon", start: "10:00", end: "13:00", mode: "in_person", hospitalId: "" })
  const [errors, setErrors] = useState<Errors>({})

  if (!doctor) return <MissingProviderState kind="doctor" />
  const hospitals = getHospitalsForDoctor(data, doctor.id).filter((h) => data.affiliations.some((a) => a.doctorId === doctor.id && a.hospitalId === h.id && a.status === "active"))
  const slots = doctor.availability

  const persist = (next: TimeSlot[], summary: string) =>
    saveDoctor({ availability: next }, { fields: ["availability"], summary, action: "doctor.availability_updated", material: false, toastTitle: "Availability saved" })

  const openDialog = () => {
    setErrors({})
    setDraft({ day: "mon", start: "10:00", end: "13:00", mode: hospitals.length ? "in_person" : "video", hospitalId: hospitals[0]?.id ?? "" })
    setOpen(true)
  }

  const submit = () => {
    const e: Errors = {}
    if (!draft.start) e.start = "Choose a start time"
    if (!draft.end) e.end = "Choose an end time"
    else if (draft.start && timeToMinutes(draft.end) <= timeToMinutes(draft.start)) e.end = "End time must be after start time"
    if (draft.mode === "in_person" && !draft.hospitalId) e.hospitalId = "Choose the hospital for in-person consultations"
    if (!e.start && !e.end) {
      const clash = slots.find((s) => s.day === draft.day && timeToMinutes(draft.start) < timeToMinutes(s.end) && timeToMinutes(s.start) < timeToMinutes(draft.end))
      if (clash) e.end = `Overlaps with ${formatTime(clash.start)}–${formatTime(clash.end)} on ${WEEKDAY_LABELS[draft.day]}`
    }
    setErrors(e)
    if (Object.keys(e).length > 0) return false
    const slot: TimeSlot = { id: createId("slot"), day: draft.day, start: draft.start, end: draft.end, mode: draft.mode, hospitalId: draft.mode === "in_person" ? draft.hospitalId : undefined }
    persist([...slots, slot], `Added ${CONSULTATION_MODE_LABELS[slot.mode].toLowerCase()} slot on ${WEEKDAY_LABELS[slot.day]} ${slot.start}–${slot.end}`)
  }

  const setLevel = (level: AvailabilityLevel) => {
    saveDoctor({ availabilityLevel: level }, { fields: ["availability"], summary: `Availability set to “${AVAILABILITY_LABELS[level]}”`, action: "doctor.availability_level_changed", material: false, toastTitle: "Availability status updated" })
  }

  const slotError = (key: keyof Draft) => ({ "aria-invalid": !!errors[key], "aria-describedby": errors[key] ? `slot-${key}-err` : undefined })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Availability"
        description="Your weekly consultation timetable. Patients see these as preferred times — requests are not real bookings."
        actions={
          <Button onClick={openDialog}>
            <Plus /> Add slot
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>
              <h2>Weekly timetable</h2>
            </CardTitle>
            <CardDescription>{slots.length} slots per week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <AvailabilityOverview slots={slots} />
            <ul className="divide-y">
              {WEEKDAYS.map((day) => {
                const daySlots = slots.filter((s) => s.day === day).sort((a, b) => a.start.localeCompare(b.start))
                return (
                  <li key={day} className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[7rem_1fr]">
                    <p className="font-medium">{WEEKDAY_LABELS[day]}</p>
                    {daySlots.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Not available</p>
                    ) : (
                      <ul className="flex flex-wrap gap-2">
                        {daySlots.map((s) => {
                          const Icon = MODE_ICON[s.mode]
                          const where = s.mode === "in_person" ? (getHospital(data, s.hospitalId)?.name ?? "In-person") : CONSULTATION_MODE_LABELS[s.mode]
                          const label = `${WEEKDAY_LABELS[day]} ${formatTime(s.start)}–${formatTime(s.end)}`
                          return (
                            <li key={s.id} className="flex items-center gap-2 rounded-lg border bg-card py-1 pr-1 pl-3 text-sm">
                              <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                              <span>
                                <span className="font-medium tabular-nums">
                                  {formatTime(s.start)}–{formatTime(s.end)}
                                </span>
                                <span className="text-muted-foreground"> · {where}</span>
                              </span>
                              <ConfirmDialog
                                title="Remove this slot?"
                                description={`${label} (${where}) will be removed from your timetable.`}
                                confirmLabel="Remove"
                                destructive
                                onConfirm={() => persist(slots.filter((x) => x.id !== s.id), `Removed slot on ${label}`)}
                                trigger={
                                  <Button variant="ghost" size="icon-xs" aria-label={`Remove slot ${label}`}>
                                    <X />
                                  </Button>
                                }
                              />
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:self-start">
          <CardHeader>
            <CardTitle>
              <h2 id="level-heading">Request status</h2>
            </CardTitle>
            <CardDescription>Shown on your public profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={doctor.availabilityLevel} onValueChange={(v) => setLevel(v as AvailabilityLevel)} aria-labelledby="level-heading" className="gap-3">
              {(Object.keys(AVAILABILITY_LABELS) as AvailabilityLevel[]).map((l) => (
                <div key={l} className="flex items-center gap-3 rounded-lg border p-3 has-data-[state=checked]:border-primary">
                  <RadioGroupItem value={l} id={`dl-${l}`} />
                  <Label htmlFor={`dl-${l}`}>{AVAILABILITY_LABELS[l]}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      <EntityFormDialog open={open} onOpenChange={setOpen} title="Add consultation slot" description="Slots repeat weekly. In-person slots must be at an active affiliated hospital." submitLabel="Add slot" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="slot-day">Day</Label>
            <Select value={draft.day} onValueChange={(v) => setDraft((d) => ({ ...d, day: v as Weekday }))}>
              <SelectTrigger id="slot-day" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEEKDAYS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {WEEKDAY_LABELS[d]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="slot-mode">Mode</Label>
            <Select value={draft.mode} onValueChange={(v) => setDraft((d) => ({ ...d, mode: v as ConsultationMode }))}>
              <SelectTrigger id="slot-mode" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CONSULTATION_MODE_LABELS) as ConsultationMode[]).map((m) => (
                  <SelectItem key={m} value={m} disabled={m === "in_person" && hospitals.length === 0}>
                    {CONSULTATION_MODE_LABELS[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="slot-start">Start</Label>
            <Input id="slot-start" type="time" value={draft.start} onChange={(e) => setDraft((d) => ({ ...d, start: e.target.value }))} {...slotError("start")} />
            <InlineError id="slot-start-err" message={errors.start} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slot-end">End</Label>
            <Input id="slot-end" type="time" value={draft.end} onChange={(e) => setDraft((d) => ({ ...d, end: e.target.value }))} {...slotError("end")} />
            <InlineError id="slot-end-err" message={errors.end} />
          </div>
        </div>
        {draft.mode === "in_person" && (
          <div className="space-y-2">
            <Label htmlFor="slot-hospitalId">Hospital</Label>
            <Select value={draft.hospitalId} onValueChange={(v) => setDraft((d) => ({ ...d, hospitalId: v }))}>
              <SelectTrigger id="slot-hospitalId" className="w-full" {...slotError("hospitalId")}>
                <SelectValue placeholder="Choose a hospital" />
              </SelectTrigger>
              <SelectContent>
                {hospitals.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <InlineError id="slot-hospitalId-err" message={errors.hospitalId} />
          </div>
        )}
        {hospitals.length === 0 && <p className="text-xs text-muted-foreground">You have no active hospital affiliations, so only video and phone slots can be added.</p>}
      </EntityFormDialog>
    </div>
  )
}
