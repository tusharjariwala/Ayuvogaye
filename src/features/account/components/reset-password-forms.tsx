import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound, Loader2, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/forms/form-field"

const emailSchema = z.object({ email: z.string().trim().pipe(z.email("Enter a valid email address")) })
type EmailValues = z.infer<typeof emailSchema>

export function ResetRequestForm({ onSent }: { onSent: (email: string) => void }) {
  const { control, handleSubmit, formState } = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  })
  const submit = async (v: EmailValues) => {
    await new Promise((r) => setTimeout(r, 500))
    onSent(v.email)
  }
  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <FormField
        control={control}
        name="email"
        label="Account email"
        required
        render={({ field, id, invalid, describedBy }) => (
          <Input {...field} id={id} type="email" autoComplete="email" aria-invalid={invalid} aria-describedby={describedBy} />
        )}
      />
      <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Mail />}
        {formState.isSubmitting ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  )
}

const passwordSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" })
type PasswordValues = z.infer<typeof passwordSchema>

/** Purely visual second step — nothing is stored. */
export function NewPasswordForm({ onDone }: { onDone: () => void }) {
  const { control, handleSubmit, formState } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })
  const submit = async () => {
    await new Promise((r) => setTimeout(r, 500))
    onDone()
  }
  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <FormField
        control={control}
        name="password"
        label="New password"
        required
        description="At least 8 characters."
        render={({ field, id, invalid, describedBy }) => (
          <Input {...field} id={id} type="password" autoComplete="new-password" aria-invalid={invalid} aria-describedby={describedBy} />
        )}
      />
      <FormField
        control={control}
        name="confirmPassword"
        label="Confirm new password"
        required
        render={({ field, id, invalid, describedBy }) => (
          <Input {...field} id={id} type="password" autoComplete="new-password" aria-invalid={invalid} aria-describedby={describedBy} />
        )}
      />
      <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <KeyRound />}
        {formState.isSubmitting ? "Updating…" : "Set new password"}
      </Button>
    </form>
  )
}
