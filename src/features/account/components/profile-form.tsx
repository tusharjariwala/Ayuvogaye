import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField } from "@/components/forms/form-field"
import { useDemoStore } from "@/hooks/use-demo-store"
import { nowISO } from "@/lib/mock-storage"
import type { User } from "@/types"

const PHONE_RE = /^(\+91)?[6-9]\d{9}$|^\+91 ?0{5} ?\d{5}$/

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80, "Name is too long"),
  phone: z
    .string()
    .trim()
    .refine((v) => !v || PHONE_RE.test(v.replace(/[\s-]/g, "")) || PHONE_RE.test(v), "Enter a valid 10-digit Indian mobile number"),
  city: z.string().min(1, "Choose your city"),
})
type Values = z.infer<typeof schema>

/** Edits the signed-in user's name, phone and city in the local store. */
export function ProfileForm({ user }: { user: User }) {
  const { data, update, logAudit } = useDemoStore()
  const { control, handleSubmit, formState, reset } = useForm<Values>({
    resolver: zodResolver(schema),
    values: { name: user.name, phone: user.phone ?? "", city: user.city },
  })

  const cityOptions = data.cities.some((c) => c.name === user.city)
    ? data.cities.map((c) => c.name)
    : [user.city, ...data.cities.map((c) => c.name)]

  const onSubmit = async (values: Values) => {
    await new Promise((r) => setTimeout(r, 400))
    update("users", user.id, { name: values.name, phone: values.phone || undefined, city: values.city, lastActiveAt: nowISO() })
    logAudit({ action: "user.profile_updated", entityType: "user", entityId: user.id, summary: `${values.name} updated their profile (demo)` })
    toast.success("Profile saved", { description: "Changes are stored only in this browser." })
    reset(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
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
          name="phone"
          label="Mobile (optional)"
          render={({ field, id, invalid, describedBy }) => (
            <Input {...field} id={id} type="tel" autoComplete="tel" aria-invalid={invalid} aria-describedby={describedBy} />
          )}
        />
        <FormField
          control={control}
          name="city"
          label="City"
          required
          render={({ field, id, invalid, describedBy }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={id} className="w-full" aria-invalid={invalid} aria-describedby={describedBy}>
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                {cityOptions.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={formState.isSubmitting || !formState.isDirty}>
          {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
          {formState.isSubmitting ? "Saving…" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" disabled={!formState.isDirty} onClick={() => reset()}>
          Discard
        </Button>
      </div>
    </form>
  )
}
