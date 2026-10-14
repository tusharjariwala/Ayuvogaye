import type { ColumnDef } from "@tanstack/react-table"
import { ArrowRightCircle, Eye, MoreHorizontal, PhoneCall } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DataTable, DataTableColumnHeader, selectColumn } from "@/components/data-table"
import { ActivityTimeline } from "@/components/shared/activity-timeline"
import { ConfirmDialog, DetailList, DetailsSheet } from "@/components/shared/overlays"
import { StatusBadge } from "@/components/shared/status-badge"
import { getProviderName, getSpecialty, getTreatment } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { CONSULTATION_MODE_LABELS, ENQUIRY_STATUS_LABELS } from "@/lib/constants"
import { formatDate, formatDateTime, formatTime } from "@/lib/formatters"
import type { Enquiry, EnquiryStatus } from "@/types"
import type { LeadPerspective } from "@/features/appointments/components/appointments-table"
import { ENQUIRY_TRANSITIONS, useLeadActions } from "@/features/appointments/use-lead-actions"

const ACTION_LABEL: Record<EnquiryStatus, string> = {
  new: "Mark new",
  contacted: "Mark contacted",
  under_review: "Move to review",
  quote_sent: "Mark quote sent",
  converted: "Mark converted",
  closed: "Close enquiry",
}

interface EnquiriesTableProps {
  enquiries: Enquiry[]
  perspective: LeadPerspective
  pageSize?: number
}

