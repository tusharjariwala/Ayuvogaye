import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, UserPlus } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField } from "@/components/forms/form-field"
import { useDemoStore } from "@/hooks/use-demo-store"
import { cn } from "@/lib/utils"

const MOBILE_RE = /^(\+91)?[6-9]\d{9}$/

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(80, "Name is too long"),
    email: z.string().trim().pipe(z.email("Enter a valid email address")),
    mobile: z
      .string()
      .trim()
      .refine((v) => !v || MOBILE_RE.test(v.replace(/[\s-]/g, "")), "Enter a valid 10-digit Indian mobile number"),
    city: z.string().min(1, "Choose your city"),
    accountType: z.enum(["patient", "provider"]),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((v) => v, "Please accept the demo terms to continue"),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" })

export type RegisterValues = z.infer<typeof schema>

const ACCOUNT_TYPES = [
  { value: "patient", label: "Patient", hint: "Find providers, save favourites and send requests." },
  { value: "provider", label: "Hospital / Doctor", hint: "Claim or list a profile. Provider accounts are reviewed." },
] as const

interface RegisterFormProps {
  defaultType: "patient" | "provider"
  /** Returns an error message for the email field, or nothing on success. */
  onSubmit: (values: RegisterValues) => string | void
}

export function RegisterForm({ defaultType, onSubmit }: RegisterFormProps) {
  const { data } = useDemoStore()
  const { control, handleSubmit, setError, formState } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      city: "",
      accountType: defaultType,
      password: "",
      confirmPassword: "",
      terms: false,
    },
  })

  const submit = async (values: RegisterValues) => {
    await new Promise((r) => setTimeout(r, 500))
    const error = onSubmit(values)
    if (error) setError("email", { message: error })
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
      <FormField
        control={control}
        name="accountType"
        label="Account type"
        required
        render={({ field, id, describedBy }) => (
          <RadioGroup
            id={id}
            value={field.value}
            onValueChange={field.onChange}
            aria-describedby={describedBy}
            className="grid gap-2 sm:grid-cols-2"
          >
            {ACCOUNT_TYPES.map((t) => (
              <label
                key={t.value}
                htmlFor={`${id}-${t.value}`}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                  field.value === t.value ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                )}
              >
                <RadioGroupItem id={`${id}-${t.value}`} value={t.value} className="mt-0.5" />
                <span className="space-y-0.5">
                  <span className="block text-sm font-medium">{t.label}</span>
                  <span className="block text-xs text-muted-foreground">{t.hint}</span>
                </span>
              </label>
            ))}
          </RadioGroup>
        )}
      />

      <FormField
        control={control}
        name="name"
        label="Full name"
        required
        render={({ field, id, invalid, describedBy }) => (
          <Input {...field} id={id} autoComplete="name" aria-invalid={invalid} aria-describedby={describedBy} />
        )}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={control}
          name="email"
          label="Email"
          required
          render={({ field, id, invalid, describedBy }) => (
            <Input {...field} id={id} type="email" autoComplete="email" aria-invalid={invalid} aria-describedby={describedBy} />
          )}
        />
        <FormField
          control={control}
          name="mobile"
          label="Mobile (optional)"
          description="No OTP is sent in this demo."
          render={({ field, id, invalid, describedBy }) => (
            <Input
              {...field}
              id={id}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              aria-invalid={invalid}
              aria-describedby={describedBy}
            />
          )}
        />
      </div>
      <FormField
        control={control}
        name="city"
        label="City"
        required
        render={({ field, id, invalid, describedBy }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id={id} className="w-full" aria-invalid={invalid} aria-describedby={describedBy}>
              <SelectValue placeholder="Select your city" />
            </SelectTrigger>
            <SelectContent>
              {data.cities.map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name}, {c.state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={control}
          name="password"
          label="Password"
          required
          description="At least 8 characters. Not stored anywhere."
          render={({ field, id, invalid, describedBy }) => (
            <Input
              {...field}
              id={id}
              type="password"
              autoComplete="new-password"
              aria-invalid={invalid}
              aria-describedby={describedBy}
            />
          )}
        />
        <FormField
          control={control}
          name="confirmPassword"
          label="Confirm password"
          required
          render={({ field, id, invalid, describedBy }) => (
            <Input
              {...field}
              id={id}
              type="password"
              autoComplete="new-password"
              aria-invalid={invalid}
              aria-describedby={describedBy}
            />
          )}
        />
      </div>
      <FormField
        control={control}
        name="terms"
        label="Terms"
        render={({ field, id, invalid, describedBy }) => (
          <div className="flex items-start gap-2.5 rounded-lg border bg-muted/30 p-3">
            <Checkbox
              id={id}
              checked={field.value}
              onCheckedChange={(v) => field.onChange(v === true)}
              aria-invalid={invalid}
              aria-describedby={describedBy}
            />
            <label htmlFor={id} className="text-sm leading-snug text-muted-foreground">
              I agree to the{" "}
              <Link to="/terms" className="font-medium text-primary underline-offset-4 hover:underline">
                terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
                privacy notice
              </Link>{" "}
              and understand this account exists only in this browser.
            </label>
          </div>
        )}
      />
      <Button type="submit" className="w-full" size="lg" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <UserPlus />}
        {formState.isSubmitting ? "Creating account…" : "Create demo account"}
      </Button>
    </form>
  )
}
