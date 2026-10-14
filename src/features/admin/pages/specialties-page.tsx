import type { ColumnDef } from "@tanstack/react-table"
import { BookCheck, FileClock, Stethoscope, Tags } from "lucide-react"
import { useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DataTableColumnHeader } from "@/components/data-table"
import { Field } from "@/components/forms/form-field"
import { StatCard } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { SpecialtyIcon } from "@/components/shared/visuals"
import { useDemoStore } from "@/hooks/use-demo-store"
import { titleCase } from "@/lib/formatters"
import { createId } from "@/lib/mock-storage"
import type { EditorialStatus, Specialty } from "@/types"
import { CellTitle, FieldError, StatGrid } from "../components/admin-ui"
import { NameSlugFields, TaxonomyManager } from "../components/taxonomy-manager"
import { EDITORIAL_LABELS, SPECIALTY_ICON_KEYS } from "../lib/admin-helpers"
import { usageLabel, validateNameSlug } from "../lib/taxonomy"

interface SpecialtyDraft {
  name: string
  slug: string
  slugTouched: boolean
  icon: string
  category: string
  shortDescription: string
  editorialStatus: EditorialStatus
}

const CATEGORIES = ["Medical", "Surgical", "Primary care", "Diagnostics", "Women & children"]

export default function SpecialtiesPage() {
  const { data } = useDemoStore()
  const items = data.specialties

  const usage = (s: Specialty) => ({
    hospitals: data.hospitals.filter((h) => h.specialtyIds.includes(s.id)).length,
    doctors: data.doctors.filter((d) => d.specialtyId === s.id).length,
    treatments: data.treatments.filter((t) => t.specialtyIds.includes(s.id)).length,
  })

  const categories = useMemo(() => [...new Set([...CATEGORIES, ...items.map((s) => s.category)])].sort(), [items])

  const columns = useMemo<ColumnDef<Specialty, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        meta: { label: "Name" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Specialty" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SpecialtyIcon icon={row.original.icon} className="size-4.5" />
            </span>
            <CellTitle title={row.original.name} subtitle={<span className="font-mono">/{row.original.slug}</span>} />
          </div>
        ),
      },
      { accessorKey: "category", meta: { label: "Category" }, header: ({ column }) => <DataTableColumnHeader column={column} title="Category" /> },
      {
        accessorKey: "shortDescription",
        meta: { label: "Description" },
        header: "Description",
        enableSorting: false,
        cell: ({ row }) => <p className="line-clamp-2 max-w-72 text-muted-foreground">{row.original.shortDescription}</p>,
      },
      {
        id: "usage",
        meta: { label: "Usage" },
        accessorFn: (s) => usage(s).doctors + usage(s).hospitals,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Usage" />,
        cell: ({ row }) => {
          const u = usage(row.original)
          return (
            <span className="text-xs whitespace-nowrap text-muted-foreground">
              {u.hospitals} hospitals · {u.doctors} doctors · {u.treatments} treatments
            </span>
          )
        },
      },
      {
        accessorKey: "editorialStatus",
        meta: { label: "Editorial status" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Editorial" />,
        cell: ({ row }) => <StatusBadge status={row.original.editorialStatus} />,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  )

  return (
    <TaxonomyManager<"specialties", SpecialtyDraft>
      collection="specialties"
      entityType="specialty"
      title="Specialties"
      description="Medical specialties used for search, filters and specialty pages. Editorial content is general information, not medical advice."
      noun="specialty"
      stats={
        <StatGrid>
          <StatCard label="Specialties" value={items.length} icon={Tags} />
          <StatCard label="Published" value={items.filter((s) => s.editorialStatus === "published").length} icon={BookCheck} />
          <StatCard label="Draft / in review" value={items.filter((s) => s.editorialStatus !== "published").length} icon={FileClock} />
          <StatCard label="Doctors mapped" value={data.doctors.filter((d) => items.some((s) => s.id === d.specialtyId)).length} icon={Stethoscope} />
        </StatGrid>
      }
      columns={columns}
      filters={[
        { columnId: "category", title: "Category", options: categories.filter((c) => items.some((s) => s.category === c)).map((c) => ({ value: c, label: c })) },
        {
          columnId: "editorialStatus",
          title: "Editorial",
          options: (Object.keys(EDITORIAL_LABELS) as EditorialStatus[]).map((s) => ({
            value: s,
            label: EDITORIAL_LABELS[s],
            count: items.filter((i) => i.editorialStatus === s).length,
          })),
        },
      ]}
      getSearchText={(s) => `${s.name} ${s.slug} ${s.category} ${s.shortDescription}`}
      exportColumns={[
        { header: "ID", value: (s) => s.id },
        { header: "Name", value: (s) => s.name },
        { header: "Slug", value: (s) => s.slug },
        { header: "Icon", value: (s) => s.icon },
        { header: "Category", value: (s) => s.category },
        { header: "Editorial status", value: (s) => EDITORIAL_LABELS[s.editorialStatus] },
      ]}
      emptyDraft={() => ({ name: "", slug: "", slugTouched: false, icon: "stethoscope", category: "Medical", shortDescription: "", editorialStatus: "draft" })}
      toDraft={(s) => ({ name: s.name, slug: s.slug, slugTouched: true, icon: s.icon, category: s.category, shortDescription: s.shortDescription, editorialStatus: s.editorialStatus })}
      fromDraft={(d, existing) => ({
        ...(existing ?? {
          id: createId("sp"),
          overview: d.shortDescription,
          commonConditions: [],
          seo: { title: d.name, description: d.shortDescription, keywords: [d.name.toLowerCase()] },
        }),
        name: d.name.trim(),
        slug: d.slug,
        icon: d.icon,
        category: d.category,
        shortDescription: d.shortDescription.trim(),
        editorialStatus: d.editorialStatus,
      })}
      validate={(d, all, existing) => {
        const errors = validateNameSlug(d, all, existing?.id)
        if (d.shortDescription.trim().length < 10) errors.shortDescription = "Add a short description of at least 10 characters."
        return errors
      }}
      getUsage={(s) => {
        const u = usage(s)
        return usageLabel([
          [u.hospitals, "hospital"],
          [u.doctors, "doctor"],
          [u.treatments, "treatment"],
        ])
      }}
      renderFields={({ draft, set, errors }) => (
        <>
          <NameSlugFields idPrefix="sp" draft={draft} set={set} errors={errors} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Icon" htmlFor="sp-icon">
              <Select value={draft.icon} onValueChange={(v) => set({ icon: v })}>
                <SelectTrigger id="sp-icon" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTY_ICON_KEYS.map((k) => (
                    <SelectItem key={k} value={k}>
                      <SpecialtyIcon icon={k} className="size-4" /> {titleCase(k)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Category" htmlFor="sp-category">
              <Select value={draft.category} onValueChange={(v) => set({ category: v })}>
                <SelectTrigger id="sp-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3" aria-live="polite">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SpecialtyIcon icon={draft.icon} className="size-5" />
            </span>
            <div className="min-w-0 text-sm">
              <p className="font-medium">{draft.name || "Specialty name"}</p>
              <p className="text-xs text-muted-foreground">Icon preview · {draft.category}</p>
            </div>
          </div>
          <Field label="Short description" htmlFor="sp-desc" description={`${draft.shortDescription.length}/160 characters. General information only.`}>
            <Textarea
              id="sp-desc"
              rows={3}
              maxLength={160}
              value={draft.shortDescription}
              aria-invalid={!!errors.shortDescription}
              onChange={(e) => set({ shortDescription: e.target.value })}
            />
            {errors.shortDescription && <FieldError>{errors.shortDescription}</FieldError>}
          </Field>
          <Field label="Editorial status" htmlFor="sp-status">
            <Select value={draft.editorialStatus} onValueChange={(v) => set({ editorialStatus: v as EditorialStatus })}>
              <SelectTrigger id="sp-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(EDITORIAL_LABELS) as EditorialStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {EDITORIAL_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </>
      )}
    />
  )
}
