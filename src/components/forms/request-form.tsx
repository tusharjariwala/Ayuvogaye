import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, CheckCircle2, Loader2, ShieldAlert } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { Link } from "react-router"
import { toast } from "sonner"
import { z } from "zod"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DemoNotice } from "@/components/shared/demo-notice"
import { FormField } from "@/components/forms/form-field"
import { getDoctor, getHospital, getProviderName } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { CONSULTATION_MODE_LABELS } from "@/lib/constants"
import { formatDate, formatTime } from "@/lib/formatters"
import { createId, nowISO } from "@/lib/mock-storage"
import { cn } from "@/lib/utils"
import type { Appointment, ConsultationMode, Enquiry } from "@/types"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MOBILE_RE = /^(\+91)?[6-9]\d{9}$/

const TIME_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "18:00"]

const requestSchema = z
  .object({
    kind: z.enum(["appointment", "enquiry"]),
    patientName: z.string().trim().min(2, "Enter the patient's name").max(80, "Name is too long"),
    contact: z
      .string()
      .trim()
      .min(1, "Enter an email address or mobile number")
      .refine((v) => EMAIL_RE.test(v) || MOBILE_RE.test(v.replace(/[\s-]/g, "")), "Enter a valid email or 10-digit Indian mobile number"),
    providerKey: z.string().min(1, "Choose a hospital or doctor"),
    specialtyId: z.string(),
    treatmentId: z.string(),
    subject: z.string().trim().max(120, "Keep the subject under 120 characters"),
    preferredDate: z.date().optional(),
    preferredTime: z.string(),
    mode: z.enum(["in_person", "video", "phone"]),
    message: z.string().max(500, "Keep the message under 500 characters"),
    consent: z.boolean().refine((v) => v, "Please confirm to continue"),
  })
  .superRefine((v, ctx) => {
    if (v.kind === "appointment") {
      if (!v.preferredDate) ctx.addIssue({ code: "custom", path: ["preferredDate"], message: "Choose a preferred date" })
      if (!v.preferredTime) ctx.addIssue({ code: "custom", path: ["preferredTime"], message: "Choose a preferred time" })
    } else if (v.subject.length < 4) {
      ctx.addIssue({ code: "custom", path: ["subject"], message: "Add a short subject (at least 4 characters)" })
    }
  })

type RequestValues = z.infer<typeof requestSchema>

interface RequestFormProps {
  kind: "appointment" | "enquiry"
  hospitalId?: string
  doctorId?: string
  defaultSpecialtyId?: string
  defaultTreatmentId?: string
  onSubmitted?: (ref: string) => void
  className?: string
}

const NONE = "__none"

