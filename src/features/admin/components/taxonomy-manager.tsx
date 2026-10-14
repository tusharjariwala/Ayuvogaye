import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable, type DataTableFilter } from "@/components/data-table"
import { Field } from "@/components/forms/form-field"
import { ConfirmDialog, EntityFormDialog } from "@/components/shared/overlays"
import { PageHeader } from "@/components/shared/page-header"
import type { Collections, EntityOf } from "@/data"
import { useDemoStore } from "@/hooks/use-demo-store"
import type { CsvColumn } from "@/lib/data-access"
import { slugify } from "@/lib/formatters"
import type { EntityType } from "@/types"
import type { FieldErrors, NameSlugDraft } from "../lib/taxonomy"
import { FieldError, RowActions } from "./admin-ui"

export type TaxonomyCollection = "specialties" | "departments" | "treatments" | "cities"

export interface TaxonomyFormContext<D, T> {
  draft: D
  set: (patch: Partial<D>) => void
  errors: FieldErrors<D>
  existing?: T
}

interface TaxonomyManagerProps<K extends TaxonomyCollection, D> {
  collection: K
  entityType: EntityType
  title: string
  description: string
  /** Singular noun, e.g. "specialty". */
  noun: string
  stats?: ReactNode
  notice?: ReactNode
  columns: ColumnDef<EntityOf<K>, unknown>[]
  filters?: DataTableFilter[]
  getSearchText: (item: EntityOf<K>) => string
  exportColumns: CsvColumn<EntityOf<K>>[]
  emptyDraft: () => D
  toDraft: (item: EntityOf<K>) => D
  fromDraft: (draft: D, existing?: EntityOf<K>) => EntityOf<K>
  validate: (draft: D, items: EntityOf<K>[], existing?: EntityOf<K>) => FieldErrors<D>
  renderFields: (ctx: TaxonomyFormContext<D, EntityOf<K>>) => ReactNode
  /** e.g. { count: 3, label: "used by 3 hospitals" } — shown as a warning before delete. */
  getUsage?: (item: EntityOf<K>) => { count: number; label: string }
  formClassName?: string
}

/**
 * Generic local CRUD page for taxonomy collections: header with create action,
 * optional KPIs, searchable table, create/edit dialog and usage-aware delete.
 */
