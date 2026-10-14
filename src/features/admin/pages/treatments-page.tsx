import type { ColumnDef } from "@tanstack/react-table"
import { BookCheck, Building2, FileClock, Syringe } from "lucide-react"
import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTableColumnHeader } from "@/components/data-table"
import { Field } from "@/components/forms/form-field"
import { StatCard } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { getSpecialtyNames } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { formatCurrencyRange } from "@/lib/formatters"
import { createId, nowISO } from "@/lib/mock-storage"
import type { EditorialStatus, Treatment } from "@/types"
import { CellTitle, FieldError, StatGrid } from "../components/admin-ui"
import { NameSlugFields, TaxonomyManager } from "../components/taxonomy-manager"
import { EDITORIAL_LABELS, actorName } from "../lib/admin-helpers"
import { usageLabel, validateNameSlug } from "../lib/taxonomy"

interface TreatmentDraft {
  name: string
  slug: string
  slugTouched: boolean
  category: string
  specialtyIds: string[]
  editorialStatus: EditorialStatus
  priceMin: string
  priceMax: string
}

const PRICE_NOTE = "Illustrative estimate for demo purposes only — not a quote."

export default function TreatmentsPage() {
  const { data, currentUser } = useDemoStore()
  const items = data.treatments
  const usage = (t: Treatment) => ({
    hospitals: data.hospitals.filter((h) => h.treatmentIds.includes(t.id)).length,
    doctors: data.doctors.filter((d) => d.treatmentIds.includes(t.id)).length,
  })
  const categories = useMemo(() => [...new Set(items.map((t) => t.category))].sort(), [items])

  const columns = useMemo<ColumnDef<Treatment, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        meta: { label: "Name" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Treatment" />,
        cell: ({ row }) => <CellTitle title={row.original.name} subtitle={<span className="font-mono">/treatment/{row.original.slug}</span>} />,
      },
      { accessorKey: "category", meta: { label: "Category" }, header: ({ column }) => <DataTableColumnHeader column={column} title="Category" /> },
      {
        id: "specialties",
        meta: { label: "Specialties" },
        accessorFn: (t) => getSpecialtyNames(data, t.specialtyIds),
        header: "Specialties",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex max-w-60 flex-wrap gap-1">
            {getSpecialtyNames(data, row.original.specialtyIds).map((n) => (
              <Badge key={n} variant="secondary">
                {n}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        id: "price",
        meta: { label: "Price estimate" },
        accessorFn: (t) => t.priceEstimate?.min ?? 0,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Est. price (illustrative)" />,
        cell: ({ row }) =>
          row.original.priceEstimate ? (
            <span className="whitespace-nowrap tabular-nums">{formatCurrencyRange(row.original.priceEstimate.min, row.original.priceEstimate.max)}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "usage",
        meta: { label: "Usage" },
        accessorFn: (t) => usage(t).hospitals,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Usage" />,
        cell: ({ row }) => {
          const u = usage(row.original)
          return (
            <span className="text-xs whitespace-nowrap text-muted-foreground">
              {u.hospitals} hospitals · {u.doctors} doctors
            </span>
          )
        },
      },
      {
        id: "editorial",
        meta: { label: "Editorial status" },
        accessorFn: (t) => t.editorial.status,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Editorial" />,
        cell: ({ row }) => <StatusBadge status={row.original.editorial.status} />,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  )

  return (
    <TaxonomyManager<"treatments", TreatmentDraft>
      collection="treatments"
      entityType="treatment"
      title="Treatments"
      description="Procedures and treatments shown on treatment pages and used for provider matching. Prices are illustrative estimates only."
      noun="treatment"
      formClassName="sm:max-w-2xl"
      stats={
        <StatGrid>
          <StatCard label="Treatments" value={items.length} icon={Syringe} />
          <StatCard label="Published" value={items.filter((t) => t.editorial.status === "published").length} icon={BookCheck} />
          <StatCard label="Draft / in review" value={items.filter((t) => t.editorial.status !== "published").length} icon={FileClock} />
          <StatCard label="Offered by no hospital" value={items.filter((t) => usage(t).hospitals === 0).length} icon={Building2} />
        </StatGrid>
      }
      columns={columns}
      filters={[
        { columnId: "category", title: "Category", options: categories.map((c) => ({ value: c, label: c, count: items.filter((t) => t.category === c).length })) },
        {
          columnId: "specialties",
          title: "Specialty",
          options: data.specialties.map((s) => ({ value: s.name, label: s.name, count: items.filter((t) => t.specialtyIds.includes(s.id)).length })),
        },
        {
          columnId: "editorial",
          title: "Editorial",
          options: (Object.keys(EDITORIAL_LABELS) as EditorialStatus[]).map((s) => ({ value: s, label: EDITORIAL_LABELS[s] })),
        },
      ]}
      getSearchText={(t) => `${t.name} ${t.slug} ${t.category} ${getSpecialtyNames(data, t.specialtyIds).join(" ")}`}
      exportColumns={[
        { header: "ID", value: (t) => t.id },
        { header: "Name", value: (t) => t.name },
        { header: "Slug", value: (t) => t.slug },
        { header: "Category", value: (t) => t.category },
        { header: "Specialties", value: (t) => getSpecialtyNames(data, t.specialtyIds) },
        { header: "Illustrative min (INR)", value: (t) => t.priceEstimate?.min ?? "" },
        { header: "Illustrative max (INR)", value: (t) => t.priceEstimate?.max ?? "" },
        { header: "Editorial status", value: (t) => EDITORIAL_LABELS[t.editorial.status] },
      ]}
      emptyDraft={() => ({
        name: "",
        slug: "",
        slugTouched: false,
        category: categories[0] ?? "General",
        specialtyIds: [],
        editorialStatus: "draft",
        priceMin: "",
        priceMax: "",
      })}
      toDraft={(t) => ({
        name: t.name,
        slug: t.slug,
        slugTouched: true,
        category: t.category,
        specialtyIds: t.specialtyIds,
        editorialStatus: t.editorial.status,
        priceMin: t.priceEstimate ? String(t.priceEstimate.min) : "",
        priceMax: t.priceEstimate ? String(t.priceEstimate.max) : "",
      })}
      fromDraft={(d, existing) => {
        const hasPrice = d.priceMin !== "" && d.priceMax !== ""
        const statusChanged = existing?.editorial.status !== d.editorialStatus
        return {
          ...(existing ?? {
            id: createId("tr"),
            overview: "Overview pending editorial review. General information only — not medical advice.",
            services: [],
            preparationFaqs: [],
            seo: { title: d.name, description: `General information about ${d.name}.`, keywords: [d.name.toLowerCase()] },
          }),
          name: d.name.trim(),
          slug: d.slug,
          category: d.category.trim(),
          specialtyIds: d.specialtyIds,
          priceEstimate: hasPrice
            ? { min: Number(d.priceMin), max: Number(d.priceMax), basis: existing?.priceEstimate?.basis ?? "illustrative", note: existing?.priceEstimate?.note ?? PRICE_NOTE }
            : undefined,
          editorial: statusChanged
            ? { status: d.editorialStatus, reviewedBy: actorName(currentUser), reviewedAt: nowISO() }
            : (existing?.editorial ?? { status: d.editorialStatus }),
        }
      }}
      validate={(d, all, existing) => {
        const errors = validateNameSlug(d, all, existing?.id)
        if (!d.category.trim()) errors.category = "Enter a category."
        if (d.specialtyIds.length === 0) errors.specialtyIds = "Select at least one specialty."
        const min = Number(d.priceMin)
        const max = Number(d.priceMax)
        if ((d.priceMin === "") !== (d.priceMax === "")) errors.priceMax = "Enter both a minimum and maximum, or leave both empty."
        else if (d.priceMin !== "" && (Number.isNaN(min) || Number.isNaN(max) || min < 0 || max < min))
          errors.priceMax = "Maximum must be a number greater than or equal to the minimum."
        return errors
      }}
      getUsage={(t) => {
        const u = usage(t)
        return usageLabel([
          [u.hospitals, "hospital"],
          [u.doctors, "doctor"],
        ])
      }}
      renderFields={({ draft, set, errors }) => (
        <>
          <NameSlugFields idPrefix="tr" draft={draft} set={set} errors={errors} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" htmlFor="tr-category" description="e.g. Cardiac procedure">
              <Input id="tr-category" list="tr-categories" value={draft.category} aria-invalid={!!errors.category} onChange={(e) => set({ category: e.target.value })} />
              <datalist id="tr-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {errors.category && <FieldError>{errors.category}</FieldError>}
            </Field>
            <Field label="Editorial status" htmlFor="tr-status">
              <Select value={draft.editorialStatus} onValueChange={(v) => set({ editorialStatus: v as EditorialStatus })}>
                <SelectTrigger id="tr-status" className="w-full">
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
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Specialties</legend>
            <div className="grid max-h-48 gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-2">
              {data.specialties.map((s) => {
                const id = `tr-sp-${s.id}`
                const checked = draft.specialtyIds.includes(s.id)
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={(v) =>
                        set({ specialtyIds: v ? [...draft.specialtyIds, s.id] : draft.specialtyIds.filter((x) => x !== s.id) })
                      }
                    />
                    <label htmlFor={id} className="text-sm">
                      {s.name}
                    </label>
                  </div>
                )
              })}
            </div>
            {errors.specialtyIds && <FieldError>{errors.specialtyIds}</FieldError>}
          </fieldset>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Price estimate (illustrative, INR)</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Minimum" htmlFor="tr-min">
                <Input id="tr-min" type="number" inputMode="numeric" min={0} value={draft.priceMin} onChange={(e) => set({ priceMin: e.target.value })} onWheel={(e) => e.currentTarget.blur()} />
              </Field>
              <Field label="Maximum" htmlFor="tr-max">
                <Input
                  id="tr-max"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={draft.priceMax}
                  aria-invalid={!!errors.priceMax}
                  onChange={(e) => set({ priceMax: e.target.value })}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </Field>
            </div>
            {errors.priceMax && <FieldError>{errors.priceMax}</FieldError>}
            <p className="text-xs text-muted-foreground">{PRICE_NOTE} Shown publicly as “Illustrative estimate”.</p>
          </fieldset>
        </>
      )}
    />
  )
}
