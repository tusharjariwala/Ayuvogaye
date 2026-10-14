import type { ColumnDef } from "@tanstack/react-table"
import { ClipboardList, Eye, RotateCcw, ShieldAlert, ShieldCheck, ShieldX, TimerReset } from "lucide-react"
import { useMemo, useState } from "react"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { DemoNotice } from "@/components/shared/demo-notice"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { VerificationBadge, VerificationExplainer } from "@/components/shared/verification-badge"
import { useDemoStore } from "@/hooks/use-demo-store"
import { VERIFICATION_LABELS } from "@/lib/constants"
import { formatDate, formatDateTime } from "@/lib/formatters"
import type { VerificationCase, VerificationStatus } from "@/types"
import { CellTitle, RowActions, StatGrid, StatusTabs } from "../components/admin-ui"
import { VerificationCaseSheet } from "../components/verification-case-sheet"
import { VerificationDecisionDialog, type PendingDecision } from "../components/verification-decision-dialog"
import { VERIFICATION_DECISIONS, availableDecisions, type VerificationDecision } from "../hooks/use-verification-actions"
import { PROVIDER_LABEL, getProvider } from "../lib/admin-helpers"

const TABS: { value: "all" | VerificationStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Needs reverification" },
]

const DECISION_ICON: Record<VerificationDecision, typeof ShieldCheck> = {
  start_review: ClipboardList,
  approve: ShieldCheck,
  reject: ShieldX,
  request_changes: RotateCcw,
  mark_expired: ShieldAlert,
}

export default function VerificationsPage() {
  const { data } = useDemoStore()
  const [tab, setTab] = useState<string>("submitted")
  const [detailId, setDetailId] = useState<string | null>(null)
  const [decision, setDecision] = useState<PendingDecision | null>(null)

  const cases = data.verificationCases
  const visible = useMemo(() => (tab === "all" ? cases : cases.filter((c) => c.status === tab)), [cases, tab])
  const count = (s: VerificationStatus) => cases.filter((c) => c.status === s).length

  const ask = (vc: VerificationCase, d: VerificationDecision) =>
    setDecision({ type: vc.entityType, ids: [{ id: vc.entityId, name: vc.entityName }], decision: d })

  const columns = useMemo<ColumnDef<VerificationCase, unknown>[]>(
    () => [
      {
        accessorKey: "entityName",
        meta: { label: "Provider" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Provider" />,
        cell: ({ row }) => <CellTitle title={row.original.entityName} subtitle={`Case ${row.original.id}`} />,
      },
      {
        accessorKey: "entityType",
        meta: { label: "Type" },
        header: "Type",
        cell: ({ row }) => PROVIDER_LABEL[row.original.entityType],
      },
      {
        accessorKey: "status",
        meta: { label: "Status" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => <VerificationBadge status={row.original.status} withTooltip={false} />,
      },
      {
        accessorKey: "submittedAt",
        meta: { label: "Submitted" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted" />,
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.submittedAt)}</span>,
      },
      {
        id: "checklist",
        meta: { label: "Checklist" },
        accessorFn: (c) => (c.checklist.length ? c.checklist.filter((i) => i.done).length / c.checklist.length : 0),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Checklist" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">
            {row.original.checklist.filter((i) => i.done).length}/{row.original.checklist.length}
          </span>
        ),
      },
      {
        id: "reviewer",
        accessorFn: (c) => c.reviewer ?? "",
        meta: { label: "Reviewer" },
        header: "Reviewer",
        cell: ({ row }) => row.original.reviewer ?? <span className="text-muted-foreground">Unassigned</span>,
      },
      {
        id: "reviewedAt",
        accessorFn: (c) => c.reviewedAt ?? "",
        meta: { label: "Reviewed" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Reviewed" />,
        cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(row.original.reviewedAt)}</span>,
      },
      {
        id: "actions",
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const vc = row.original
          const exists = !!getProvider(data, vc.entityType, vc.entityId)
          return (
            <RowActions
              label={vc.entityName}
              actions={[
                { label: "View case", icon: Eye, onSelect: () => setDetailId(vc.id) },
                ...availableDecisions(vc.status).map((d, i) => ({
                  label: VERIFICATION_DECISIONS[d].verb,
                  icon: DECISION_ICON[d],
                  onSelect: () => ask(vc, d),
                  disabled: !exists,
                  separator: i === 0,
                  destructive: d === "reject",
                })),
              ]}
            />
          )
        },
      },
    ],
    [data],
  )

  const detail = cases.find((c) => c.id === detailId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verification queue"
        description="Review provider verification cases. Decisions update the provider's public badge and notify the linked account (simulated)."
        actions={<VerificationExplainer />}
      />

      <StatGrid>
        <StatCard label="Awaiting review" value={count("submitted")} icon={ClipboardList} hint="Submitted, not started" />
        <StatCard label="Under review" value={count("under_review")} icon={TimerReset} />
        <StatCard label="Verified" value={count("verified")} icon={ShieldCheck} />
        <StatCard label="Needs reverification" value={count("expired")} icon={ShieldAlert} hint={`${count("rejected")} rejected`} />
      </StatGrid>

      <DemoNotice>
        Evidence entries are placeholders — no documents are uploaded or stored. Verification confirms selected details only and is not a
        rating of clinical quality.
      </DemoNotice>

      <StatusTabs
        value={tab}
        onValueChange={setTab}
        label="Filter cases by status"
        tabs={TABS.map((t) => ({ value: t.value, label: t.label, count: t.value === "all" ? cases.length : count(t.value) }))}
      >
        <DataTable
          key={tab}
          columns={columns}
          data={visible}
          getRowId={(c) => c.id}
          getSearchText={(c) => `${c.entityName} ${c.id} ${c.reviewer ?? ""}`}
          searchPlaceholder="Search by provider, case ID or reviewer…"
          filters={[
            {
              columnId: "entityType",
              title: "Type",
              options: [
                { value: "hospital", label: "Hospital", count: visible.filter((c) => c.entityType === "hospital").length },
                { value: "doctor", label: "Doctor", count: visible.filter((c) => c.entityType === "doctor").length },
              ],
            },
          ]}
          initialSorting={[{ id: "submittedAt", desc: true }]}
          onRowClick={(c) => setDetailId(c.id)}
          exportFilename="verification-cases"
          exportColumns={[
            { header: "Case", value: (c) => c.id },
            { header: "Provider", value: (c) => c.entityName },
            { header: "Type", value: (c) => PROVIDER_LABEL[c.entityType] },
            { header: "Status", value: (c) => VERIFICATION_LABELS[c.status] },
            { header: "Submitted", value: (c) => formatDateTime(c.submittedAt) },
            { header: "Reviewer", value: (c) => c.reviewer ?? "" },
            { header: "Reviewed", value: (c) => (c.reviewedAt ? formatDateTime(c.reviewedAt) : "") },
          ]}
          emptyTitle="No cases in this queue"
          emptyDescription="Cases appear here when providers submit evidence or an admin makes a decision."
          caption="Verification cases"
        />
      </StatusTabs>

      <VerificationCaseSheet
        caseId={detailId}
        onOpenChange={(o) => !o && setDetailId(null)}
        onDecision={(d) => detail && ask(detail, d)}
      />
      <VerificationDecisionDialog pending={decision} onClose={() => setDecision(null)} />
    </div>
  )
}