/** Enquiry pipeline table with status workflow, details sheet and timeline. */
export function EnquiriesTable({ enquiries, perspective, pageSize = 10 }: EnquiriesTableProps) {
  const { data } = useDemoStore()
  const { changeEnquiryStatus, addEnquiryNote } = useLeadActions()
  const [detailId, setDetailId] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<{ enq: Enquiry; status: EnquiryStatus } | null>(null)
  const [note, setNote] = useState("")
  const detail = enquiries.find((e) => e.id === detailId) ?? null

  const transitionsFor = (e: Enquiry): EnquiryStatus[] =>
    perspective === "patient" ? (e.status === "closed" || e.status === "converted" ? [] : ["closed"]) : ENQUIRY_TRANSITIONS[e.status]

  const columns = useMemo<ColumnDef<Enquiry, unknown>[]>(
    () => [
      ...(perspective === "patient" ? [] : [selectColumn<Enquiry>()]),
      {
        accessorKey: "ref",
        meta: { label: "Reference" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ref" />,
        cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.ref}</span>,
      },
      {
        accessorKey: "subject",
        meta: { label: "Subject" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
        cell: ({ row }) => (
          <div className="min-w-40">
            <p className="font-medium">{row.original.subject}</p>
            {perspective !== "patient" && <p className="text-xs text-muted-foreground">{row.original.patientName}</p>}
          </div>
        ),
      },
      ...(perspective === "hospital"
        ? []
        : [
            {
              id: "provider",
              meta: { label: "Provider" },
              accessorFn: (e) => getProviderName(data, e),
              header: ({ column }) => <DataTableColumnHeader column={column} title="Provider" />,
              cell: ({ getValue }) => <span className="block max-w-56 truncate">{String(getValue())}</span>,
            } satisfies ColumnDef<Enquiry, unknown>,
          ]),
      {
        id: "treatment",
        meta: { label: "Treatment" },
        accessorFn: (e) => getTreatment(data, e.treatmentId)?.name ?? getSpecialty(data, e.specialtyId)?.name ?? "General",
        header: "Treatment / specialty",
      },
      {
        accessorKey: "status",
        meta: { label: "Status" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => <StatusBadge kind="enquiry" status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        meta: { label: "Received" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Received" />,
        cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
      },
      {
        id: "actions",
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const e = row.original
          const transitions = transitionsFor(e)
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${e.ref}`}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{e.ref}</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setDetailId(e.id)}>
                  <Eye /> View details
                </DropdownMenuItem>
                {transitions.length > 0 && <DropdownMenuSeparator />}
                {transitions.map((s) => (
                  <DropdownMenuItem key={s} onSelect={() => setConfirm({ enq: e, status: s })} variant={s === "closed" ? "destructive" : "default"}>
                    {s === "contacted" ? <PhoneCall /> : <ArrowRightCircle />}
                    {perspective === "patient" ? "Withdraw enquiry" : ACTION_LABEL[s]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, perspective],
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={enquiries}
        pageSize={pageSize}
        getRowId={(e) => e.id}
        getSearchText={(e) => `${e.ref} ${e.subject} ${e.patientName} ${getProviderName(data, e)}`}
        searchPlaceholder="Search by reference, subject or patient…"
        initialSorting={[{ id: "createdAt", desc: true }]}
        filters={[
          {
            columnId: "status",
            title: "Status",
            options: (Object.keys(ENQUIRY_STATUS_LABELS) as EnquiryStatus[]).map((s) => ({
              value: s,
              label: ENQUIRY_STATUS_LABELS[s],
              count: enquiries.filter((e) => e.status === s).length,
            })),
          },
        ]}
        onRowClick={(e) => setDetailId(e.id)}
        exportFilename={perspective === "patient" ? undefined : "enquiries"}
        exportColumns={[
          { header: "Reference", value: (e) => e.ref },
          { header: "Subject", value: (e) => e.subject },
          { header: "Patient", value: (e) => e.patientName },
          { header: "Provider", value: (e) => getProviderName(data, e) },
          { header: "Status", value: (e) => ENQUIRY_STATUS_LABELS[e.status] },
          { header: "Received", value: (e) => formatDate(e.createdAt) },
        ]}
        bulkActions={
          perspective === "patient"
            ? undefined
            : (rows, clear) => {
                const contactable = rows.filter((r) => ENQUIRY_TRANSITIONS[r.status].includes("contacted"))
                return (
                  <Button
                    size="sm"
                    disabled={contactable.length === 0}
                    onClick={() => {
                      contactable.forEach((r) => changeEnquiryStatus(r, "contacted"))
                      clear()
                    }}
                  >
                    <PhoneCall /> Mark {contactable.length} contacted
                  </Button>
                )
              }
        }
        emptyTitle="No enquiries"
        emptyDescription="Medical enquiries will appear here."
        caption="Enquiries"
      />

      <DetailsSheet
        open={!!detail}
        onOpenChange={(o) => !o && setDetailId(null)}
        title={detail ? `Enquiry ${detail.ref}` : ""}
        description="Simulated enquiry — no message was sent to a real provider."
        footer={
          detail &&
          transitionsFor(detail).map((s) => (
            <Button key={s} variant={s === "closed" ? "destructive" : "outline"} onClick={() => setConfirm({ enq: detail, status: s })}>
              {perspective === "patient" ? "Withdraw enquiry" : ACTION_LABEL[s]}
            </Button>
          ))
        }
      >
        {detail && (
          <div className="space-y-6">
            <DetailList
              items={[
                { label: "Status", value: <StatusBadge kind="enquiry" status={detail.status} /> },
                { label: "Subject", value: detail.subject },
                { label: "Patient", value: detail.patientName },
                { label: "Contact", value: detail.contact },
                { label: "Provider", value: getProviderName(data, detail) },
                { label: "Specialty", value: getSpecialty(data, detail.specialtyId)?.name ?? "—" },
                { label: "Treatment", value: getTreatment(data, detail.treatmentId)?.name ?? "—" },
                {
                  label: "Preferred",
                  value: detail.preferredDate ? `${formatDate(detail.preferredDate)}${detail.preferredTime ? ` · ${formatTime(detail.preferredTime)}` : ""}` : "—",
                },
                { label: "Mode", value: detail.mode ? CONSULTATION_MODE_LABELS[detail.mode] : "—" },
                { label: "Message", value: detail.message ?? "—" },
                { label: "Received", value: formatDateTime(detail.createdAt) },
              ]}
            />
            <section aria-labelledby="enq-timeline" className="space-y-3">
              <h3 id="enq-timeline" className="font-semibold">
                Activity timeline
              </h3>
              <ActivityTimeline events={detail.timeline} />
            </section>
            {perspective !== "patient" && (
              <section className="space-y-2">
                <Label htmlFor="enq-note">Add internal note</Label>
                <Textarea id="enq-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Visible only to your team (demo)" />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={note.trim().length < 2}
                  onClick={() => {
                    addEnquiryNote(detail, note.trim())
                    setNote("")
                  }}
                >
                  Add note
                </Button>
              </section>
            )}
          </div>
        )}
      </DetailsSheet>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm ? `${perspective === "patient" ? "Withdraw" : ACTION_LABEL[confirm.status]} — ${confirm.enq.ref}` : ""}
        description="The status will be updated locally and recorded in the activity timeline. No message is sent."
        confirmLabel={confirm ? (perspective === "patient" ? "Withdraw" : ENQUIRY_STATUS_LABELS[confirm.status]) : "Confirm"}
        destructive={confirm?.status === "closed"}
        withNote
        onConfirm={(n) => {
          if (confirm) changeEnquiryStatus(confirm.enq, confirm.status, n)
          setConfirm(null)
        }}
      />
    </>
  )
}
