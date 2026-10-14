import type { ColumnDef } from "@tanstack/react-table"
import { ExternalLink, MoreHorizontal, Pencil, Unlink, UserPlus } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { ConfirmDialog } from "@/components/shared/overlays"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { VerificationBadge } from "@/components/shared/verification-badge"
import { PersonAvatar } from "@/components/shared/visuals"
import { getDoctor, getSpecialty } from "@/data/selectors"
import { createId } from "@/lib/mock-storage"
import type { Affiliation, Doctor } from "@/types"
import { AffiliationDialog } from "../components/affiliation-dialog"
import { MissingProviderState, ReadOnlyNotice } from "../components/portal-widgets"
import { WEEKDAY_SHORT, validateAffiliation, type AffiliationDraft, type AffiliationErrors } from "../lib/provider-workflow"
import { useManagedHospital } from "../use-managed-hospital"

interface Row {
  affiliation: Affiliation
  doctor: Doctor
}

const EMPTY: AffiliationDraft = { targetId: "", role: "", days: [] }

export default function DoctorsPage() {
  const { hospital, data, canEdit, create, update, logAudit } = useManagedHospital()
  const [dialog, setDialog] = useState<"add" | Affiliation | null>(null)
  const [draft, setDraft] = useState<AffiliationDraft>(EMPTY)
  const [errors, setErrors] = useState<AffiliationErrors>({})
  const [ending, setEnding] = useState<Row | null>(null)

  const rows = useMemo<Row[]>(
    () =>
      data.affiliations
        .filter((a) => a.hospitalId === hospital?.id)
        .map((a) => ({ affiliation: a, doctor: getDoctor(data, a.doctorId) }))
        .filter((r): r is Row => r.doctor !== undefined),
    [data, hospital?.id],
  )

  const columns = useMemo<ColumnDef<Row, unknown>[]>(
    () => [
      {
        id: "doctor",
        accessorFn: (r) => r.doctor.name,
        meta: { label: "Doctor" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Doctor" />,
        cell: ({ row }) => (
          <div className="flex min-w-44 items-center gap-3">
            <PersonAvatar name={row.original.doctor.name} className="size-8" />
            <div className="min-w-0">
              <p className="font-medium">{row.original.doctor.name}</p>
              <p className="text-xs text-muted-foreground">{row.original.doctor.experienceYears} yrs experience</p>
            </div>
          </div>
        ),
      },
      {
        id: "specialty",
        accessorFn: (r) => getSpecialty(data, r.doctor.specialtyId)?.name ?? "—",
        meta: { label: "Specialty" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Specialty" />,
      },
      {
        id: "role",
        accessorFn: (r) => r.affiliation.role,
        meta: { label: "Role" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      },
      {
        id: "days",
        accessorFn: (r) => r.affiliation.days.map((d) => WEEKDAY_SHORT[d]).join(", "),
        meta: { label: "Days" },
        header: "Days",
        cell: ({ getValue }) => <span className="whitespace-nowrap">{String(getValue()) || "—"}</span>,
      },
      {
        id: "status",
        accessorFn: (r) => r.affiliation.status,
        meta: { label: "Status" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => <StatusBadge status={row.original.affiliation.status} />,
      },
      {
        id: "verification",
        accessorFn: (r) => r.doctor.verification.status,
        meta: { label: "Verification" },
        header: "Verification",
        cell: ({ row }) => <VerificationBadge status={row.original.doctor.verification.status} lastVerifiedAt={row.original.doctor.verification.lastVerifiedAt} />,
      },
      {
        id: "actions",
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const { affiliation: a, doctor } = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${doctor.name}`}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>{doctor.name}</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to={`/doctor/${doctor.slug}`}>
                    <ExternalLink /> View public profile
                  </Link>
                </DropdownMenuItem>
                {canEdit && a.status !== "ended" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => {
                        setErrors({})
                        setDraft({ targetId: a.doctorId, role: a.role, days: a.days })
                        setDialog(a)
                      }}
                    >
                      <Pencil /> Edit role & days
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onSelect={() => setEnding(row.original)}>
                      <Unlink /> End affiliation
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [data, canEdit],
  )

  if (!hospital) return <MissingProviderState kind="hospital" />

  const linked = new Set(rows.filter((r) => r.affiliation.status !== "ended").map((r) => r.doctor.id))
  const candidates = data.doctors.filter((d) => !linked.has(d.id) && d.status !== "suspended").sort((a, b) => a.name.localeCompare(b.name))

  const submit = () => {
    const isAdd = dialog === "add"
    const e = validateAffiliation(draft, isAdd)
    setErrors(e)
    if (Object.keys(e).length > 0) return false
    const doctor = getDoctor(data, draft.targetId)
    if (isAdd) {
      const id = createId("aff")
      create("affiliations", { id, doctorId: draft.targetId, hospitalId: hospital.id, role: draft.role.trim(), days: draft.days, status: "pending" })
      logAudit({ action: "affiliation.invited", entityType: "hospital", entityId: hospital.id, summary: `Invited ${doctor?.name ?? "doctor"} to join ${hospital.name} as ${draft.role.trim()}.` })
      toast.success("Affiliation invite sent (demo)", { description: `${doctor?.name ?? "The doctor"} appears as pending until the affiliation is confirmed.` })
    } else if (dialog) {
      update("affiliations", dialog.id, { role: draft.role.trim(), days: draft.days })
      logAudit({ action: "affiliation.updated", entityType: "hospital", entityId: hospital.id, summary: `Updated ${doctor?.name ?? "doctor"}'s role/days at ${hospital.name}.` })
      toast.success("Affiliation updated", { description: "Saved locally in this demo." })
    }
    setDialog(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctors"
        description="Doctors affiliated with your hospital. New affiliations stay pending until confirmed, and doctor credentials are verified separately."
        actions={
          canEdit && (
            <Button
              disabled={candidates.length === 0}
              onClick={() => {
                setErrors({})
                setDraft(EMPTY)
                setDialog("add")
              }}
            >
              <UserPlus /> Add doctor
            </Button>
          )
        }
      />
      {!canEdit && <ReadOnlyNotice />}

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(r) => r.affiliation.id}
        getSearchText={(r) => `${r.doctor.name} ${r.affiliation.role} ${getSpecialty(data, r.doctor.specialtyId)?.name ?? ""}`}
        searchPlaceholder="Search doctors, roles or specialties…"
        filters={[
          {
            columnId: "status",
            title: "Status",
            options: (["active", "pending", "ended"] as const).map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1), count: rows.filter((r) => r.affiliation.status === s).length })),
          },
        ]}
        initialSorting={[{ id: "doctor", desc: false }]}
        exportFilename="hospital-doctors"
        exportColumns={[
          { header: "Doctor", value: (r) => r.doctor.name },
          { header: "Specialty", value: (r) => getSpecialty(data, r.doctor.specialtyId)?.name ?? "" },
          { header: "Role", value: (r) => r.affiliation.role },
          { header: "Days", value: (r) => r.affiliation.days.join(" ") },
          { header: "Status", value: (r) => r.affiliation.status },
          { header: "Verification", value: (r) => r.doctor.verification.status },
        ]}
        emptyTitle="No affiliated doctors"
        emptyDescription="Add doctors who consult at your hospital."
        caption="Doctors affiliated with the hospital"
      />

      <AffiliationDialog
        open={dialog !== null}
        onOpenChange={(o) => !o && setDialog(null)}
        title={dialog === "add" ? "Add doctor" : "Edit affiliation"}
        description={dialog === "add" ? "Invite an existing listed doctor. The affiliation stays pending until confirmed (demo)." : "Update this doctor's role and consulting days."}
        submitLabel={dialog === "add" ? "Send invite" : "Save"}
        target={
          dialog === "add"
            ? {
                label: "Doctor",
                placeholder: "Choose a doctor",
                options: candidates.map((d) => ({ value: d.id, label: `${d.name} — ${getSpecialty(data, d.specialtyId)?.name ?? ""}, ${d.city}` })),
              }
            : undefined
        }
        draft={draft}
        onDraftChange={setDraft}
        errors={errors}
        onSubmit={submit}
      />

      <ConfirmDialog
        open={!!ending}
        onOpenChange={(o) => !o && setEnding(null)}
        title={`End affiliation with ${ending?.doctor.name ?? ""}?`}
        description="The doctor will no longer be listed under your hospital. The record is kept with status “ended”."
        confirmLabel="End affiliation"
        destructive
        onConfirm={() => {
          if (!ending) return
          update("affiliations", ending.affiliation.id, { status: "ended" })
          logAudit({ action: "affiliation.ended", entityType: "hospital", entityId: hospital.id, summary: `Ended affiliation with ${ending.doctor.name}.` })
          toast.success("Affiliation ended", { description: "Saved locally in this demo." })
          setEnding(null)
        }}
      />
    </div>
  )
}
