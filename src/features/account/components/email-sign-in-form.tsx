import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, LogIn } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/forms/form-field"
import { useDemoStore } from "@/hooks/use-demo-store"
import { ROLE_LABELS } from "@/lib/constants"
import type { UserRole } from "@/types"

const schema = z.object({
  email: z.string().trim().pipe(z.email("Enter a valid email address")),
  password: z.string().min(6, "Password must be at least 6 characters"),
})
type Values = z.infer<typeof schema>

/** Accepts the email of any sample user; the password is never checked. */
export function EmailSignInForm({ onSignedIn }: { onSignedIn: (role: UserRole) => void }) {
  const { data, signIn } = useDemoStore()
  const { control, handleSubmit, setError, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (values: Values) => {
    await new Promise((r) => setTimeout(r, 400))
    const user = data.users.find((u) => u.email.toLowerCase() === values.email.toLowerCase())
    if (!user) {
      setError("email", { message: "No sample account uses this email. Pick a demo role or create an account." })
      return
    }
    if (user.status === "suspended") {
      setError("email", { message: "This sample account is suspended and cannot sign in." })
      return
    }
    signIn(user.id)
    toast.success(`Signed in as ${user.name}`, { description: `Demo role: ${ROLE_LABELS[user.role]} — the password was not checked.` })
    onSignedIn(user.role)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormField
        control={control}
        name="email"
        label="Email"
        required
        render={({ field, id, invalid, describedBy }) => (
          <Input
            {...field}
            id={id}
            type="email"
            autoComplete="email"
            placeholder="aarav.s@example.com"
            aria-invalid={invalid}
            aria-describedby={describedBy}
          />
        )}
      />
      <FormField
        control={control}
        name="password"
        label="Password"
        required
        description="Any 6+ characters — the demo never checks passwords."
        render={({ field, id, invalid, describedBy }) => (
          <Input
            {...field}
            id={id}
            type="password"
            autoComplete="current-password"
            aria-invalid={invalid}
            aria-describedby={describedBy}
          />
        )}
      />
      <div className="flex justify-end">
        <Link to="/account/reset-password" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <LogIn />}
        {formState.isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  )
}
