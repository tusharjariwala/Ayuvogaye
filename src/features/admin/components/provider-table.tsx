import type { ColumnDef } from "@tanstack/react-table"
import {
  Ban,
  BadgeCheck,
  Building2,
  ClipboardList,
  Eye,
  Megaphone,
  Pencil,
  Plus,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Stethoscope,
  Trash2,
  UserCheck,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DataTable, DataTableColumnHeader, selectColumn } from "@/components/data-table"
import { ConfirmDialog, DeleteConfirmationDialog } from "@/components/shared/overlays"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { SponsoredBadge } from "@/components/shared/trust-badges"
import { VERIFICATION_ORDER, VerificationBadge, VerificationExplainer } from "@/components/shared/verification-badge"
import { useDemoStore } from "@/hooks/use-demo-store"
import { VERIFICATION_LABELS } from "@/lib/constants"
import { formatDate, formatPercent } from "@/lib/formatters"
import type { ProviderType } from "@/types"
import { useProviderActions } from "../hooks/use-provider-actions"
import { VERIFICATION_DECISIONS, availableDecisions, type VerificationDecision } from "../hooks/use-verification-actions"
import { PROVIDER_STATUSES, PROVIDER_STATUS_LABELS, toProviderRows, type ProviderRow } from "../lib/admin-helpers"
import { CellTitle, RowActions, StatGrid, type RowAction } from "./admin-ui"
import { ProviderDetailsSheet } from "./provider-details-sheet"
import { ProviderFormDialog } from "./provider-form-dialog"
import { VerificationDecisionDialog, type PendingDecision } from "./verification-decision-dialog"

const DECISION_ICON: Record<VerificationDecision, typeof ShieldCheck> = {
  start_review: ClipboardList,
  approve: ShieldCheck,
  reject: ShieldX,
  request_changes: RotateCcw,
  mark_expired: ShieldAlert,
}

const COPY: Record<ProviderType, { title: string; description: string; noun: string; plural: string }> = {
  hospital: {
    title: "Hospitals",
    description: "Manage hospital listings, verification decisions, sponsorship flags and pending profile changes.",
    noun: "hospital",
    plural: "hospitals",
  },
  doctor: {
    title: "Doctors",
    description: "Manage doctor profiles, verification decisions and pending profile changes.",
    noun: "doctor",
    plural: "doctors",
  },
}

interface StatusChange {
  rows: ProviderRow[]
  status: "active" | "suspended"
  onDone?: () => void
}

