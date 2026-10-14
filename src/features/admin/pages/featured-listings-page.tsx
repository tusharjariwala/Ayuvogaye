import type { ColumnDef } from "@tanstack/react-table"
import { CalendarClock, Megaphone, Pause, Play, Plus, ShieldCheck, Square, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Field } from "@/components/forms/form-field"
import { ConfirmDialog, DeleteConfirmationDialog, EntityFormDialog } from "@/components/shared/overlays"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { useDemoStore } from "@/hooks/use-demo-store"
import { formatDate } from "@/lib/formatters"
import { createId } from "@/lib/mock-storage"
import type { FeaturedListing, ProviderType } from "@/types"
import { CellTitle, FieldError, RowActions, StatGrid } from "../components/admin-ui"
import { useProviderNotify } from "../hooks/use-provider-notify"
import { PROVIDER_LABEL, fromDateInput, getProviderLabel, toDateInput } from "../lib/admin-helpers"

const PLACEMENT_LABELS: Record<FeaturedListing["placement"], string> = {
  homepage: "Homepage",
  search: "Search results",
  city_page: "City page",
}
const STATUS_LABELS: Record<FeaturedListing["status"], string> = {
  active: "Active",
  scheduled: "Scheduled",
  paused: "Paused",
  expired: "Ended",
}
const POLICY = "Sponsored placements are always labelled and never affect verification status or ranking claims."

interface Draft {
  entityType: ProviderType
  entityId: string
  placement: FeaturedListing["placement"]
  start: string
  end: string
}

type Op = "pause" | "resume" | "end"

