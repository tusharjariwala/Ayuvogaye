import { zodResolver } from "@hookform/resolvers/zod"
import { ExternalLink, Save } from "lucide-react"
import type { WheelEvent } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { Link } from "react-router"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { FormField } from "@/components/forms/form-field"
import { PageHeader } from "@/components/shared/page-header"
import { VerificationBadge } from "@/components/shared/verification-badge"
import { MissingProviderState, PendingChangesNotice } from "@/features/provider-hospital/components/portal-widgets"
import { summarizeFields } from "@/features/provider-hospital/lib/provider-workflow"
import { CONSULTATION_MODE_LABELS, LANGUAGES } from "@/lib/constants"
import type { ConsultationMode, Doctor } from "@/types"
import { useManagedDoctor } from "../use-managed-doctor"

const MODES = Object.keys(CONSULTATION_MODE_LABELS) as ConsultationMode[]
const NO_GENDER = "unspecified"

const schema = z.object({
  bio: z.string().trim().min(40, "Write at least 40 characters").max(1000, "Keep the bio under 1,000 characters"),
  gender: z.enum(["female", "male", "other", NO_GENDER]),
  languages: z.array(z.string()).min(1, "Choose at least one language"),
  consultationModes: z.array(z.enum(["in_person", "video", "phone"])).min(1, "Choose at least one consultation mode"),
  /** NaN = not supplied. */
  consultationFee: z.number().refine((v) => Number.isNaN(v) || (Number.isInteger(v) && v >= 0 && v <= 50000), "Enter a whole amount between ₹0 and ₹50,000"),
  subSpecialty: z.string().trim().max(80, "Keep this under 80 characters"),
})

type Values = z.infer<typeof schema>

function toValues(d: Doctor): Values {
  return {
    bio: d.bio,
    gender: d.gender ?? NO_GENDER,
    languages: d.languages,
    consultationModes: d.consultationModes,
    consultationFee: d.consultationFee ?? Number.NaN,
    subSpecialty: d.subSpecialty ?? "",
  }
}

function same(a: Values[keyof Values], b: Values[keyof Values]): boolean {
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x) => (b as string[]).includes(x))
  if (typeof a === "number" && typeof b === "number" && Number.isNaN(a) && Number.isNaN(b)) return true
  return a === b
}

