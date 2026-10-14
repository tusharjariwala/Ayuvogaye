import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save } from "lucide-react"
import { useForm, type Resolver } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { FormField } from "@/components/forms/form-field"
import { useDemoStore } from "@/hooks/use-demo-store"
import { MAX_COMPARE, MIN_COMPARE } from "@/lib/constants"
import type { PlatformSettings } from "@/types"

const schema = z.object({
  platformName: z.string().trim().min(2, "Enter a platform name").max(40, "Keep it under 40 characters"),
  supportEmail: z.string().trim().pipe(z.email("Enter a valid email address")),
  defaultCity: z.string().min(1, "Choose a default city"),
  reviewAutoPublish: z.boolean(),
  requireReviewModeration: z.boolean(),
  sponsoredLabel: z.string().trim().min(3, "Enter a label").max(24, "Keep it under 24 characters"),
  maxCompare: z.number().int().min(MIN_COMPARE).max(MAX_COMPARE),
})

const COMPARE_OPTIONS = Array.from({ length: MAX_COMPARE - MIN_COMPARE + 1 }, (_, i) => MIN_COMPARE + i)

/** Platform-wide settings bound to `settings.platform` (admin only). */
export function PlatformSettingsForm() {
  const { data, settings, updatePlatformSettings, logAudit } = useDemoStore()
  const { control, handleSubmit, formState, reset } = useForm<PlatformSettings>({
    resolver: zodResolver(schema) as Resolver<PlatformSettings>,
    values: settings.platform,
  })

  const onSubmit = async (values: PlatformSettings) => {
    await new Promise((r) => setTimeout(r, 400))
    updatePlatformSettings(values)
    logAudit({ action: "settings.platform_updated", entityType: "settings", summary: "Updated platform settings (demo)" })
    toast.success("Platform settings saved", { description: "Stored locally in this browser — demo only." })
    reset(values)
  }

  const switchRow = (name: "reviewAutoPublish" | "requireReviewModeration", label: string, description: string) => (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      className="rounded-lg border p-3"
      render={({ field, id, describedBy }) => (
        <Switch id={id} checked={field.value} onCheckedChange={field.onChange} aria-describedby={describedBy} />
      )}
    />
  )

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardHeader>
          <h2 className="text-base font-semibold">Platform settings</h2>
          <CardDescription>Branding, moderation and comparison defaults for the whole directory.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 py-6 sm:grid-cols-2">
          <FormField
            control={control}
            name="platformName"
            label="Platform name"
            required
            render={({ field, id, invalid, describedBy }) => (
              <Input {...field} id={id} aria-invalid={invalid} aria-describedby={describedBy} />
            )}
          />
          <FormField
            control={control}
            name="supportEmail"
            label="Support email"
            required
            render={({ field, id, invalid, describedBy }) => (
              <Input {...field} id={id} type="email" aria-invalid={invalid} aria-describedby={describedBy} />
            )}
          />
          <FormField
            control={control}
            name="defaultCity"
            label="Default city"
            required
            render={({ field, id, invalid, describedBy }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={id} className="w-full" aria-invalid={invalid} aria-describedby={describedBy}>
                  <SelectValue placeholder="Choose a city" />
                </SelectTrigger>
                <SelectContent>
                  {data.cities.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormField
            control={control}
            name="sponsoredLabel"
            label="Sponsored label"
            required
            description="Shown on paid placements. Sponsored never implies verified."
            render={({ field, id, invalid, describedBy }) => (
              <Input {...field} id={id} aria-invalid={invalid} aria-describedby={describedBy} />
            )}
          />
          <FormField
            control={control}
            name="maxCompare"
            label="Max hospitals in comparison"
            required
            description={`Between ${MIN_COMPARE} and ${MAX_COMPARE}.`}
            render={({ field, id, invalid, describedBy }) => (
              <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                <SelectTrigger id={id} className="w-full" aria-invalid={invalid} aria-describedby={describedBy}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPARE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} hospitals
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <div className="space-y-3 sm:col-span-2">
            {switchRow(
              "requireReviewModeration",
              "Require review moderation",
              "New patient reviews wait in the moderation queue before publishing.",
            )}
            {switchRow("reviewAutoPublish", "Auto-publish trusted reviews", "Skip the queue for reviews that pass automated checks.")}
          </div>
        </CardContent>
        <CardFooter className="gap-2 border-t">
          <Button type="submit" disabled={formState.isSubmitting || !formState.isDirty}>
            {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
            Save platform settings
          </Button>
          <Button type="button" variant="outline" disabled={!formState.isDirty} onClick={() => reset()}>
            Discard
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