export default function FeaturedListingsPage() {
  const { data, create, update, remove, logAudit } = useDemoStore()
  const notifyProvider = useProviderNotify()
  const listings = data.featuredListings
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>({ entityType: "hospital", entityId: "", placement: "homepage", start: "", end: "" })
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({})
  const [pendingOp, setPendingOp] = useState<{ listing: FeaturedListing; op: Op } | null>(null)
  const [deleting, setDeleting] = useState<FeaturedListing | null>(null)
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  /** Keep `hospital.sponsored` aligned with whether it has any active listing. */
  const syncSponsored = (listing: Pick<FeaturedListing, "entityType" | "entityId">, next: FeaturedListing[]) => {
    if (listing.entityType !== "hospital") return
    const active = next.some((l) => l.entityType === "hospital" && l.entityId === listing.entityId && l.status === "active")
    const hospital = data.hospitals.find((h) => h.id === listing.entityId)
    if (hospital && hospital.sponsored !== active) update("hospitals", hospital.id, { sponsored: active })
  }

  const runOp = (listing: FeaturedListing, op: Op) => {
    const name = getProviderLabel(data, listing.entityType, listing.entityId)
    const now = new Date()
    const patch: Partial<FeaturedListing> =
      op === "pause"
        ? { status: "paused" }
        : op === "resume"
          ? { status: new Date(listing.startDate) > now ? "scheduled" : "active" }
          : { status: "expired", endDate: now.toISOString() }
    update("featuredListings", listing.id, patch)
    syncSponsored(listing, listings.map((l) => (l.id === listing.id ? { ...l, ...patch } : l)))
    const verb = op === "pause" ? "paused" : op === "resume" ? "resumed" : "ended"
    logAudit({ action: `listing.${verb}`, entityType: "listing", entityId: listing.id, summary: `${PLACEMENT_LABELS[listing.placement]} listing for ${name} ${verb}.` })
    notifyProvider(listing.entityType, listing.entityId, {
      type: "profile_approval",
      title: `Sponsored listing ${verb}`,
      message: `Your ${PLACEMENT_LABELS[listing.placement].toLowerCase()} placement was ${verb}.`,
    })
    toast.success(`Listing ${verb}`, { description: `${name} · demo only, no billing involved.` })
  }

  const providerOptions =
    draft.entityType === "hospital"
      ? data.hospitals.filter((h) => h.status !== "suspended").map((h) => ({ id: h.id, name: `${h.name} · ${h.city}` }))
      : data.doctors.filter((d) => d.status !== "suspended").map((d) => ({ id: d.id, name: `${d.name} · ${d.city}` }))

  const columns = useMemo<ColumnDef<FeaturedListing, unknown>[]>(
    () => [
      {
        id: "provider",
        meta: { label: "Provider" },
        accessorFn: (l) => getProviderLabel(data, l.entityType, l.entityId),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Provider" />,
        cell: ({ row, getValue }) => <CellTitle title={String(getValue())} subtitle={PROVIDER_LABEL[row.original.entityType]} />,
      },
      {
        accessorKey: "entityType",
        meta: { label: "Type" },
        header: "Type",
        cell: ({ row }) => <Badge variant="outline">{PROVIDER_LABEL[row.original.entityType]}</Badge>,
      },
      {
        accessorKey: "placement",
        meta: { label: "Placement" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Placement" />,
        cell: ({ row }) => PLACEMENT_LABELS[row.original.placement],
      },
      {
        accessorKey: "startDate",
        meta: { label: "Start" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Start" />,
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.startDate)}</span>,
      },
      {
        accessorKey: "endDate",
        meta: { label: "End" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="End" />,
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.endDate)}</span>,
      },
      {
        accessorKey: "status",
        meta: { label: "Status" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => <StatusBadge status={row.original.status === "expired" ? "ended" : row.original.status} />,
      },
      {
        id: "actions",
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const l = row.original
          return (
            <RowActions
              label={`${getProviderLabel(data, l.entityType, l.entityId)} listing`}
              actions={[
                { label: "Pause", icon: Pause, hidden: l.status !== "active" && l.status !== "scheduled", onSelect: () => setPendingOp({ listing: l, op: "pause" }) },
                { label: "Resume", icon: Play, hidden: l.status !== "paused", onSelect: () => runOp(l, "resume") },
                { label: "End now", icon: Square, hidden: l.status === "expired", onSelect: () => setPendingOp({ listing: l, op: "end" }) },
                { label: "Delete", icon: Trash2, destructive: true, separator: true, onSelect: () => setDeleting(l) },
              ]}
            />
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  )

  const handleCreate = () => {
    const e: typeof errors = {}
    if (!draft.entityId) e.entityId = "Choose a provider."
    if (!draft.start) e.start = "Choose a start date."
    if (!draft.end) e.end = "Choose an end date."
    else if (draft.start && draft.end < draft.start) e.end = "End date must be on or after the start date."
    setErrors(e)
    if (Object.keys(e).length) return false
    const startDate = fromDateInput(draft.start)
    const listing: FeaturedListing = {
      id: createId("fl"),
      entityType: draft.entityType,
      entityId: draft.entityId,
      placement: draft.placement,
      startDate,
      endDate: fromDateInput(draft.end, true),
      status: new Date(startDate) > new Date() ? "scheduled" : "active",
    }
    create("featuredListings", listing)
    syncSponsored(listing, [...listings, listing])
    const name = getProviderLabel(data, listing.entityType, listing.entityId)
    logAudit({
      action: "listing.created",
      entityType: "listing",
      entityId: listing.id,
      summary: `${STATUS_LABELS[listing.status]} ${PLACEMENT_LABELS[listing.placement].toLowerCase()} listing created for ${name}.`,
    })
    notifyProvider(listing.entityType, listing.entityId, {
      type: "profile_approval",
      title: "Sponsored listing created",
      message: `A ${PLACEMENT_LABELS[listing.placement].toLowerCase()} placement runs ${formatDate(listing.startDate)} – ${formatDate(listing.endDate)}. It is labelled “Sponsored” and does not affect verification.`,
    })
    toast.success("Sponsored listing created", { description: `${name} · demo only, no billing involved.` })
  }

  const count = (s: FeaturedListing["status"]) => listings.filter((l) => l.status === s).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Featured listings"
        description="Manage sponsored placements for hospitals and doctors."
        actions={
          <Button
            onClick={() => {
              const today = toDateInput(new Date().toISOString())
              setDraft({ entityType: "hospital", entityId: "", placement: "homepage", start: today, end: "" })
              setErrors({})
              setOpen(true)
            }}
          >
            <Plus /> New listing
          </Button>
        }
      />

      <Alert className="border-border bg-info-soft text-info-text">
        <ShieldCheck aria-hidden="true" />
        <AlertTitle>Sponsorship policy</AlertTitle>
        <AlertDescription className="text-info-text/90">{POLICY}</AlertDescription>
      </Alert>

      <StatGrid>
        <StatCard label="Active" value={count("active")} icon={Megaphone} />
        <StatCard label="Scheduled" value={count("scheduled")} icon={CalendarClock} />
        <StatCard label="Paused" value={count("paused")} icon={Pause} />
        <StatCard label="Ended" value={count("expired")} icon={Square} />
      </StatGrid>

      <DataTable
        columns={columns}
        data={listings}
        getRowId={(l) => l.id}
        getSearchText={(l) => `${getProviderLabel(data, l.entityType, l.entityId)} ${PLACEMENT_LABELS[l.placement]}`}
        searchPlaceholder="Search by provider or placement…"
        filters={[
          { columnId: "status", title: "Status", options: (Object.keys(STATUS_LABELS) as FeaturedListing["status"][]).map((s) => ({ value: s, label: STATUS_LABELS[s], count: count(s) })) },
          { columnId: "placement", title: "Placement", options: (Object.keys(PLACEMENT_LABELS) as FeaturedListing["placement"][]).map((p) => ({ value: p, label: PLACEMENT_LABELS[p] })) },
          { columnId: "entityType", title: "Type", options: [{ value: "hospital", label: "Hospital" }, { value: "doctor", label: "Doctor" }] },
        ]}
        initialSorting={[{ id: "startDate", desc: true }]}
        exportFilename="featured-listings"
        exportColumns={[
          { header: "ID", value: (l) => l.id },
          { header: "Provider", value: (l) => getProviderLabel(data, l.entityType, l.entityId) },
          { header: "Type", value: (l) => PROVIDER_LABEL[l.entityType] },
          { header: "Placement", value: (l) => PLACEMENT_LABELS[l.placement] },
          { header: "Start", value: (l) => formatDate(l.startDate) },
          { header: "End", value: (l) => formatDate(l.endDate) },
          { header: "Status", value: (l) => STATUS_LABELS[l.status] },
        ]}
        emptyTitle="No featured listings"
        caption="Featured listings"
      />

      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="New sponsored listing"
        description={POLICY}
        submitLabel="Create listing"
        onSubmit={handleCreate}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Provider type" htmlFor="fl-type">
            <Select value={draft.entityType} onValueChange={(v) => set({ entityType: v as ProviderType, entityId: "" })}>
              <SelectTrigger id="fl-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hospital">Hospital</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Placement" htmlFor="fl-placement">
            <Select value={draft.placement} onValueChange={(v) => set({ placement: v as FeaturedListing["placement"] })}>
              <SelectTrigger id="fl-placement" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PLACEMENT_LABELS) as FeaturedListing["placement"][]).map((p) => (
                  <SelectItem key={p} value={p}>
                    {PLACEMENT_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label={PROVIDER_LABEL[draft.entityType]} htmlFor="fl-provider">
          <Select value={draft.entityId} onValueChange={(v) => set({ entityId: v })}>
            <SelectTrigger id="fl-provider" className="w-full" aria-invalid={!!errors.entityId}>
              <SelectValue placeholder={`Select ${draft.entityType}`} />
            </SelectTrigger>
            <SelectContent>
              {providerOptions.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.entityId && <FieldError>{errors.entityId}</FieldError>}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date" htmlFor="fl-start">
            <Input id="fl-start" type="date" value={draft.start} aria-invalid={!!errors.start} onChange={(e) => set({ start: e.target.value })} />
            {errors.start && <FieldError>{errors.start}</FieldError>}
          </Field>
          <Field label="End date" htmlFor="fl-end">
            <Input id="fl-end" type="date" value={draft.end} min={draft.start || undefined} aria-invalid={!!errors.end} onChange={(e) => set({ end: e.target.value })} />
            {errors.end && <FieldError>{errors.end}</FieldError>}
          </Field>
        </div>
      </EntityFormDialog>

      <ConfirmDialog
        open={!!pendingOp}
        onOpenChange={(o) => !o && setPendingOp(null)}
        title={
          pendingOp
            ? `${pendingOp.op === "pause" ? "Pause" : "End"} listing for ${getProviderLabel(data, pendingOp.listing.entityType, pendingOp.listing.entityId)}?`
            : ""
        }
        description={
          pendingOp?.op === "pause"
            ? "The placement stops showing until resumed. Verification status is unaffected."
            : "The placement ends today and cannot be resumed. Verification status is unaffected."
        }
        confirmLabel={pendingOp?.op === "pause" ? "Pause" : "End listing"}
        destructive={pendingOp?.op === "end"}
        onConfirm={() => {
          if (pendingOp) runOp(pendingOp.listing, pendingOp.op)
          setPendingOp(null)
        }}
      />

      <DeleteConfirmationDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        trigger={null}
        itemName={deleting ? `${getProviderLabel(data, deleting.entityType, deleting.entityId)} listing` : "listing"}
        onConfirm={() => {
          if (deleting) {
            remove("featuredListings", deleting.id)
            syncSponsored(deleting, listings.filter((l) => l.id !== deleting.id))
            logAudit({
              action: "listing.deleted",
              entityType: "listing",
              entityId: deleting.id,
              summary: `${PLACEMENT_LABELS[deleting.placement]} listing for ${getProviderLabel(data, deleting.entityType, deleting.entityId)} deleted.`,
            })
            toast.success("Listing deleted", { description: "Removed from local demo data." })
          }
          setDeleting(null)
        }}
      />
    </div>
  )
}
