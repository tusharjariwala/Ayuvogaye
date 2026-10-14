import type { ColumnDef } from "@tanstack/react-table"
import { Activity, CalendarDays, ScrollText, UserCog } from "lucide-react"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { DemoNotice } from "@/components/shared/demo-notice"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { useDemoStore } from "@/hooks/use-demo-store"
import { ROLE_LABELS } from "@/lib/constants"
import { formatDateTime, formatRelative, titleCase } from "@/lib/formatters"
import type { AuditLog } from "@/types"
import { StatGrid } from "../components/admin-ui"

const roleLabel = (r: AuditLog["actorRole"]) => (r === "system" ? "System" : ROLE_LABELS[r])

export default function AuditLogsPage() {
  const { data } = useDemoStore()
  const logs = data.auditLogs

  const columns = useMemo<ColumnDef<AuditLog, unknown>[]>(
    () => [
      {
        accessorKey: "at",
        meta: { label: "Time" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Time" />,
        cell: ({ row }) => (
          <time dateTime={row.original.at} className="block whitespace-nowrap">
            {formatDateTime(row.original.at)}
            <span className="block text-xs text-muted-foreground">{formatRelative(row.original.at)}</span>
          </time>
        ),
      },
      { accessorKey: "actor", meta: { label: "Actor" }, header: ({ column }) => <DataTableColumnHeader column={column} title="Actor" /> },
      {
        accessorKey: "actorRole",
        meta: { label: "Role" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
        cell: ({ row }) => <Badge variant={row.original.actorRole === "system" ? "muted" : "outline"}>{roleLabel(row.original.actorRole)}</Badge>,
      },
      {
        accessorKey: "action",
        meta: { label: "Action" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
        cell: ({ row }) => <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs whitespace-nowrap">{row.original.action}</code>,
      },
      {
        accessorKey: "entityType",
        meta: { label: "Entity" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Entity" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {titleCase(row.original.entityType)}
            {row.original.entityId && <span className="block font-mono text-xs text-muted-foreground">{row.original.entityId}</span>}
          </span>
        ),
      },
      {
        accessorKey: "summary",
        meta: { label: "Summary" },
        header: "Summary",
        enableSorting: false,
        cell: ({ row }) => <p className="min-w-64 max-w-md text-muted-foreground">{row.original.summary}</p>,
      },
    ],
    [],
  )

  const roles = [...new Set(logs.map((l) => l.actorRole))]
  const entities = [...new Set(logs.map((l) => l.entityType))].sort()
  const [dayAgo] = useState(() => Date.now() - 24 * 60 * 60 * 1000)

  return (
    <div className="space-y-6">
      <PageHeader title="Audit logs" description="Chronological record of administrative and provider actions, newest first." />

      <StatGrid>
        <StatCard label="Log entries" value={logs.length} icon={ScrollText} />
        <StatCard label="Last 24 hours" value={logs.filter((l) => new Date(l.at).getTime() >= dayAgo).length} icon={CalendarDays} />
        <StatCard label="Admin actions" value={logs.filter((l) => l.actorRole === "platform_admin").length} icon={UserCog} />
        <StatCard label="Distinct actors" value={new Set(logs.map((l) => l.actor)).size} icon={Activity} />
      </StatGrid>

      <DemoNotice>This audit log is stored locally in this browser only. Resetting demo data restores the sample log.</DemoNotice>

      <DataTable
        columns={columns}
        data={logs}
        getRowId={(l) => l.id}
        getSearchText={(l) => `${l.actor} ${l.action} ${l.summary} ${l.entityId ?? ""}`}
        searchPlaceholder="Search actor, action or summary…"
        filters={[
          { columnId: "actorRole", title: "Actor role", options: roles.map((r) => ({ value: r, label: roleLabel(r), count: logs.filter((l) => l.actorRole === r).length })) },
          { columnId: "entityType", title: "Entity", options: entities.map((e) => ({ value: e, label: titleCase(e), count: logs.filter((l) => l.entityType === e).length })) },
        ]}
        initialSorting={[{ id: "at", desc: true }]}
        pageSize={20}
        exportFilename="audit-logs"
        exportColumns={[
          { header: "Time", value: (l) => l.at },
          { header: "Actor", value: (l) => l.actor },
          { header: "Role", value: (l) => roleLabel(l.actorRole) },
          { header: "Action", value: (l) => l.action },
          { header: "Entity type", value: (l) => l.entityType },
          { header: "Entity ID", value: (l) => l.entityId ?? "" },
          { header: "Summary", value: (l) => l.summary },
        ]}
        emptyTitle="No log entries"
        caption="Audit log"
      />
    </div>
  )
}
