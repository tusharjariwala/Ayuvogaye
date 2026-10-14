import type { ColumnDef } from "@tanstack/react-table"
import { Ban, CheckCircle2, ExternalLink, EyeOff, Flag, FlagTriangleRight, RotateCcw } from "lucide-react"
import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { ConfirmDialog } from "@/components/shared/overlays"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import type { Collections } from "@/data"
import { getReviewTargetName } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { formatDate, formatDateTime } from "@/lib/formatters"
import type { ReportedContent } from "@/types"
import { RowActions, StatGrid } from "../components/admin-ui"
import { useReviewModeration } from "../hooks/use-review-moderation"
import { getProviderLabel, providerPublicPath } from "../lib/admin-helpers"

const REASON_LABELS: Record<ReportedContent["reason"], string> = {
  inaccurate_information: "Inaccurate information",
  inappropriate_content: "Inappropriate content",
  spam: "Spam",
  impersonation: "Impersonation",
  other: "Other",
}

const STATUS_LABELS: Record<ReportedContent["status"], string> = { open: "Open", resolved: "Resolved", dismissed: "Dismissed" }

type Decision = "resolve" | "resolve_hide" | "dismiss" | "reopen"

function describeTarget(data: Collections, r: ReportedContent): { label: string; path?: string } {
  if (r.entityType === "review") {
    const review = data.reviews.find((x) => x.id === r.entityId)
    if (!review) return { label: "Deleted review" }
    return {
      label: `Review by ${review.patientDisplayName} on ${getReviewTargetName(data, review)}`,
      path: providerPublicPath(data, review.targetType, review.targetId),
    }
  }
  return { label: getProviderLabel(data, r.entityType, r.entityId), path: providerPublicPath(data, r.entityType, r.entityId) }
}

