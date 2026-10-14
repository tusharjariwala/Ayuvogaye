import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Field } from "@/components/forms/form-field"
import { EntityFormDialog } from "@/components/shared/overlays"
import { useDemoStore } from "@/hooks/use-demo-store"
import type { ProviderType } from "@/types"
import { emptyProviderDraft, providerToDraft, useProviderActions, type ProviderDraft } from "../hooks/use-provider-actions"
import { HOSPITAL_TYPES, PROVIDER_LABEL, PROVIDER_STATUSES, PROVIDER_STATUS_LABELS } from "../lib/admin-helpers"
import { FieldError } from "./admin-ui"

interface ProviderFormDialogProps {
  type: ProviderType
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Edit an existing provider; omit to create. */
  providerId?: string
}

/** Create / edit dialog for hospitals and doctors. Mount with a `key` to reset between records. */
export function ProviderFormDialog({ type, open, onOpenChange, providerId }: ProviderFormDialogProps) {
  const { data } = useDemoStore()
  const { saveProvider } = useProviderActions()
  const [draft, setDraft] = useState<ProviderDraft>(() =>
    providerId ? providerToDraft(data, type, providerId) : emptyProviderDraft(data),
  )
  const [errors, setErrors] = useState<Partial<Record<keyof ProviderDraft, string>>>({})
  const set = (patch: Partial<ProviderDraft>) => setDraft((d) => ({ ...d, ...patch }))
  const label = PROVIDER_LABEL[type]
  const prefix = `provider-${type}`

  const validate = () => {
    const next: typeof errors = {}
    if (draft.name.trim().length < 3) next.name = "Enter a name of at least 3 characters."
    if (!draft.citySlug) next.citySlug = "Choose a city."
    if (type === "doctor" && !draft.specialtyId) next.specialtyId = "Choose a specialty."
    if (draft.email && !/^\S+@\S+\.\S+$/.test(draft.email)) next.email = "Enter a valid email address."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={providerId ? `Edit ${label.toLowerCase()}` : `Add ${label.toLowerCase()}`}
      description={
        providerId
          ? "Changes are saved to local demo data. Editing does not change verification status."
          : "New listings start as Unverified until the provider submits evidence and an admin reviews it."
      }
      submitLabel={providerId ? "Save changes" : `Create ${label.toLowerCase()}`}
      onSubmit={() => {
        if (!validate()) return false
        saveProvider(type, { ...draft, name: draft.name.trim(), email: draft.email.trim(), phone: draft.phone.trim() }, providerId)
      }}
    >
      <Field label="Name" htmlFor={`${prefix}-name`}>
        <Input
          id={`${prefix}-name`}
          value={draft.name}
          onChange={(e) => set({ name: e.target.value })}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? `${prefix}-name-error` : undefined}
          placeholder={type === "hospital" ? "e.g. Sample Care Hospital" : "e.g. Dr. A. Sample"}
          required
        />
        {errors.name && <FieldError id={`${prefix}-name-error`}>{errors.name}</FieldError>}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City" htmlFor={`${prefix}-city`}>
          <Select value={draft.citySlug} onValueChange={(v) => set({ citySlug: v })}>
            <SelectTrigger id={`${prefix}-city`} className="w-full" aria-invalid={!!errors.citySlug}>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {data.cities.map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.citySlug && <FieldError>{errors.citySlug}</FieldError>}
        </Field>
        <Field label="Listing status" htmlFor={`${prefix}-status`}>
          <Select value={draft.status} onValueChange={(v) => set({ status: v as ProviderDraft["status"] })}>
            <SelectTrigger id={`${prefix}-status`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVIDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {PROVIDER_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      {type === "hospital" ? (
        <Field label="Hospital type" htmlFor={`${prefix}-type`}>
          <Select value={draft.hospitalType} onValueChange={(v) => set({ hospitalType: v as ProviderDraft["hospitalType"] })}>
            <SelectTrigger id={`${prefix}-type`} className="w-full">
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
        </Field>
      ) : (
        <Field label="Primary specialty" htmlFor={`${prefix}-specialty`}>
          <Select value={draft.specialtyId} onValueChange={(v) => set({ specialtyId: v })}>
            <SelectTrigger id={`${prefix}-specialty`} className="w-full" aria-invalid={!!errors.specialtyId}>
              <SelectValue placeholder="Select specialty" />
            </SelectTrigger>
            <SelectContent>
              {data.specialties.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.specialtyId && <FieldError>{errors.specialtyId}</FieldError>}
        </Field>
      )}
      {type === "hospital" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact email" htmlFor={`${prefix}-email`}>
              <Input
                id={`${prefix}-email`}
                type="email"
                value={draft.email}
                onChange={(e) => set({ email: e.target.value })}
                aria-invalid={!!errors.email}
                placeholder="contact@example.in"
              />
              {errors.email && <FieldError>{errors.email}</FieldError>}
            </Field>
            <Field label="Phone" htmlFor={`${prefix}-phone`}>
              <Input id={`${prefix}-phone`} type="tel" value={draft.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+91 00000 00000" />
            </Field>
          </div>
          <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
            <div className="space-y-1">
              <label htmlFor={`${prefix}-sponsored`} className="text-sm font-medium">
                Sponsored listing
              </label>
              <p className="text-xs text-muted-foreground">
                Shows a “Sponsored” label. It never affects verification status or ranking claims.
              </p>
            </div>
            <Switch id={`${prefix}-sponsored`} checked={draft.sponsored} onCheckedChange={(v) => set({ sponsored: v })} />
          </div>
        </>
      )}
    </EntityFormDialog>
  )
}