export function TaxonomyManager<K extends TaxonomyCollection, D>({
  collection,
  entityType,
  title,
  description,
  noun,
  stats,
  notice,
  columns,
  filters,
  getSearchText,
  exportColumns,
  emptyDraft,
  toDraft,
  fromDraft,
  validate,
  renderFields,
  getUsage,
  formClassName,
}: TaxonomyManagerProps<K, D>) {
  const { data, create, update, remove, logAudit } = useDemoStore()
  const items = data[collection] as Collections[K] as EntityOf<K>[]
  const [editing, setEditing] = useState<{ open: boolean; item?: EntityOf<K> }>({ open: false })
  const [draft, setDraft] = useState<D>(emptyDraft)
  const [errors, setErrors] = useState<FieldErrors<D>>({})
  const [deleting, setDeleting] = useState<EntityOf<K> | null>(null)

  const openForm = (item?: EntityOf<K>) => {
    setDraft(item ? toDraft(item) : emptyDraft())
    setErrors({})
    setEditing({ open: true, item })
  }

  const allColumns = useMemo<ColumnDef<EntityOf<K>, unknown>[]>(
    () => [
      ...columns,
      {
        id: "actions",
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <RowActions
            label={row.original.name}
            actions={[
              { label: "Edit", icon: Pencil, onSelect: () => openForm(row.original) },
              { label: "Delete", icon: Trash2, destructive: true, onSelect: () => setDeleting(row.original) },
            ]}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns],
  )

  const handleSubmit = () => {
    const nextErrors = validate(draft, items, editing.item)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return false
    const record = fromDraft(draft, editing.item)
    if (editing.item) {
      update(collection, editing.item.id, record)
      logAudit({ action: `${entityType}.updated`, entityType, entityId: record.id, summary: `${titleNoun(noun)} “${record.name}” updated.` })
      toast.success(`${titleNoun(noun)} updated`, { description: `${record.name} saved to local demo data.` })
    } else {
      create(collection, record)
      logAudit({ action: `${entityType}.created`, entityType, entityId: record.id, summary: `${titleNoun(noun)} “${record.name}” created.` })
      toast.success(`${titleNoun(noun)} created`, { description: `${record.name} added to local demo data.` })
    }
  }

  const usage = deleting && getUsage ? getUsage(deleting) : null

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button onClick={() => openForm()}>
            <Plus /> Add {noun}
          </Button>
        }
      />
      {stats}
      {notice}
      <DataTable
        columns={allColumns}
        data={items}
        getRowId={(i) => i.id}
        getSearchText={getSearchText}
        searchPlaceholder={`Search ${title.toLowerCase()}…`}
        filters={filters}
        initialSorting={[{ id: "name", desc: false }]}
        onRowClick={(i) => openForm(i)}
        exportFilename={collection}
        exportColumns={exportColumns}
        emptyTitle={`No ${title.toLowerCase()} found`}
        caption={title}
      />

      <EntityFormDialog
        open={editing.open}
        onOpenChange={(o) => setEditing((e) => ({ ...e, open: o }))}
        title={editing.item ? `Edit ${noun}` : `Add ${noun}`}
        description="Changes are stored in local demo data only."
        submitLabel={editing.item ? "Save changes" : `Create ${noun}`}
        onSubmit={handleSubmit}
        className={formClassName}
      >
        {renderFields({ draft, set: (patch) => setDraft((d) => ({ ...d, ...patch })), errors, existing: editing.item })}
      </EntityFormDialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name ?? noun}?`}
        description={
          usage && usage.count > 0
            ? `Warning: this ${noun} is ${usage.label}. Those records will keep a reference to a missing ${noun}. This only affects local demo data — “Reset demo data” restores it.`
            : `This removes the ${noun} from local demo data. “Reset demo data” restores it.`
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleting) {
            remove(collection, deleting.id)
            logAudit({ action: `${entityType}.deleted`, entityType, entityId: deleting.id, summary: `${titleNoun(noun)} “${deleting.name}” deleted.` })
            toast.success(`${titleNoun(noun)} deleted`, { description: `${deleting.name} removed from local demo data.` })
          }
          setDeleting(null)
        }}
      />
    </div>
  )
}

function titleNoun(noun: string) {
  return noun.charAt(0).toUpperCase() + noun.slice(1)
}

/** Name + auto-generated slug inputs used by every taxonomy form. */
export function NameSlugFields<D extends NameSlugDraft>({
  idPrefix,
  draft,
  set,
  errors,
  slugLocked,
  slugHint,
}: {
  idPrefix: string
  draft: D
  set: (patch: Partial<D>) => void
  errors: FieldErrors<D>
  slugLocked?: boolean
  slugHint?: string
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Name" htmlFor={`${idPrefix}-name`}>
        <Input
          id={`${idPrefix}-name`}
          value={draft.name}
          required
          aria-invalid={!!errors.name}
          onChange={(e) => {
            const name = e.target.value
            set({ name, ...(draft.slugTouched || slugLocked ? {} : { slug: slugify(name) }) } as Partial<D>)
          }}
        />
        {errors.name && <FieldError>{errors.name}</FieldError>}
      </Field>
      <Field
        label="Slug"
        htmlFor={`${idPrefix}-slug`}
        description={slugLocked ? slugHint : "Auto-generated from the name; used in public URLs."}
      >
        <Input
          id={`${idPrefix}-slug`}
          value={draft.slug}
          disabled={slugLocked}
          aria-invalid={!!errors.slug}
          className="font-mono text-sm"
          onChange={(e) => set({ slug: slugify(e.target.value), slugTouched: true } as Partial<D>)}
        />
        {errors.slug && <FieldError>{errors.slug}</FieldError>}
      </Field>
    </div>
  )
}