function ProfileForm({ doctor }: { doctor: Doctor }) {
  const { saveDoctor } = useManagedDoctor()
  const form = useForm<Values>({ resolver: zodResolver(schema) as Resolver<Values>, defaultValues: toValues(doctor) })
  const { control, handleSubmit, reset, formState } = form

  const onSubmit = (v: Values) => {
    const before = toValues(doctor)
    const fields = (Object.keys(v) as (keyof Values)[]).filter((k) => !same(v[k], before[k]))
    if (fields.length === 0) {
      toast.info("No changes to save")
      return
    }
    saveDoctor(
      {
        bio: v.bio,
        gender: v.gender === NO_GENDER ? undefined : v.gender,
        languages: v.languages,
        consultationModes: v.consultationModes,
        consultationFee: Number.isNaN(v.consultationFee) ? undefined : v.consultationFee,
        subSpecialty: v.subSpecialty || undefined,
      },
      { fields, summary: summarizeFields("Updated", fields), action: "doctor.profile_updated", toastTitle: "Profile saved" },
    )
    reset(v)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>About you</h2>
          </CardTitle>
          <CardDescription>Describe your practice factually. Avoid outcome guarantees or comparative claims.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField control={control} name="bio" label="Bio" required className="sm:col-span-2" render={({ field, id, invalid, describedBy }) => <Textarea id={id} rows={5} {...field} aria-invalid={invalid} aria-describedby={describedBy} />} />
          <FormField
            control={control}
            name="subSpecialty"
            label="Sub-specialty"
            description="Optional, e.g. Preventive cardiology"
            render={({ field, id, invalid, describedBy }) => <Input id={id} {...field} aria-invalid={invalid} aria-describedby={describedBy} />}
          />
          <FormField
            control={control}
            name="gender"
            label="Gender (optional)"
            description="Some patients filter by gender. You can leave this unspecified."
            render={({ field, id, describedBy }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={id} className="w-full" aria-describedby={describedBy}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_GENDER}>Prefer not to say</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Consultations</h2>
          </CardTitle>
          <CardDescription>Fees are shown as provider-submitted. Patients are never charged through this demo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <FormField
            control={control}
            name="languages"
            label="Languages spoken"
            required
            render={({ field, id, invalid, describedBy }) => (
              <ToggleGroup
                id={id}
                type="multiple"
                variant="outline"
                size="sm"
                spacing={1}
                value={field.value}
                onValueChange={(v) => field.onChange(LANGUAGES.filter((l) => v.includes(l)))}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className="flex-wrap justify-start"
              >
                {LANGUAGES.map((l) => (
                  <ToggleGroupItem key={l} value={l}>
                    {l}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          />
          <FormField
            control={control}
            name="consultationModes"
            label="Consultation modes"
            required
            render={({ field, id, describedBy }) => (
              <div id={id} role="group" aria-describedby={describedBy} className="flex flex-wrap gap-4">
                {MODES.map((m) => (
                  <div key={m} className="flex items-center gap-2">
                    <Checkbox
                      id={`mode-${m}`}
                      checked={field.value.includes(m)}
                      onCheckedChange={(v) => field.onChange(v === true ? MODES.filter((x) => x === m || field.value.includes(x)) : field.value.filter((x) => x !== m))}
                    />
                    <Label htmlFor={`mode-${m}`} className="font-normal">
                      {CONSULTATION_MODE_LABELS[m]}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          />
          <FormField
            control={control}
            name="consultationFee"
            label="Consultation fee (₹, optional)"
            description="Leave blank if you prefer not to publish a fee."
            className="max-w-xs"
            render={({ field, id, invalid, describedBy }) => (
              <Input
                id={id}
                type="number"
                inputMode="numeric"
                min={0}
                step={50}
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={Number.isNaN(field.value) ? "" : field.value}
                onChange={(e) => field.onChange(e.target.value === "" ? Number.NaN : e.target.valueAsNumber)}
                onWheel={(e: WheelEvent<HTMLInputElement>) => e.currentTarget.blur()}
                aria-invalid={invalid}
                aria-describedby={describedBy}
              />
            )}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" disabled={!formState.isDirty} onClick={() => reset(toValues(doctor))}>
          Discard changes
        </Button>
        <Button type="submit">
          <Save /> Save & submit for review
        </Button>
      </div>
    </form>
  )
}

export default function ProfilePage() {
  const { doctor, pendingChanges } = useManagedDoctor()
  if (!doctor) return <MissingProviderState kind="doctor" />
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Saved changes go to the platform for review. Editing your profile never marks it as verified."
        actions={
          <Button asChild variant="outline">
            <Link to={`/doctor/${doctor.slug}`}>
              <ExternalLink /> View public profile
            </Link>
          </Button>
        }
      />
      <PendingChangesNotice requests={pendingChanges} verified={doctor.verification.status === "verified"} />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <ProfileForm key={doctor.updatedAt} doctor={doctor} />
        </div>
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start" aria-label="Registration and verification">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Registration</h2>
              </CardTitle>
              <CardDescription>Read only. Managed by the platform during verification.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <dl className="space-y-2">
                <div>
                  <dt className="text-muted-foreground">Council</dt>
                  <dd className="font-medium">{doctor.registration.council}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Reference</dt>
                  <dd className="font-mono text-xs font-medium">{doctor.registration.placeholderRef}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Verification</dt>
                  <dd className="mt-1">
                    <VerificationBadge status={doctor.verification.status} lastVerifiedAt={doctor.verification.lastVerifiedAt} />
                  </dd>
                </div>
              </dl>
              <p className="text-xs text-muted-foreground">
                This is a placeholder reference — never a real registration number. To correct it, contact the platform team.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