export default function ReportedContentPage() {
  const { data, update, logAudit } = useDemoStore()
  const { setReviewStatus } = useReviewModeration()
  const navigate = useNavigate()
  const [pending, setPending] = useState<{ report: ReportedContent; decision: Decision } | null>(null)
  const reports = data.reportedContent

  const decide = (report: ReportedContent, decision: Decision, note?: string) => {
    const status: ReportedContent["status"] = decision === "dismiss" ? "dismissed" : decision === "reopen" ? "open" : "resolved"
    update("reportedContent", report.id, { status })
    const target = describeTarget(data, report).label
    logAudit({
      action: `report.${status === "open" ? "reopened" : status}`,
      entityType: report.entityType,
      entityId: report.entityId,
      summary: `Report on ${target} (${REASON_LABELS[report.reason]}) ${status === "open" ? "reopened" : status}${note ? ` — ${note}` : ""}.`,
    })
    if (decision === "resolve_hide") {
      const review = data.reviews.find((x) => x.id === report.entityId)
      if (review) setReviewStatus([review], "hidden", note ?? `Resolved report: ${REASON_LABELS[report.reason]}`)
    }
    toast.success(`Report ${status === "open" ? "reopened" : status}`, { description: "Demo moderation — the reporter is not contacted." })
  }

  const columns = useMemo<ColumnDef<ReportedContent, unknown>[]>(
    () => [
      {
        id: "entity",
        meta: { label: "Reported item" },
        accessorFn: (r) => describeTarget(data, r).label,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Reported item" />,
        cell: ({ row }) => {
          const t = describeTarget(data, row.original)
          return (
            <div className="min-w-48 space-y-1">
              <Badge variant="outline" className="capitalize">
                {row.original.entityType}
              </Badge>
              {t.path ? (
                <Link to={t.path} className="block font-medium hover:text-primary hover:underline">
                  {t.label}
                </Link>
              ) : (
                <p className="font-medium">{t.label}</p>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "reason",
        meta: { label: "Reason" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Reason" />,
        cell: ({ row }) => <span className="whitespace-nowrap">{REASON_LABELS[row.original.reason]}</span>,
      },
      {
        accessorKey: "details",
        meta: { label: "Details" },
        header: "Details",
        enableSorting: false,
        cell: ({ row }) => <p className="line-clamp-2 max-w-72 text-muted-foreground">{row.original.details}</p>,
      },
      { accessorKey: "reportedBy", meta: { label: "Reporter" }, header: ({ column }) => <DataTableColumnHeader column={column} title="Reporter" /> },
      {
        accessorKey: "createdAt",
        meta: { label: "Reported" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Reported" />,
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.createdAt)}</span>,
      },
      {
        accessorKey: "status",
        meta: { label: "Status" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const r = row.original
          const t = describeTarget(data, r)
          const open = r.status === "open"
          return (
            <RowActions
              label={`report ${r.id}`}
              title={REASON_LABELS[r.reason]}
              actions={[
                { label: "View target", icon: ExternalLink, disabled: !t.path, onSelect: () => t.path && navigate(t.path) },
                { label: "Resolve", icon: CheckCircle2, hidden: !open, separator: true, onSelect: () => setPending({ report: r, decision: "resolve" }) },
                {
                  label: "Resolve & hide review",
                  icon: EyeOff,
                  hidden: !open || r.entityType !== "review",
                  onSelect: () => setPending({ report: r, decision: "resolve_hide" }),
                },
                { label: "Dismiss", icon: Ban, hidden: !open, onSelect: () => setPending({ report: r, decision: "dismiss" }) },
                { label: "Reopen", icon: RotateCcw, hidden: open, separator: true, onSelect: () => setPending({ report: r, decision: "reopen" }) },
              ]}
            />
          )
        },
      },
    ],
    [data, navigate],
  )

  const count = (s: ReportedContent["status"]) => reports.filter((r) => r.status === s).length
  const copy: Record<Decision, { title: string; description: string; label: string }> = {
    resolve: { title: "Resolve report?", description: "Mark the report as handled. The reported content itself is not changed.", label: "Resolve" },
    resolve_hide: {
      title: "Resolve and hide review?",
      description: "The report is resolved and the review is hidden from public view. The provider is notified (simulated).",
      label: "Resolve & hide",
    },
    dismiss: { title: "Dismiss report?", description: "No action is needed. The report is closed as dismissed.", label: "Dismiss" },
    reopen: { title: "Reopen report?", description: "The report returns to the open queue.", label: "Reopen" },
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reported content"
        description="Reports about reviews and provider profiles submitted through “Report inaccurate profile” and review report links."
      />
      <StatGrid>
        <StatCard label="Open reports" value={count("open")} icon={Flag} />
        <StatCard label="Resolved" value={count("resolved")} icon={CheckCircle2} />
        <StatCard label="Dismissed" value={count("dismissed")} icon={Ban} />
        <StatCard label="About profiles" value={reports.filter((r) => r.entityType !== "review").length} icon={FlagTriangleRight} hint="Hospitals and doctors" />
      </StatGrid>

      <DataTable
        columns={columns}
        data={reports}
        getRowId={(r) => r.id}
        getSearchText={(r) => `${describeTarget(data, r).label} ${r.details} ${r.reportedBy} ${REASON_LABELS[r.reason]}`}
        searchPlaceholder="Search reports…"
        filters={[
          {
            columnId: "status",
            title: "Status",
            options: (Object.keys(STATUS_LABELS) as ReportedContent["status"][]).map((s) => ({ value: s, label: STATUS_LABELS[s], count: count(s) })),
          },
          {
            columnId: "reason",
            title: "Reason",
            options: (Object.keys(REASON_LABELS) as ReportedContent["reason"][]).map((s) => ({
              value: s,
              label: REASON_LABELS[s],
              count: reports.filter((r) => r.reason === s).length,
            })),
          },
        ]}
        initialSorting={[{ id: "createdAt", desc: true }]}
        exportFilename="reported-content"
        exportColumns={[
          { header: "ID", value: (r) => r.id },
          { header: "Entity type", value: (r) => r.entityType },
          { header: "Reported item", value: (r) => describeTarget(data, r).label },
          { header: "Reason", value: (r) => REASON_LABELS[r.reason] },
          { header: "Details", value: (r) => r.details },
          { header: "Reporter", value: (r) => r.reportedBy },
          { header: "Reported", value: (r) => formatDateTime(r.createdAt) },
          { header: "Status", value: (r) => STATUS_LABELS[r.status] },
        ]}
        emptyTitle="No reports"
        caption="Reported content"
      />

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title={pending ? copy[pending.decision].title : ""}
        description={pending ? `${copy[pending.decision].description} Reported: ${describeTarget(data, pending.report).label}.` : ""}
        confirmLabel={pending ? copy[pending.decision].label : "Confirm"}
        destructive={pending?.decision === "resolve_hide"}
        withNote={pending?.decision !== "reopen"}
        noteLabel="Resolution note"
        onConfirm={(note) => {
          if (pending) decide(pending.report, pending.decision, note)
          setPending(null)
        }}
      />
    </div>
  )
}
