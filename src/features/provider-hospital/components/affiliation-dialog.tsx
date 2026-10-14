import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { EntityFormDialog } from "@/components/shared/overlays"
import { WEEKDAYS, WEEKDAY_LABELS } from "@/lib/constants"
import { WEEKDAY_SHORT, type AffiliationDraft, type AffiliationErrors } from "../lib/provider-workflow"
import { InlineError } from "./inline-error"

interface AffiliationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  submitLabel: string
  /** Hospital portal picks a doctor; doctor portal picks a hospital. Omit when editing. */
  target?: { label: string; placeholder: string; options: { value: string; label: string }[] }
  draft: AffiliationDraft
  onDraftChange: (draft: AffiliationDraft) => void
  errors: AffiliationErrors
  onSubmit: () => void | false
}


/** Shared add/edit dialog for doctor ↔ hospital affiliations. */
export function AffiliationDialog({ open, onOpenChange, title, description, submitLabel, target, draft, onDraftChange, errors, onSubmit }: AffiliationDialogProps) {
  return (
    <EntityFormDialog open={open} onOpenChange={onOpenChange} title={title} description={description} submitLabel={submitLabel} onSubmit={onSubmit}>
      {target && (
        <div className="space-y-2">
          <Label htmlFor="aff-target">{target.label}</Label>
          <Select value={draft.targetId} onValueChange={(v) => onDraftChange({ ...draft, targetId: v })}>
            <SelectTrigger id="aff-target" className="w-full" aria-invalid={!!errors.targetId} aria-describedby={errors.targetId ? "aff-target-err" : undefined}>
              <SelectValue placeholder={target.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {target.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <InlineError id="aff-target-err" message={errors.targetId} />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="aff-role">Role</Label>
        <Input
          id="aff-role"
          value={draft.role}
          placeholder="e.g. Visiting Consultant"
          onChange={(e) => onDraftChange({ ...draft, role: e.target.value })}
          aria-invalid={!!errors.role}
          aria-describedby={errors.role ? "aff-role-err" : undefined}
        />
        <InlineError id="aff-role-err" message={errors.role} />
      </div>
      <div className="space-y-2">
        <p id="aff-days-label" className="text-sm font-medium">
          Consulting days
        </p>
        <ToggleGroup
          type="multiple"
          variant="outline"
          size="sm"
          spacing={1}
          value={draft.days}
          onValueChange={(v) => onDraftChange({ ...draft, days: WEEKDAYS.filter((d) => v.includes(d)) })}
          aria-labelledby="aff-days-label"
          aria-describedby={errors.days ? "aff-days-err" : undefined}
          className="flex-wrap"
        >
          {WEEKDAYS.map((d) => (
            <ToggleGroupItem key={d} value={d} aria-label={WEEKDAY_LABELS[d]}>
              {WEEKDAY_SHORT[d]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <InlineError id="aff-days-err" message={errors.days} />
      </div>
    </EntityFormDialog>
  )
}
