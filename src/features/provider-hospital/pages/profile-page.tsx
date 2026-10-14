import { zodResolver } from "@hookform/resolvers/zod"
import { ExternalLink, Save } from "lucide-react"
import type { WheelEvent } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { Link } from "react-router"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { FormField } from "@/components/forms/form-field"
import { PageHeader } from "@/components/shared/page-header"
import { SourceBadge } from "@/components/shared/trust-badges"
import { VerificationBadge, VerificationExplainer } from "@/components/shared/verification-badge"
import { formatDate } from "@/lib/formatters"
import type { Hospital } from "@/types"
import { MissingProviderState, PendingChangesNotice, ReadOnlyNotice } from "../components/portal-widgets"
import { BASIC_INFO_FIELDS, HOSPITAL_FIELD_GROUPS, summarizeFields } from "../lib/provider-workflow"
import { useManagedHospital } from "../use-managed-hospital"

const HOSPITAL_TYPES: Hospital["type"][] = [
  "Multi-speciality",
  "Super-speciality",
  "Speciality clinic",
  "Eye hospital",
  "Children's hospital",
  "Cancer centre",
]

const CURRENT_YEAR = new Date().getFullYear()

const schema = z
  .object({
    name: z.string().trim().min(3, "Enter the hospital name").max(100, "Name is too long"),
    tagline: z.string().trim().max(120, "Keep the tagline under 120 characters"),
    description: z.string().trim().min(40, "Write at least 40 characters").max(1200, "Keep the description under 1,200 characters"),
    type: z.enum(HOSPITAL_TYPES as [Hospital["type"], ...Hospital["type"][]]),
    phone: z.string().trim().regex(/^\+?[\d\s-]{8,16}$/, "Enter a valid phone number"),
    email: z.email("Enter a valid email address"),
    website: z.union([z.literal(""), z.url("Enter a full URL, e.g. https://example.in")]),
    address: z.string().trim().min(5, "Enter the street address").max(200, "Address is too long"),
    pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must be 6 digits"),
    establishedYear: z.number({ error: "Enter a year" }).int("Enter a whole year").min(1850, "Enter a year after 1850").max(CURRENT_YEAR, "Year can't be in the future"),
    beds: z.number({ error: "Enter the number of beds" }).int("Enter a whole number").min(0, "Can't be negative").max(5000, "Enter a realistic bed count"),
    emergencyAvailable: z.boolean(),
    emergencyHours: z.string().trim().max(40, "Keep this short"),
    ambulance: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.emergencyAvailable && v.emergencyHours.length < 2) {
      ctx.addIssue({ code: "custom", path: ["emergencyHours"], message: "Enter emergency hours, e.g. 24x7" })
    }
  })

type Values = z.infer<typeof schema>

function toValues(h: Hospital): Values {
  return {
    name: h.name,
    tagline: h.tagline,
    description: h.description,
    type: h.type,
    phone: h.phone,
    email: h.email,
    website: h.website ?? "",
    address: h.address,
    pincode: h.pincode,
    establishedYear: h.establishedYear,
    beds: h.beds,
    emergencyAvailable: h.emergency?.available ?? false,
    emergencyHours: h.emergency?.hours ?? "",
    ambulance: h.emergency?.ambulance ?? false,
  }
}

