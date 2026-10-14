import type { ColumnDef } from "@tanstack/react-table"
import { Building2, Network, Tags } from "lucide-react"
import { useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DataTableColumnHeader } from "@/components/data-table"
import { Field } from "@/components/forms/form-field"
import { StatCard } from "@/components/shared/stat-card"
import { getSpecialty } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { createId } from "@/lib/mock-storage"
import type { Department } from "@/types"
import { CellTitle, FieldError, StatGrid } from "../components/admin-ui"
import { NameSlugFields, TaxonomyManager } from "../components/taxonomy-manager"
import { usageLabel, validateNameSlug } from "../lib/taxonomy"

interface DepartmentDraft {
  name: string
  slug: string
  slugTouched: boolean
  specialtyId: string
  description: string
}

export default function DepartmentsPage() {
  const { data } = useDemoStore()
  const items = data.departments
  const hospitalCount = (d: Department) => data.hospitals.filter((h) => h.departmentIds.includes(d.id)).length

  const columns = useMemo<ColumnDef<Department, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        meta: { label: "Name" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
        cell: ({ row }) => <CellTitle title={row.original.name} subtitle={<span className="font-mono">{row.original.slug}</span>} />,
      },
      {
        id: "specialty",
        meta: { label: "Specialty" },
        accessorFn: (d) => getSpecialty(data, d.specialtyId)?.name ?? "Unlinked",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Specialty" />,
      },
      {
        accessorKey: "description",
        meta: { label: "Description" },
        header: "Description",
        enableSorting: false,
        cell: ({ row }) => <p className="line-clamp-2 max-w-80 text-muted-foreground">{row.original.description}</p>,
      },
      {
        id: "hospitals",
        meta: { label: "Hospitals" },
        accessorFn: (d) => hospitalCount(d),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Hospitals" />,
        cell: ({ getValue }) => <span className="tabular-nums">{String(getValue())}</span>,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  )

  const specialtyNames = [...new Set(items.map((d) => getSpecialty(data, d.specialtyId)?.name ?? "Unlinked"))].sort()

  return (
    <TaxonomyManager<"departments", DepartmentDraft>
      collection="departments"
      entityType="department"
      title="Departments"
      description="Hospital departments, each linked to a specialty. Hospitals choose from this list on their profile."
      noun="department"
      stats={
        <StatGrid className="xl:grid-cols-3">
          <StatCard label="Departments" value={items.length} icon={Network} />
          <StatCard label="Specialties covered" value={new Set(items.map((d) => d.specialtyId)).size} icon={Tags} />
          <StatCard label="Unused departments" value={items.filter((d) => hospitalCount(d) === 0).length} icon={Building2} hint="Not listed by any hospital" />
        </StatGrid>
      }
      columns={columns}
      filters={[{ columnId: "specialty", title: "Specialty", options: specialtyNames.map((n) => ({ value: n, label: n })) }]}
      getSearchText={(d) => `${d.name} ${d.slug} ${d.description} ${getSpecialty(data, d.specialtyId)?.name ?? ""}`}
      exportColumns={[
        { header: "ID", value: (d) => d.id },
        { header: "Name", value: (d) => d.name },
        { header: "Slug", value: (d) => d.slug },
        { header: "Specialty", value: (d) => getSpecialty(data, d.specialtyId)?.name ?? "" },
        { header: "Hospitals", value: (d) => hospitalCount(d) },
      ]}
      emptyDraft={() => ({ name: "", slug: "", slugTouched: false, specialtyId: data.specialties[0]?.id ?? "", description: "" })}
      toDraft={(d) => ({ name: d.name, slug: d.slug, slugTouched: true, specialtyId: d.specialtyId, description: d.description })}
      fromDraft={(d, existing) => ({
        id: existing?.id ?? createId("dep"),
        name: d.name.trim(),
        slug: d.slug,
        specialtyId: d.specialtyId,
        description: d.description.trim(),
      })}
      validate={(d, all, existing) => {
        const errors = validateNameSlug(d, all, existing?.id)
        if (!d.specialtyId) errors.specialtyId = "Choose a specialty."
        return errors
      }}
      getUsage={(d) => usageLabel([[hospitalCount(d), "hospital"]])}
      renderFields={({ draft, set, errors }) => (
        <>
          <NameSlugFields idPrefix="dep" draft={draft} set={set} errors={errors} />
          <Field label="Specialty" htmlFor="dep-specialty">
            <Select value={draft.specialtyId} onValueChange={(v) => set({ specialtyId: v })}>
              <SelectTrigger id="dep-specialty" className="w-full" aria-invalid={!!errors.specialtyId}>
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
          <Field label="Description" htmlFor="dep-desc">
            <Textarea id="dep-desc" rows={3} value={draft.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>
        </>
      )}
    />
  )
}