/** Full provider management view (header, KPIs, table, dialogs) shared by the hospitals and doctors pages. */
export function ProviderManagement({ type }: { type: ProviderType }) {
  const { data } = useDemoStore()
  const { setStatus, deleteProvider } = useProviderActions()
  const copy = COPY[type]
  const rows = useMemo(() => toProviderRows(data, type), [data, type])

  const [detailId, setDetailId] = useState<string | null>(null)
  const [form, setForm] = useState<{ open: boolean; id?: string; key: number }>({ open: false, key: 0 })
  const [decision, setDecision] = useState<PendingDecision | null>(null)
  const [statusChange, setStatusChange] = useState<StatusChange | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProviderRow | null>(null)

  const openForm = (id?: string) => setForm((f) => ({ open: true, id, key: f.key + 1 }))
  const askDecision = (row: Pick<ProviderRow, "id" | "name">, d: VerificationDecision) =>
    setDecision({ type, ids: [{ id: row.id, name: row.name }], decision: d })

  const pendingVerification = rows.filter((r) => r.verificationStatus === "submitted" || r.verificationStatus === "under_review").length
  const verified = rows.filter((r) => r.verificationStatus === "verified").length
  const suspended = rows.filter((r) => r.status === "suspended").length
  const avgCompleteness = rows.length ? rows.reduce((s, r) => s + r.profileCompleteness, 0) / rows.length : 0

  const columns = useMemo<ColumnDef<ProviderRow, unknown>[]>(() => {
    const cols: ColumnDef<ProviderRow, unknown>[] = [
      selectColumn<ProviderRow>(),
      {
        accessorKey: "name",
        meta: { label: "Name" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => (
          <CellTitle
            title={row.original.name}
            subtitle={row.original.claimed ? "Claimed listing" : "Unclaimed listing"}
            className="min-w-44"
          />
        ),
      },
      {
        accessorKey: "category",
        meta: { label: type === "hospital" ? "Type" : "Specialty" },
        header: ({ column }) => <DataTableColumnHeader column={column} title={type === "hospital" ? "Type" : "Specialty"} />,
        cell: ({ row }) => <span className="whitespace-nowrap">{row.original.category}</span>,
      },
      {
        accessorKey: "city",
        meta: { label: "City" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="City" />,
      },
      {
        accessorKey: "verificationStatus",
        meta: { label: "Verification" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Verification" />,
        sortingFn: (a, b) =>
          VERIFICATION_ORDER.indexOf(a.original.verificationStatus) - VERIFICATION_ORDER.indexOf(b.original.verificationStatus),
        cell: ({ row }) => (
          <VerificationBadge status={row.original.verificationStatus} lastVerifiedAt={row.original.verification.lastVerifiedAt} />
        ),
      },
      {
        accessorKey: "status",
        meta: { label: "Status" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "sponsored",
        accessorFn: (r) => (r.sponsored ? "yes" : "no"),
        meta: { label: "Sponsored" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sponsored" />,
        cell: ({ row }) => (row.original.sponsored ? <SponsoredBadge /> : <span className="text-muted-foreground">—</span>),
      },
      {
        accessorKey: "profileCompleteness",
        meta: { label: "Profile completeness" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Profile" />,
        cell: ({ row }) => (
          <span className="flex min-w-28 items-center gap-2">
            <Progress value={row.original.profileCompleteness} aria-label={`Profile ${row.original.profileCompleteness}% complete`} />
            <span className="text-xs tabular-nums">{row.original.profileCompleteness}%</span>
          </span>
        ),
      },
      {
        accessorKey: "pendingChanges",
        meta: { label: "Pending changes" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Changes" />,
        cell: ({ row }) =>
          row.original.pendingChanges > 0 ? (
            <Badge variant="warning">{row.original.pendingChanges} pending</Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "updatedAt",
        meta: { label: "Last updated" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
        cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(row.original.updatedAt)}</span>,
      },
      {
        id: "actions",
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const r = row.original
          const actions: RowAction[] = [
            { label: "View details", icon: Eye, onSelect: () => setDetailId(r.id) },
            { label: "Edit", icon: Pencil, onSelect: () => openForm(r.id) },
            ...availableDecisions(r.verificationStatus).map((d, i) => ({
              label: VERIFICATION_DECISIONS[d].verb,
              icon: DECISION_ICON[d],
              onSelect: () => askDecision(r, d),
              separator: i === 0,
            })),
            r.status === "suspended"
              ? { label: "Reactivate", icon: UserCheck, onSelect: () => setStatusChange({ rows: [r], status: "active" }), separator: true }
              : { label: "Suspend", icon: Ban, onSelect: () => setStatusChange({ rows: [r], status: "suspended" }), separator: true },
            { label: "Delete", icon: Trash2, destructive: true, onSelect: () => setDeleteTarget(r) },
          ]
          return <RowActions label={r.name} actions={actions} />
        },
      },
    ]
    return type === "hospital" ? cols : cols.filter((c) => c.id !== "sponsored")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

  const filters = useMemo(
    () => [
      {
        columnId: "verificationStatus",
        title: "Verification",
        options: VERIFICATION_ORDER.map((s) => ({
          value: s,
          label: VERIFICATION_LABELS[s],
          count: rows.filter((r) => r.verificationStatus === s).length,
        })),
      },
      {
        columnId: "city",
        title: "City",
        options: [...new Set(rows.map((r) => r.city))].sort().map((c) => ({ value: c, label: c, count: rows.filter((r) => r.city === c).length })),
      },
      {
        columnId: "status",
        title: "Status",
        options: PROVIDER_STATUSES.map((s) => ({ value: s, label: PROVIDER_STATUS_LABELS[s], count: rows.filter((r) => r.status === s).length })),
      },
      type === "hospital"
        ? {
            columnId: "sponsored",
            title: "Sponsored",
            options: [
              { value: "yes", label: "Sponsored", count: rows.filter((r) => r.sponsored).length },
              { value: "no", label: "Not sponsored", count: rows.filter((r) => !r.sponsored).length },
            ],
          }
        : {
            columnId: "category",
            title: "Specialty",
            options: [...new Set(rows.map((r) => r.category))].sort().map((c) => ({ value: c, label: c, count: rows.filter((r) => r.category === c).length })),
          },
    ],
    [rows, type],
  )

  const Icon = type === "hospital" ? Building2 : Stethoscope

  return (
    <div className="space-y-6">
      <PageHeader
        title={copy.title}
        description={
          <>
            {copy.description} <VerificationExplainer />
          </>
        }
        actions={
          <Button onClick={() => openForm()}>
            <Plus /> Add {copy.noun}
          </Button>
        }
      />

      <StatGrid>
        <StatCard label={`Total ${copy.plural}`} value={rows.length} icon={Icon} hint={`${suspended} suspended`} />
        <StatCard label="Verified" value={verified} icon={BadgeCheck} hint={`${formatPercent(rows.length ? (verified / rows.length) * 100 : 0)} of listings`} />
        <StatCard label="Awaiting verification" value={pendingVerification} icon={ClipboardList} hint="Submitted or under review" />
        {type === "hospital" ? (
          <StatCard label="Sponsored" value={rows.filter((r) => r.sponsored).length} icon={Megaphone} hint="Labelled; no ranking effect" />
        ) : (
          <StatCard label="Avg. profile completeness" value={`${Math.round(avgCompleteness)}%`} icon={UserCheck} hint={`${rows.filter((r) => r.claimed).length} claimed`} />
        )}
      </StatGrid>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(r) => r.id}
        getSearchText={(r) => `${r.name} ${r.city} ${r.category} ${r.slug}`}
        searchPlaceholder={`Search ${copy.plural} by name, city or ${type === "hospital" ? "type" : "specialty"}…`}
        filters={filters}
        initialSorting={[{ id: "updatedAt", desc: true }]}
        onRowClick={(r) => setDetailId(r.id)}
        exportFilename={copy.plural}
        exportColumns={[
          { header: "ID", value: (r) => r.id },
          { header: "Name", value: (r) => r.name },
          { header: type === "hospital" ? "Type" : "Specialty", value: (r) => r.category },
          { header: "City", value: (r) => r.city },
          { header: "Verification", value: (r) => VERIFICATION_LABELS[r.verificationStatus] },
          { header: "Last verified", value: (r) => formatDate(r.verification.lastVerifiedAt) },
          { header: "Status", value: (r) => PROVIDER_STATUS_LABELS[r.status] },
          { header: "Sponsored", value: (r) => (r.sponsored ? "Yes" : "No") },
          { header: "Claimed", value: (r) => (r.claimed ? "Yes" : "No") },
          { header: "Profile completeness", value: (r) => `${r.profileCompleteness}%` },
        ]}
        bulkActions={(selected, clear) => (
          <>
            <Button
              size="sm"
              variant="outline"
              disabled={!selected.some((r) => r.status === "suspended")}
              onClick={() => setStatusChange({ rows: selected.filter((r) => r.status === "suspended"), status: "active", onDone: clear })}
            >
              <UserCheck /> Reactivate
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={!selected.some((r) => r.status !== "suspended")}
              onClick={() => setStatusChange({ rows: selected.filter((r) => r.status !== "suspended"), status: "suspended", onDone: clear })}
            >
              <Ban /> Suspend
            </Button>
          </>
        )}
        emptyTitle={`No ${copy.plural} found`}
        caption={copy.title}
      />

      <ProviderDetailsSheet
        type={type}
        providerId={detailId}
        onOpenChange={(o) => !o && setDetailId(null)}
        onEdit={() => detailId && openForm(detailId)}
        onDecision={(d) => {
          const row = rows.find((r) => r.id === detailId)
          if (row) askDecision(row, d)
        }}
      />

      <ProviderFormDialog
        key={form.key}
        type={type}
        open={form.open}
        providerId={form.id}
        onOpenChange={(o) => setForm((f) => ({ ...f, open: o }))}
      />

      <VerificationDecisionDialog pending={decision} onClose={() => setDecision(null)} />

      <ConfirmDialog
        open={!!statusChange}
        onOpenChange={(o) => !o && setStatusChange(null)}
        title={
          statusChange
            ? `${statusChange.status === "suspended" ? "Suspend" : "Reactivate"} ${statusChange.rows.length === 1 ? statusChange.rows[0].name : `${statusChange.rows.length} ${copy.plural}`}?`
            : ""
        }
        description={
          statusChange?.status === "suspended"
            ? "Suspended listings are hidden from public search and profile pages. Verification status is unchanged. Local demo change."
            : "The listing becomes visible again in public search. Local demo change."
        }
        confirmLabel={statusChange?.status === "suspended" ? "Suspend" : "Reactivate"}
        destructive={statusChange?.status === "suspended"}
        onConfirm={() => {
          if (statusChange) {
            setStatus(type, statusChange.rows.map((r) => r.id), statusChange.status)
            statusChange.onDone?.()
          }
          setStatusChange(null)
        }}
      />

      <DeleteConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        itemName={deleteTarget?.name ?? copy.noun}
        trigger={null}
        onConfirm={() => {
          if (deleteTarget) {
            if (detailId === deleteTarget.id) setDetailId(null)
            deleteProvider(type, deleteTarget.id)
          }
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