const numberInputProps = {
  type: "number",
  inputMode: "numeric",
  onWheel: (e: WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
} as const

function ProfileForm({ hospital }: { hospital: Hospital }) {
  const { canEdit, saveHospital } = useManagedHospital()
  const form = useForm<Values>({ resolver: zodResolver(schema) as Resolver<Values>, defaultValues: toValues(hospital) })
  const { control, handleSubmit, watch, reset, formState } = form
  const emergencyAvailable = watch("emergencyAvailable")

  const onSubmit = (v: Values) => {
    const before = toValues(hospital)
    const changed = (Object.keys(v) as (keyof Values)[]).filter((k) => v[k] !== before[k])
    if (changed.length === 0) {
      toast.info("No changes to save")
      return
    }
    const fields = Array.from(new Set(changed.map((k) => (k.startsWith("emergency") || k === "ambulance" ? "emergency" : k))))
    saveHospital(
      {
        name: v.name,
        tagline: v.tagline,
        description: v.description,
        type: v.type,
        phone: v.phone,
        email: v.email,
        website: v.website || undefined,
        address: v.address,
        pincode: v.pincode,
        establishedYear: v.establishedYear,
        beds: v.beds,
        emergency: v.emergencyAvailable || v.ambulance ? { available: v.emergencyAvailable, hours: v.emergencyAvailable ? v.emergencyHours : "", ambulance: v.ambulance } : null,
      },
      {
        fields,
        summary: summarizeFields("Updated", fields),
        action: "hospital.profile_updated",
        invalidateGroups: fields.some((f) => BASIC_INFO_FIELDS.includes(f)) ? ["basic_info"] : [],
        toastTitle: "Profile saved",
      },
    )
    reset(v)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <fieldset disabled={!canEdit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>About the hospital</h2>
            </CardTitle>
            <CardDescription>Shown at the top of your public profile.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField control={control} name="name" label="Hospital name" required className="sm:col-span-2" render={({ field, id, invalid, describedBy }) => <Input id={id} {...field} aria-invalid={invalid} aria-describedby={describedBy} />} />
            <FormField control={control} name="tagline" label="Tagline" description="One line, under 120 characters." className="sm:col-span-2" render={({ field, id, invalid, describedBy }) => <Input id={id} {...field} aria-invalid={invalid} aria-describedby={describedBy} />} />
            <FormField
              control={control}
              name="description"
              label="Description"
              required
              description="Describe services factually. Avoid claims such as “best” or guaranteed outcomes."
              className="sm:col-span-2"
              render={({ field, id, invalid, describedBy }) => <Textarea id={id} rows={5} {...field} aria-invalid={invalid} aria-describedby={describedBy} />}
            />
            <FormField
              control={control}
              name="type"
              label="Hospital type"
              required
              render={({ field, id, invalid, describedBy }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!canEdit}>
                  <SelectTrigger id={id} className="w-full" aria-invalid={invalid} aria-describedby={describedBy}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOSPITAL_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormField
              control={control}
              name="establishedYear"
              label="Established"
              required
              render={({ field, id, invalid, describedBy }) => (
                <Input id={id} {...numberInputProps} name={field.name} ref={field.ref} onBlur={field.onBlur} value={Number.isNaN(field.value) ? "" : field.value} onChange={(e) => field.onChange(e.target.value === "" ? Number.NaN : e.target.valueAsNumber)} aria-invalid={invalid} aria-describedby={describedBy} />
              )}
            />
            <FormField
              control={control}
              name="beds"
              label="Beds"
              required
              render={({ field, id, invalid, describedBy }) => (
                <Input id={id} {...numberInputProps} name={field.name} ref={field.ref} onBlur={field.onBlur} value={Number.isNaN(field.value) ? "" : field.value} onChange={(e) => field.onChange(e.target.value === "" ? Number.NaN : e.target.valueAsNumber)} aria-invalid={invalid} aria-describedby={describedBy} />
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Contact & address</h2>
            </CardTitle>
            <CardDescription>Patients see these details. Use a front-desk number, not a personal one.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField control={control} name="phone" label="Phone" required render={({ field, id, invalid, describedBy }) => <Input id={id} type="tel" autoComplete="tel" {...field} aria-invalid={invalid} aria-describedby={describedBy} />} />
            <FormField control={control} name="email" label="Email" required render={({ field, id, invalid, describedBy }) => <Input id={id} type="email" autoComplete="email" {...field} aria-invalid={invalid} aria-describedby={describedBy} />} />
            <FormField control={control} name="website" label="Website" className="sm:col-span-2" render={({ field, id, invalid, describedBy }) => <Input id={id} type="url" placeholder="https://" {...field} aria-invalid={invalid} aria-describedby={describedBy} />} />
            <FormField control={control} name="address" label="Street address" required className="sm:col-span-2" render={({ field, id, invalid, describedBy }) => <Input id={id} autoComplete="street-address" {...field} aria-invalid={invalid} aria-describedby={describedBy} />} />
            <FormField control={control} name="pincode" label="Pincode" required render={({ field, id, invalid, describedBy }) => <Input id={id} inputMode="numeric" maxLength={6} autoComplete="postal-code" {...field} aria-invalid={invalid} aria-describedby={describedBy} />} />
            <div className="space-y-2">
              <Label htmlFor="city-readonly">City</Label>
              <Input id="city-readonly" value={`${hospital.city}, ${hospital.state}`} readOnly disabled aria-describedby="city-help" />
              <p id="city-help" className="text-xs text-muted-foreground">
                Contact the platform team to change your listed city.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Emergency services</h2>
            </CardTitle>
            <CardDescription>Only list emergency care your hospital actually provides.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={control}
              name="emergencyAvailable"
              label="Emergency department"
              description="Shows an emergency badge on your listing."
              render={({ field, id, describedBy }) => (
                <div className="flex items-center gap-3">
                  <Switch id={id} checked={field.value} onCheckedChange={field.onChange} aria-describedby={describedBy} />
                  <span className="text-sm text-muted-foreground">{field.value ? "Available" : "Not available"}</span>
                </div>
              )}
            />
            {emergencyAvailable && (
              <FormField control={control} name="emergencyHours" label="Emergency hours" required className="max-w-xs" render={({ field, id, invalid, describedBy }) => <Input id={id} placeholder="24x7" {...field} aria-invalid={invalid} aria-describedby={describedBy} />} />
            )}
            <FormField
              control={control}
              name="ambulance"
              label="Ambulance service"
              render={({ field, id, describedBy }) => (
                <div className="flex items-center gap-3">
                  <Switch id={id} checked={field.value} onCheckedChange={field.onChange} aria-describedby={describedBy} />
                  <span className="text-sm text-muted-foreground">{field.value ? "Available" : "Not available"}</span>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </fieldset>

      {canEdit && (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" disabled={!formState.isDirty} onClick={() => reset(toValues(hospital))}>
            Discard changes
          </Button>
          <Button type="submit">
            <Save /> Save & submit for review
          </Button>
        </div>
      )}
    </form>
  )
}

export default function ProfilePage() {
  const { hospital, canEdit, pendingChanges } = useManagedHospital()
  if (!hospital) return <MissingProviderState kind="hospital" />
  const verified = hospital.verification.status === "verified"

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hospital profile"
        description="Keep your listing accurate. Saved changes go to the platform for review; editing never marks a profile as verified."
        actions={
          <Button asChild variant="outline">
            <Link to={`/hospital/${hospital.slug}`}>
              <ExternalLink /> View public profile
            </Link>
          </Button>
        }
      />
      {!canEdit && <ReadOnlyNotice />}
      <PendingChangesNotice requests={pendingChanges} verified={verified} />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <ProfileForm key={hospital.updatedAt} hospital={hospital} />
        </div>
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start" aria-label="Verification">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Verification status</h2>
              </CardTitle>
              <CardDescription>
                {verified ? `Last verified ${formatDate(hospital.verification.lastVerifiedAt)}` : "Details are provider-submitted until checked."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <VerificationBadge status={hospital.verification.status} lastVerifiedAt={hospital.verification.lastVerifiedAt} />
              <Separator />
              <ul className="space-y-3" aria-label="Field groups and their source">
                {HOSPITAL_FIELD_GROUPS.map((g) => (
                  <li key={g.key} className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{g.label}</p>
                      <p className="text-xs text-muted-foreground">{g.description}</p>
                    </div>
                    <SourceBadge source={hospital.verifiedFields.includes(g.key) ? "platform_verified" : "provider_submitted"} />
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                Changing name, type, address, contact or year moves “Basic information” back to provider-submitted until the platform re-checks it.
              </p>
            </CardContent>
            <CardFooter className="border-t">
              <VerificationExplainer />
            </CardFooter>
          </Card>
        </aside>
      </div>
    </div>
  )
}
