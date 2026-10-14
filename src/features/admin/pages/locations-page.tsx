import type { ColumnDef } from "@tanstack/react-table"
import { Building2, MapPin, Stethoscope } from "lucide-react"
import { useMemo } from "react"
import { Link } from "react-router"
import { Input } from "@/components/ui/input"
import { DataTableColumnHeader } from "@/components/data-table"
import { Field } from "@/components/forms/form-field"
import { StatCard } from "@/components/shared/stat-card"
import { useDemoStore } from "@/hooks/use-demo-store"
import { createId } from "@/lib/mock-storage"
import type { City } from "@/types"
import { CellTitle, FieldError, StatGrid } from "../components/admin-ui"
import { NameSlugFields, TaxonomyManager } from "../components/taxonomy-manager"
import { usageLabel, validateNameSlug } from "../lib/taxonomy"

interface CityDraft {
  name: string
  slug: string
  slugTouched: boolean
  state: string
}

export default function LocationsPage() {
  const { data } = useDemoStore()
  const items = data.cities
  const counts = (c: { slug: string }) => ({
    hospitals: data.hospitals.filter((h) => h.citySlug === c.slug).length,
    doctors: data.doctors.filter((d) => d.citySlug === c.slug).length,
  })
  const states = useMemo(() => [...new Set(items.map((c) => c.state))].sort(), [items])

  const columns = useMemo<ColumnDef<City, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        meta: { label: "City" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="City" />,
        cell: ({ row }) => <CellTitle title={row.original.name} subtitle={<span className="font-mono">{row.original.slug}</span>} />,
      },
      { accessorKey: "state", meta: { label: "State" }, header: ({ column }) => <DataTableColumnHeader column={column} title="State" /> },
      {
        id: "hospitals",
        meta: { label: "Hospitals" },
        accessorFn: (c) => counts(c).hospitals,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Hospitals" />,
        cell: ({ getValue }) => <span className="tabular-nums">{String(getValue())}</span>,
      },
      {
        id: "doctors",
        meta: { label: "Doctors" },
        accessorFn: (c) => counts(c).doctors,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Doctors" />,
        cell: ({ getValue }) => <span className="tabular-nums">{String(getValue())}</span>,
      },
      {
        id: "page",
        meta: { label: "Public page" },
        header: "Public page",
        enableSorting: false,
        cell: ({ row }) => (
          <Link to={`/hospitals/${row.original.slug}`} className="text-primary hover:underline">
            /hospitals/{row.original.slug}
          </Link>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  )

  const withProviders = items.filter((c) => counts(c).hospitals + counts(c).doctors > 0).length

  return (
    <TaxonomyManager<"cities", CityDraft>
      collection="cities"
      entityType="location"
      title="Locations"
      description="Cities used for provider listings, city landing pages and search filters."
      noun="city"
      stats={
        <StatGrid>
          <StatCard label="Cities" value={items.length} icon={MapPin} hint={`${states.length} states`} />
          <StatCard label="Cities with providers" value={withProviders} icon={MapPin} />
          <StatCard label="Hospitals" value={data.hospitals.length} icon={Building2} />
          <StatCard label="Doctors" value={data.doctors.length} icon={Stethoscope} />
        </StatGrid>
      }
      columns={columns}
      filters={[{ columnId: "state", title: "State", options: states.map((s) => ({ value: s, label: s, count: items.filter((c) => c.state === s).length })) }]}
      getSearchText={(c) => `${c.name} ${c.state} ${c.slug}`}
      exportColumns={[
        { header: "ID", value: (c) => c.id },
        { header: "City", value: (c) => c.name },
        { header: "State", value: (c) => c.state },
        { header: "Slug", value: (c) => c.slug },
        { header: "Hospitals", value: (c) => counts(c).hospitals },
        { header: "Doctors", value: (c) => counts(c).doctors },
      ]}
      emptyDraft={() => ({ name: "", slug: "", slugTouched: false, state: "" })}
      toDraft={(c) => ({ name: c.name, slug: c.slug, slugTouched: true, state: c.state })}
      fromDraft={(d, existing) => ({ id: existing?.id ?? createId("city"), name: d.name.trim(), slug: d.slug, state: d.state.trim() })}
      validate={(d, all, existing) => {
        const errors = validateNameSlug(d, all, existing?.id)
        if (d.state.trim().length < 2) errors.state = "Enter the state."
        return errors
      }}
      getUsage={(c) => {
        const u = counts(c)
        return usageLabel([
          [u.hospitals, "hospital"],
          [u.doctors, "doctor"],
        ])
      }}
      renderFields={({ draft, set, errors, existing }) => {
        const inUse = existing ? counts(existing).hospitals + counts(existing).doctors > 0 : false
        return (
          <>
            <NameSlugFields
              idPrefix="city"
              draft={draft}
              set={set}
              errors={errors}
              slugLocked={inUse}
              slugHint="Locked while providers reference this city."
            />
            <Field label="State" htmlFor="city-state">
              <Input id="city-state" list="city-states" value={draft.state} aria-invalid={!!errors.state} onChange={(e) => set({ state: e.target.value })} />
              <datalist id="city-states">
                {states.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              {errors.state && <FieldError>{errors.state}</FieldError>}
            </Field>
          </>
        )
      }}
    />
  )
}
