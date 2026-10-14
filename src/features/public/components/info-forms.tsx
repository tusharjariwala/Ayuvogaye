import { Flag, Send } from "lucide-react"
import { useId, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DemoNotice } from "@/components/shared/demo-notice"
import { Field } from "@/components/forms/form-field"
import { useDemoStore } from "@/hooks/use-demo-store"
import { ReportDialog } from "@/features/reviews/components/report-dialog"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const TOPICS = ["General question", "Listing or profile correction", "Partnership", "Accessibility feedback", "Something else"]

/** Local-only contact form. Nothing is sent. */
export function ContactForm() {
  const id = useId()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [topic, setTopic] = useState(TOPICS[0])
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (name.trim().length < 2) next.name = "Enter your name"
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address"
    if (message.trim().length < 10) next.message = "Write at least 10 characters"
    setErrors(next)
    if (Object.keys(next).length > 0) return
    toast.success("Message recorded (demo)", { description: "Nothing was sent — this contact form is simulated in your browser." })
    setName("")
    setEmail("")
    setMessage("")
  }

  const err = (key: string) =>
    errors[key] ? (
      <p id={`${id}-${key}-error`} className="text-sm text-destructive-text">
        {errors[key]}
      </p>
    ) : null

  return (
    <Card className="gap-0 py-0 shadow-soft">
      <CardContent className="p-5 sm:p-6">
        <form onSubmit={submit} noValidate className="space-y-4">
          <h2 className="text-lg font-semibold">Send us a message</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name" htmlFor={`${id}-name`}>
              <Input
                id={`${id}-name`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? `${id}-name-error` : undefined}
              />
              {err("name")}
            </Field>
            <Field label="Email" htmlFor={`${id}-email`}>
              <Input
                id={`${id}-email`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? `${id}-email-error` : undefined}
              />
              {err("email")}
            </Field>
          </div>
          <Field label="Topic" htmlFor={`${id}-topic`}>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger id={`${id}-topic`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TOPICS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Message" htmlFor={`${id}-message`} description="Please don't include personal health information.">
            <Textarea
              id={`${id}-message`}
              rows={5}
              maxLength={1000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? `${id}-message-error` : undefined}
            />
            {err("message")}
          </Field>
          <DemoNotice>This form is simulated. Your message stays in this browser and is not sent anywhere.</DemoNotice>
          <Button type="submit">
            <Send /> Send message
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

/** Choose a hospital or doctor, then open the shared report dialog. */
export function ReportPicker() {
  const { data } = useDemoStore()
  const id = useId()
  const [type, setType] = useState<"hospital" | "doctor">("hospital")
  const [entityId, setEntityId] = useState("")
  const options =
    type === "hospital"
      ? data.hospitals.filter((h) => h.status !== "suspended").map((h) => ({ id: h.id, label: `${h.name} — ${h.city}` }))
      : data.doctors.filter((d) => d.status !== "suspended").map((d) => ({ id: d.id, label: `${d.name} — ${d.city}` }))
  const selected = options.find((o) => o.id === entityId)

  return (
    <Card className="gap-0 py-0 shadow-soft">
      <CardContent className="space-y-4 p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Report a profile</h2>
        <div className="grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
          <div className="space-y-2">
            <Label htmlFor={`${id}-type`}>Profile type</Label>
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v as "hospital" | "doctor")
                setEntityId("")
              }}
            >
              <SelectTrigger id={`${id}-type`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hospital">Hospital</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor={`${id}-entity`}>{type === "hospital" ? "Hospital" : "Doctor"}</Label>
            <Select value={entityId} onValueChange={setEntityId}>
              <SelectTrigger id={`${id}-entity`} className="w-full">
                <SelectValue placeholder={`Choose a ${type}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {selected ? (
          <ReportDialog
            key={selected.id}
            entityType={type}
            entityId={selected.id}
            entityName={selected.label.split(" — ")[0]}
            trigger={
              <Button>
                <Flag /> Report this profile
              </Button>
            }
          />
        ) : (
          <Button disabled>
            <Flag /> Report this profile
          </Button>
        )}
        <p className="text-xs text-muted-foreground">You can also use “Report inaccurate profile” on any hospital or doctor page.</p>
      </CardContent>
    </Card>
  )
}
