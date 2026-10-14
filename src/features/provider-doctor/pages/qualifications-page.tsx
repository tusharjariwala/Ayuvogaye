import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Plus } from "lucide-react"
import { useState, type ChangeEvent, type WheelEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { DeleteConfirmationDialog, EntityFormDialog } from "@/components/shared/overlays"
import { PageHeader } from "@/components/shared/page-header"
import { SourceBadge } from "@/components/shared/trust-badges"
import { InlineError } from "@/features/provider-hospital/components/inline-error"
import { MissingProviderState, PendingChangesNotice } from "@/features/provider-hospital/components/portal-widgets"
import { createId } from "@/lib/mock-storage"
import type { Qualification } from "@/types"
import { useManagedDoctor } from "../use-managed-doctor"

interface Draft {
  degree: string
  institution: string
  year: string
}
type Errors = Partial<Record<keyof Draft, string>>

const CURRENT_YEAR = new Date().getFullYear()

function validate(d: Draft): Errors {
  const e: Errors = {}
  if (d.degree.trim().length < 2) e.degree = "Enter the degree or diploma"
  if (d.institution.trim().length < 3) e.institution = "Enter the institution"
  const y = Number(d.year)
  if (!Number.isInteger(y) || y < 1950 || y > CURRENT_YEAR) e.year = `Enter a year between 1950 and ${CURRENT_YEAR}`
  return e
}

export default function QualificationsPage() {
  const { doctor, pendingChanges, saveDoctor } = useManagedDoctor()
  const [editing, setEditing] = useState<Qualification | "new" | null>(null)
  const [draft, setDraft] = useState<Draft>({ degree: "", institution: "", year: "" })
  const [errors, setErrors] = useState<Errors>({})

  const open = (q: Qualification | "new") => {
    setErrors({})
    setDraft(q === "new" ? { degree: "", institution: "", year: "" } : { degree: q.degree, institution: q.institution, year: String(q.year) })
    setEditing(q)
  }

  const persist = (next: Qualification[], summary: string) =>
    saveDoctor({ qualifications: next }, { fields: ["qualifications"], summary, action: "doctor.qualifications_updated", toastTitle: "Qualifications saved" })

  const quals = doctor?.qualifications ?? []
  const columns: ColumnDef<Qualification, unknown>[] = [
    { accessorKey: "degree", meta: { label: "Degree" }, header: ({ column }) => <DataTableColumnHeader column={column} title="Degree" />, cell: ({ row }) => <span className="font-medium">{row.original.degree}</span> },
    { accessorKey: "institution", meta: { label: "Institution" }, header: ({ column }) => <DataTableColumnHeader column={column} title="Institution" />, cell: ({ row }) => <span className="block min-w-48">{row.original.institution}</span> },
    { accessorKey: "year", meta: { label: "Year" }, header: ({ column }) => <DataTableColumnHeader column={column} title="Year" /> },
    { accessorKey: "source", meta: { label: "Source" }, header: "Source", cell: ({ row }) => <SourceBadge source={row.original.source} /> },
    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" aria-label={`Edit ${row.original.degree}`} onClick={() => open(row.original)}>
            <Pencil />
          </Button>
          <DeleteConfirmationDialog itemName={row.original.degree} onConfirm={() => persist(quals.filter((q) => q.id !== row.original.id), `Removed qualification ${row.original.degree}`)} />
        </div>
      ),
    },
  ]

  if (!doctor) return <MissingProviderState kind="doctor" />

  const submit = () => {
    const e = validate(draft)
    setErrors(e)
    if (Object.keys(e).length > 0) return false
    const clean = { degree: draft.degree.trim(), institution: draft.institution.trim(), year: Number(draft.year) }
    // New or edited entries are provider-submitted until the platform re-checks them.
    if (editing === "new") persist([...quals, { id: createId("q"), ...clean, source: "provider_submitted" }], `Added qualification ${clean.degree}`)
    else if (editing) persist(quals.map((q) => (q.id === editing.id ? { ...q, ...clean, source: "provider_submitted" } : q)), `Edited qualification ${clean.degree}`)
    setEditing(null)
  }

  const input = (key: keyof Draft) => ({
    id: `q-${key}`,
    value: draft[key],
    onChange: (ev: ChangeEvent<HTMLInputElement>) => setDraft((d) => ({ ...d, [key]: ev.target.value })),
    "aria-invalid": !!errors[key],
    "aria-describedby": errors[key] ? `q-${key}-err` : undefined,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Qualifications"
        description="Degrees and diplomas shown on your profile. New or edited entries are marked provider-submitted until the platform verifies them."
        actions={
          <Button onClick={() => open("new")}>
            <Plus /> Add qualification
          </Button>
        }
      />
      <PendingChangesNotice requests={pendingChanges.filter((c) => c.fields.includes("qualifications"))} verified={doctor.verification.status === "verified"} />

      <DataTable
        columns={columns}
        data={quals}
        getRowId={(q) => q.id}
        getSearchText={(q) => `${q.degree} ${q.institution} ${q.year}`}
        searchPlaceholder="Search qualifications…"
        initialSorting={[{ id: "year", desc: false }]}
        emptyTitle="No qualifications"
        emptyDescription="Add your degrees so patients understand your training."
        caption="Qualifications"
      />

      <EntityFormDialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? "Add qualification" : "Edit qualification"}
        description="Saved as provider-submitted and sent for platform review (demo)."
        onSubmit={submit}
      >
        <div className="space-y-2">
          <Label htmlFor="q-degree">Degree</Label>
          <Input {...input("degree")} placeholder="e.g. MD (General Medicine)" />
          <InlineError id="q-degree-err" message={errors.degree} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="q-institution">Institution</Label>
          <Input {...input("institution")} />
          <InlineError id="q-institution-err" message={errors.institution} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="q-year">Year completed</Label>
          <Input {...input("year")} type="number" inputMode="numeric" className="max-w-32" onWheel={(e: WheelEvent<HTMLInputElement>) => e.currentTarget.blur()} />
          <InlineError id="q-year-err" message={errors.year} />
        </div>
      </EntityFormDialog>
    </div>
  )
}
