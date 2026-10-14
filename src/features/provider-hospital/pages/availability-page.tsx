import { Copy, Save } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { PageHeader } from "@/components/shared/page-header"
import { AVAILABILITY_LABELS, WEEKDAYS, WEEKDAY_LABELS } from "@/lib/constants"
import type { AvailabilityLevel, Hospital, OperatingHours } from "@/types"
import { InlineError } from "../components/inline-error"
import { MissingProviderState } from "../components/portal-widgets"
import { timeToMinutes } from "../lib/provider-workflow"
import { useManagedHospital } from "../use-managed-hospital"

const LEVEL_HINTS: Record<AvailabilityLevel, string> = {
  available: "Patients can send appointment requests as usual.",
  limited: "Requests are accepted, with a note that slots are limited.",
  unavailable: "The request button is replaced with an enquiry option.",
}

function normalise(hours: OperatingHours[]): OperatingHours[] {
  return WEEKDAYS.map((day) => hours.find((h) => h.day === day) ?? { day, open: "09:00", close: "18:00", closed: true })
}

function AvailabilityEditor({ hospital }: { hospital: Hospital }) {
  const { saveHospital } = useManagedHospital()
  const [hours, setHours] = useState<OperatingHours[]>(() => normalise(hospital.operatingHours))
  const [level, setLevel] = useState<AvailabilityLevel>(hospital.appointmentAvailability)
  const [emergency, setEmergency] = useState(hospital.emergency ?? { available: false, hours: "", ambulance: false })
  const [submitted, setSubmitted] = useState(false)

  const errors = Object.fromEntries(
    hours
      .filter((h) => !h.closed && (!h.open || !h.close || timeToMinutes(h.close) <= timeToMinutes(h.open)))
      .map((h) => [h.day, "Closing time must be after opening time"]),
  ) as Partial<Record<string, string>>
  const emergencyError = emergency.available && emergency.hours.trim().length < 2 ? "Enter emergency hours, e.g. 24x7" : undefined
  const hasErrors = Object.keys(errors).length > 0 || !!emergencyError

  const setDay = (day: string, patch: Partial<OperatingHours>) => setHours((prev) => prev.map((h) => (h.day === day ? { ...h, ...patch } : h)))

  const copyMonday = () => {
    const mon = hours.find((h) => h.day === "mon")
    if (!mon) return
    setHours((prev) => prev.map((h) => (["tue", "wed", "thu", "fri"].includes(h.day) ? { ...h, open: mon.open, close: mon.close, closed: mon.closed } : h)))
  }

  const save = () => {
    setSubmitted(true)
    if (hasErrors) return
    saveHospital(
      {
        operatingHours: hours.map((h) => (h.closed ? { day: h.day, open: "00:00", close: "00:00", closed: true } : { day: h.day, open: h.open, close: h.close })),
        appointmentAvailability: level,
        emergency: emergency.available || emergency.ambulance ? { ...emergency, hours: emergency.available ? emergency.hours.trim() : "" } : null,
      },
      {
        fields: ["operatingHours", "emergency"],
        summary: `Updated operating hours, emergency hours and availability (${AVAILABILITY_LABELS[level].toLowerCase()})`,
        action: "hospital.availability_updated",
        material: false,
        toastTitle: "Availability saved",
      },
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Availability" description="Operating hours and whether you are accepting appointment requests. Shown on your public profile." />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>
              <h2>Operating hours</h2>
            </CardTitle>
            <CardDescription>OPD hours for each day. Use 00:00–23:59 for round-the-clock services.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {hours.map((h) => {
                const err = submitted ? errors[h.day] : undefined
                const label = WEEKDAY_LABELS[h.day]
                return (
                  <li key={h.day} className="grid gap-3 py-3 first:pt-0 last:pb-0 sm:grid-cols-[7rem_auto_1fr] sm:items-center">
                    <p className="font-medium">{label}</p>
                    <div className="flex items-center gap-2">
                      <Switch id={`open-${h.day}`} checked={!h.closed} onCheckedChange={(v) => setDay(h.day, { closed: !v })} />
                      <Label htmlFor={`open-${h.day}`} className="w-14 font-normal text-muted-foreground">
                        {h.closed ? "Closed" : "Open"}
                      </Label>
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Label htmlFor={`from-${h.day}`} className="sr-only">
                          {label} opening time
                        </Label>
                        <Input id={`from-${h.day}`} type="time" className="w-32" value={h.closed ? "" : h.open} disabled={h.closed} onChange={(e) => setDay(h.day, { open: e.target.value })} aria-invalid={!!err} aria-describedby={err ? `err-${h.day}` : undefined} />
                        <span className="text-sm text-muted-foreground" aria-hidden="true">
                          to
                        </span>
                        <Label htmlFor={`to-${h.day}`} className="sr-only">
                          {label} closing time
                        </Label>
                        <Input id={`to-${h.day}`} type="time" className="w-32" value={h.closed ? "" : h.close} disabled={h.closed} onChange={(e) => setDay(h.day, { close: e.target.value })} aria-invalid={!!err} aria-describedby={err ? `err-${h.day}` : undefined} />
                      </div>
                      <InlineError id={`err-${h.day}`} message={err} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </CardContent>
          <CardFooter className="border-t">
            <Button variant="outline" size="sm" onClick={copyMonday}>
              <Copy /> Copy Monday to Tue–Fri
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2 id="level-heading">Appointment requests</h2>
              </CardTitle>
              <CardDescription>Requests are simulated; no real bookings are made.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={level} onValueChange={(v) => setLevel(v as AvailabilityLevel)} aria-labelledby="level-heading" className="gap-3">
                {(Object.keys(AVAILABILITY_LABELS) as AvailabilityLevel[]).map((l) => (
                  <div key={l} className="flex items-start gap-3 rounded-lg border p-3 has-data-[state=checked]:border-primary">
                    <RadioGroupItem value={l} id={`level-${l}`} aria-describedby={`level-${l}-hint`} className="mt-0.5" />
                    <div>
                      <Label htmlFor={`level-${l}`}>{AVAILABILITY_LABELS[l]}</Label>
                      <p id={`level-${l}-hint`} className="text-xs text-muted-foreground">
                        {LEVEL_HINTS[l]}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Emergency</h2>
              </CardTitle>
              <CardDescription>Only list emergency care you actually provide.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="em-available">Emergency department</Label>
                <Switch id="em-available" checked={emergency.available} onCheckedChange={(v) => setEmergency((e) => ({ ...e, available: v }))} />
              </div>
              {emergency.available && (
                <div className="space-y-2">
                  <Label htmlFor="em-hours">Emergency hours</Label>
                  <Input id="em-hours" value={emergency.hours} placeholder="24x7" onChange={(e) => setEmergency((s) => ({ ...s, hours: e.target.value }))} aria-invalid={submitted && !!emergencyError} aria-describedby={submitted && emergencyError ? "em-hours-err" : undefined} />
                  <InlineError id="em-hours-err" message={submitted ? emergencyError : undefined} />
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="em-ambulance">Ambulance service</Label>
                <Switch id="em-ambulance" checked={emergency.ambulance} onCheckedChange={(v) => setEmergency((e) => ({ ...e, ambulance: v }))} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={save}>
          <Save /> Save availability
        </Button>
      </div>
    </div>
  )
}

export default function AvailabilityPage() {
  const { hospital } = useManagedHospital()
  if (!hospital) return <MissingProviderState kind="hospital" />
  return <AvailabilityEditor key={hospital.updatedAt} hospital={hospital} />
}