function RequestForm({ kind, hospitalId, doctorId, defaultSpecialtyId, defaultTreatmentId, onSubmitted, className }: RequestFormProps) {
  const { data, currentUser, create, notify, logAudit } = useDemoStore()
  const [submitted, setSubmitted] = useState<Appointment | Enquiry | null>(null)

  const fixedProvider = doctorId ? `doctor:${doctorId}` : hospitalId ? `hospital:${hospitalId}` : ""
  const doctor = getDoctor(data, doctorId)

  const form = useForm<RequestValues>({
    resolver: zodResolver(requestSchema) as Resolver<RequestValues>,
    defaultValues: {
      kind,
      patientName: currentUser?.role === "patient" ? currentUser.name : "",
      contact: currentUser?.role === "patient" ? currentUser.email : "",
      providerKey: fixedProvider,
      specialtyId: defaultSpecialtyId ?? doctor?.specialtyId ?? "",
      treatmentId: defaultTreatmentId ?? "",
      subject: "",
      preferredDate: undefined,
      preferredTime: "",
      mode: "in_person",
      message: "",
      consent: false,
    },
  })
  const { control, handleSubmit, formState, watch, reset } = form
  const providerKey = watch("providerKey")
  const [providerType, providerId] = providerKey.split(":") as ["hospital" | "doctor" | "", string]

  const availableModes = useMemo<ConsultationMode[]>(() => {
    if (providerType === "doctor") return getDoctor(data, providerId)?.consultationModes ?? ["in_person"]
    return ["in_person", "video", "phone"]
  }, [data, providerId, providerType])

  const treatmentOptions = useMemo(() => {
    if (providerType === "hospital") {
      const h = getHospital(data, providerId)
      return data.treatments.filter((t) => h?.treatmentIds.includes(t.id))
    }
    if (providerType === "doctor") {
      const d = getDoctor(data, providerId)
      return data.treatments.filter((t) => d?.treatmentIds.includes(t.id))
    }
    return data.treatments
  }, [data, providerId, providerType])

  const onSubmit = async (values: RequestValues) => {
    const [type, id] = values.providerKey.split(":")
    const target = { hospitalId: type === "hospital" ? id : undefined, doctorId: type === "doctor" ? id : undefined }
    // A doctor request made from a hospital page keeps the hospital context.
    if (type === "doctor" && hospitalId) target.hospitalId = hospitalId

    const contactKey = values.contact.trim().toLowerCase()
    const dateKey = values.preferredDate ? formatDate(values.preferredDate, "yyyy-MM-dd") : ""
    const duplicate =
      kind === "appointment"
        ? data.appointments.find(
            (a) =>
              a.contact.toLowerCase() === contactKey &&
              a.hospitalId === target.hospitalId &&
              a.doctorId === target.doctorId &&
              a.preferredDate.slice(0, 10) === dateKey &&
              a.status !== "cancelled",
          )
        : data.enquiries.find(
            (e) =>
              e.contact.toLowerCase() === contactKey &&
              e.hospitalId === target.hospitalId &&
              e.doctorId === target.doctorId &&
              e.subject.toLowerCase() === values.subject.trim().toLowerCase() &&
              e.status !== "closed",
          )
    if (duplicate) {
      toast.error("Duplicate request", {
        description: `You already have an open request (${duplicate.ref}) for this provider${kind === "appointment" ? " on that date" : " with this subject"}.`,
      })
      return
    }

    // Simulated latency so the disabled/submitting state is visible.
    await new Promise((r) => setTimeout(r, 600))

    const at = nowISO()
    const providerName = getProviderName(data, target)
    const common = {
      patientId: currentUser?.role === "patient" ? currentUser.id : undefined,
      patientName: values.patientName.trim(),
      contact: values.contact.trim(),
      ...target,
      specialtyId: values.specialtyId && values.specialtyId !== NONE ? values.specialtyId : undefined,
      treatmentId: values.treatmentId && values.treatmentId !== NONE ? values.treatmentId : undefined,
      mode: values.mode,
      message: values.message.trim() || undefined,
      createdAt: at,
      updatedAt: at,
      timeline: [{ id: createId("ev"), at, label: "Request submitted", actor: "Patient (demo)" }],
    }

    let record: Appointment | Enquiry
    if (kind === "appointment") {
      record = create("appointments", {
        ...common,
        id: createId("apt"),
        ref: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
        preferredDate: (values.preferredDate ?? new Date()).toISOString(),
        preferredTime: values.preferredTime,
        status: "requested",
      })
    } else {
      record = create("enquiries", {
        ...common,
        id: createId("enq"),
        ref: `ENQ-${Math.floor(2000 + Math.random() * 8000)}`,
        subject: values.subject.trim(),
        preferredDate: values.preferredDate?.toISOString(),
        preferredTime: values.preferredTime || undefined,
        status: "new",
      })
    }

    const doctorUser = target.doctorId ? data.users.find((u) => u.doctorId === target.doctorId) : undefined
    notify({
      type: kind === "appointment" ? "appointment_request" : "new_enquiry",
      title: kind === "appointment" ? "New appointment request (demo)" : "New enquiry (demo)",
      message: `${record.ref} from ${common.patientName} for ${providerName}.`,
      audience: target.doctorId ? "doctor" : "hospital_admin",
      userId: doctorUser?.id,
      link: target.doctorId
        ? `/provider/doctor/${kind === "appointment" ? "appointments" : "enquiries"}`
        : `/provider/hospital/${kind === "appointment" ? "appointments" : "enquiries"}`,
    })
    logAudit({
      action: kind === "appointment" ? "appointment.requested" : "enquiry.created",
      entityType: kind,
      entityId: record.id,
      summary: `${record.ref} for ${providerName}`,
    })
    toast.success(kind === "appointment" ? "Appointment request recorded" : "Enquiry recorded", {
      description: `Reference ${record.ref}. This is a simulation — no provider has received it.`,
    })
    setSubmitted(record)
    onSubmitted?.(record.ref)
  }

  if (submitted) {
    const isAppt = "preferredTime" in submitted && kind === "appointment"
    return (
      <div className={cn("space-y-4 text-center", className)} role="status" aria-live="polite">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-soft text-success-text">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{isAppt ? "Appointment request recorded" : "Enquiry recorded"}</h3>
          <p className="text-sm text-muted-foreground">
            Reference <span className="font-mono font-medium text-foreground">{submitted.ref}</span> · {getProviderName(data, submitted)}
          </p>
          {submitted.preferredDate && (
            <p className="text-sm text-muted-foreground">
              Preferred: {formatDate(submitted.preferredDate)}
              {submitted.preferredTime ? ` at ${formatTime(submitted.preferredTime)}` : ""}
            </p>
          )}
        </div>
        <DemoNotice className="text-left">
          This request exists only in your browser. No hospital or doctor has received it, and no appointment is booked.
          You can track its simulated status in your account.
        </DemoNotice>
        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          {currentUser?.role === "patient" ? (
            <Button asChild>
              <Link to={kind === "appointment" ? "/account/appointments" : "/account/appointments?tab=enquiries"}>View my requests</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link to="/account/login">Sign in to track requests</Link>
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              reset()
              setSubmitted(null)
            }}
          >
            Make another request
          </Button>
        </div>
      </div>
    )
  }

  const isSubmitting = formState.isSubmitting

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-4", className)} noValidate aria-busy={isSubmitting}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="patientName"
          label="Patient name"
          required
          render={({ field, id, invalid, describedBy }) => (
            <Input id={id} autoComplete="name" aria-invalid={invalid} aria-describedby={describedBy} {...field} />
          )}
        />
        <FormField
          control={control}
          name="contact"
          label="Email or mobile"
          required
          render={({ field, id, invalid, describedBy }) => (
            <Input id={id} autoComplete="email" inputMode="email" placeholder="name@example.com or 98XXXXXXXX" aria-invalid={invalid} aria-describedby={describedBy} {...field} />
          )}
        />
      </div>

      {fixedProvider ? (
        <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Request to: </span>
          <span className="font-medium">{getProviderName(data, { hospitalId, doctorId })}</span>
        </div>
      ) : (
        <FormField
          control={control}
          name="providerKey"
          label="Hospital or doctor"
          required
          render={({ field, id, invalid, describedBy }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={id} className="w-full" aria-invalid={invalid} aria-describedby={describedBy}>
                <SelectValue placeholder="Choose a provider" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectGroup>
                  <SelectLabel>Hospitals</SelectLabel>
                  {data.hospitals
                    .filter((h) => h.status === "active")
                    .map((h) => (
                      <SelectItem key={h.id} value={`hospital:${h.id}`}>
                        {h.name} · {h.city}
                      </SelectItem>
                    ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Doctors</SelectLabel>
                  {data.doctors
                    .filter((d) => d.status === "active")
                    .map((d) => (
                      <SelectItem key={d.id} value={`doctor:${d.id}`}>
                        {d.name} · {d.city}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
      )}

      {kind === "enquiry" && (
        <FormField
          control={control}
          name="subject"
          label="Subject"
          required
          render={({ field, id, invalid, describedBy }) => (
            <Input id={id} placeholder="e.g. Availability of knee replacement consultation" aria-invalid={invalid} aria-describedby={describedBy} {...field} />
          )}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="specialtyId"
          label="Specialty"
          render={({ field, id }) => (
            <Select value={field.value || NONE} onValueChange={field.onChange}>
              <SelectTrigger id={id} className="w-full">
                <SelectValue placeholder="Any specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Not sure / any</SelectItem>
                {data.specialties.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FormField
          control={control}
          name="treatmentId"
          label="Treatment (optional)"
          render={({ field, id }) => (
            <Select value={field.value || NONE} onValueChange={field.onChange}>
              <SelectTrigger id={id} className="w-full">
                <SelectValue placeholder="Not specified" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value={NONE}>Not specified</SelectItem>
                {treatmentOptions.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="preferredDate"
          label={kind === "appointment" ? "Preferred date" : "Preferred date (optional)"}
          required={kind === "appointment"}
          render={({ field, id, invalid, describedBy }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={id}
                  type="button"
                  variant="outline"
                  className={cn("w-full justify-start bg-card font-normal", !field.value && "text-muted-foreground")}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                >
                  <CalendarIcon />
                  {field.value ? formatDate(field.value, "EEE, d MMM yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={{ before: new Date() }}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          )}
        />
        <FormField
          control={control}
          name="preferredTime"
          label={kind === "appointment" ? "Preferred time" : "Preferred time (optional)"}
          required={kind === "appointment"}
          render={({ field, id, invalid, describedBy }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={id} className="w-full" aria-invalid={invalid} aria-describedby={describedBy}>
                <SelectValue placeholder="Choose a time" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {TIME_SLOTS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {formatTime(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <FormField
        control={control}
        name="mode"
        label="Consultation mode"
        render={({ field, id }) => (
          <RadioGroup id={id} value={field.value} onValueChange={field.onChange} className="flex flex-wrap gap-2">
            {(["in_person", "video", "phone"] as ConsultationMode[]).map((m) => {
              const disabled = !availableModes.includes(m)
              return (
                <Label
                  key={m}
                  htmlFor={`${id}-${m}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border bg-card px-3 py-2 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent",
                    disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <RadioGroupItem id={`${id}-${m}`} value={m} disabled={disabled} />
                  {CONSULTATION_MODE_LABELS[m]}
                </Label>
              )
            })}
          </RadioGroup>
        )}
      />

      <FormField
        control={control}
        name="message"
        label="Message (optional)"
        description="Please don't include medical history, test results or other sensitive health information."
        render={({ field, id, invalid, describedBy }) => (
          <Textarea id={id} rows={3} maxLength={500} placeholder="e.g. Preferred language or accessibility needs" aria-invalid={invalid} aria-describedby={describedBy} {...field} />
        )}
      />

      <FormField
        control={control}
        name="consent"
        label="Consent"
        render={({ field, id, invalid, describedBy }) => (
          <div className="flex items-start gap-2.5 rounded-lg border bg-muted/30 p-3">
            <Checkbox id={id} checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} aria-invalid={invalid} aria-describedby={describedBy} />
            <label htmlFor={id} className="text-sm leading-snug text-muted-foreground">
              I understand this is a demo: the request is stored only in this browser, is not sent to any provider, and is not
              medical advice or a confirmed booking.
            </label>
          </div>
        )}
      />

      <Alert className="border-info/25 bg-info-soft text-info-text">
        <ShieldAlert aria-hidden="true" />
        <AlertDescription className="text-info-text">
          For a medical emergency, contact local emergency services immediately. Do not use this form.
        </AlertDescription>
      </Alert>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" />}
        {isSubmitting ? "Submitting…" : kind === "appointment" ? "Request appointment" : "Send enquiry"}
      </Button>
    </form>
  )
}

export function AppointmentForm(props: Omit<RequestFormProps, "kind">) {
  return <RequestForm kind="appointment" {...props} />
}

export function EnquiryForm(props: Omit<RequestFormProps, "kind">) {
  return <RequestForm kind="enquiry" {...props} />
}
