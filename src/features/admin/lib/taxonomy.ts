export type FieldErrors<D> = Partial<Record<keyof D, string>>

export interface NameSlugDraft {
  name: string
  slug: string
  slugTouched: boolean
}

/** Shared name + slug validation (required, min length, unique slug). */
export function validateNameSlug<D extends NameSlugDraft>(
  draft: D,
  items: { id: string; slug: string }[],
  existingId?: string,
): FieldErrors<D> {
  const errors: FieldErrors<D> = {}
  if (draft.name.trim().length < 2) errors.name = "Enter a name of at least 2 characters."
  if (!draft.slug) errors.slug = "Slug is required."
  else if (items.some((i) => i.slug === draft.slug && i.id !== existingId)) errors.slug = "This slug is already in use."
  return errors
}

export function usageLabel(parts: [number, string][]): { count: number; label: string } {
  const used = parts.filter(([n]) => n > 0)
  return {
    count: used.reduce((s, [n]) => s + n, 0),
    label: `used by ${used.map(([n, noun]) => `${n} ${noun}${n === 1 ? "" : "s"}`).join(" and ")}`,
  }
}
