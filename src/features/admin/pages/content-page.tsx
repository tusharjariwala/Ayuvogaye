import type { ColumnDef } from "@tanstack/react-table"
import { BookCheck, BookOpen, ExternalLink, FileClock, FilePen, Pencil, Plus, Send, Undo2, Upload } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Field } from "@/components/forms/form-field"
import { ConfirmDialog, EntityFormDialog } from "@/components/shared/overlays"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import type { Collections } from "@/data"
import { getSpecialty, getTreatment } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { formatDate, slugify } from "@/lib/formatters"
import { createId, nowISO } from "@/lib/mock-storage"
import { cn } from "@/lib/utils"
import type { ContentPage, EditorialStatus } from "@/types"
import { CellTitle, FieldError, RowActions, StatGrid } from "../components/admin-ui"
import { EDITORIAL_LABELS, actorName } from "../lib/admin-helpers"

const TYPE_LABELS: Record<ContentPage["type"], string> = { treatment: "Treatment", specialty: "Specialty", guide: "Guide" }
const SEO_TITLE_MAX = 60
const SEO_DESC_MAX = 160

interface Draft {
  title: string
  slug: string
  type: ContentPage["type"]
  relatedId: string
  seoTitle: string
  seoDescription: string
  keywords: string
}

type Transition = { to: EditorialStatus; label: string; audit: string }

const TRANSITIONS: Record<EditorialStatus, Transition[]> = {
  draft: [{ to: "in_review", label: "Submit for review", audit: "content.submitted_for_review" }],
  in_review: [
    { to: "published", label: "Publish", audit: "content.published" },
    { to: "draft", label: "Return to draft", audit: "content.returned_to_draft" },
  ],
  published: [{ to: "draft", label: "Unpublish", audit: "content.unpublished" }],
}

const TRANSITION_ICON: Record<string, typeof Send> = { "Submit for review": Send, Publish: Upload, "Return to draft": Undo2, Unpublish: Undo2 }

function relatedInfo(data: Collections, page: Pick<ContentPage, "type" | "relatedId">): { name: string; path?: string } {
  if (page.type === "treatment") {
    const t = getTreatment(data, page.relatedId)
    return t ? { name: t.name, path: `/treatment/${t.slug}` } : { name: "—" }
  }
  if (page.type === "specialty") {
    const s = getSpecialty(data, page.relatedId)
    return s ? { name: s.name, path: `/specialties/${s.slug}` } : { name: "—" }
  }
  return { name: "General guide" }
}

function toDraft(p?: ContentPage): Draft {
  return {
    title: p?.title ?? "",
    slug: p?.slug ?? "",
    type: p?.type ?? "treatment",
    relatedId: p?.relatedId ?? "",
    seoTitle: p?.seo.title ?? "",
    seoDescription: p?.seo.description ?? "",
    keywords: p?.seo.keywords.join(", ") ?? "",
  }
}

export default function ContentManagementPage() {
  const { data, currentUser, create, update, logAudit } = useDemoStore()
  const pages = data.contentPages
  const [editing, setEditing] = useState<{ open: boolean; page?: ContentPage }>({ open: false })
  const [draft, setDraft] = useState<Draft>(toDraft())
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({})
  const [pendingTransition, setPendingTransition] = useState<{ page: ContentPage; t: Transition } | null>(null)
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  const openForm = (page?: ContentPage) => {
    setDraft(toDraft(page))
    setErrors({})
    setEditing({ open: true, page })
  }

  const transition = (page: ContentPage, t: Transition) => {
    update("contentPages", page.id, { status: t.to, updatedAt: nowISO() })
    logAudit({ action: t.audit, entityType: "content", entityId: page.id, summary: `“${page.title}” → ${EDITORIAL_LABELS[t.to]}.` })
    toast.success(`“${page.title}” ${EDITORIAL_LABELS[t.to].toLowerCase()}`, { description: "Demo editorial workflow — stored locally." })
  }

  const columns = useMemo<ColumnDef<ContentPage, unknown>[]>(
    () => [
      {
        accessorKey: "title",
        meta: { label: "Title" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
        cell: ({ row }) => <CellTitle title={row.original.title} subtitle={<span className="font-mono">{row.original.slug}</span>} className="min-w-52" />,
      },
      {
        accessorKey: "type",
        meta: { label: "Type" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ row }) => TYPE_LABELS[row.original.type],
      },
      {
        id: "related",
        meta: { label: "Related" },
        accessorFn: (p) => relatedInfo(data, p).name,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Related" />,
      },
      {
        accessorKey: "status",
        meta: { label: "Status" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      { accessorKey: "author", meta: { label: "Author" }, header: "Author" },
      {
        accessorKey: "updatedAt",
        meta: { label: "Updated" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
        cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(row.original.updatedAt)}</span>,
      },
      {
        id: "preview",
        meta: { label: "Preview" },
        header: "Preview",
        enableSorting: false,
        cell: ({ row }) => {
          const path = relatedInfo(data, row.original).path
          return path ? (
            <Button variant="ghost" size="sm" asChild>
              <Link to={path} target="_blank" rel="noreferrer">
                <ExternalLink /> Preview<span className="sr-only"> {row.original.title} (opens in a new tab)</span>
              </Link>
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">No public page</span>
          )
        },
      },
      {
        id: "actions",
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const p = row.original
          return (
            <RowActions
              label={p.title}
              actions={[
                { label: "Edit", icon: Pencil, onSelect: () => openForm(p) },
                ...TRANSITIONS[p.status].map((t, i) => ({
                  label: t.label,
                  icon: TRANSITION_ICON[t.label] ?? Send,
                  separator: i === 0,
                  onSelect: () => (t.to === "in_review" ? transition(p, t) : setPendingTransition({ page: p, t })),
                })),
              ]}
            />
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  )

  const relatedOptions =
    draft.type === "treatment"
      ? data.treatments.map((t) => ({ id: t.id, name: t.name }))
      : draft.type === "specialty"
        ? data.specialties.map((s) => ({ id: s.id, name: s.name }))
        : []

  const handleSubmit = () => {
    const e: typeof errors = {}
    if (draft.title.trim().length < 3) e.title = "Enter a title of at least 3 characters."
    if (!draft.slug) e.slug = "Slug is required."
    else if (pages.some((p) => p.slug === draft.slug && p.id !== editing.page?.id)) e.slug = "This slug is already in use."
    if (draft.type !== "guide" && !draft.relatedId) e.relatedId = `Choose the related ${draft.type}.`
    if (!draft.seoTitle.trim()) e.seoTitle = "SEO title is required."
    else if (draft.seoTitle.length > SEO_TITLE_MAX) e.seoTitle = `Keep the SEO title within ${SEO_TITLE_MAX} characters.`
    if (!draft.seoDescription.trim()) e.seoDescription = "SEO description is required."
    else if (draft.seoDescription.length > SEO_DESC_MAX) e.seoDescription = `Keep the SEO description within ${SEO_DESC_MAX} characters.`
    setErrors(e)
    if (Object.keys(e).length) return false
    const seo = {
      title: draft.seoTitle.trim(),
      description: draft.seoDescription.trim(),
      keywords: draft.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    }
    const base = {
      title: draft.title.trim(),
      slug: draft.slug,
      type: draft.type,
      relatedId: draft.type === "guide" ? undefined : draft.relatedId,
      seo,
      updatedAt: nowISO(),
    }
    if (editing.page) {
      update("contentPages", editing.page.id, base)
      logAudit({ action: "content.updated", entityType: "content", entityId: editing.page.id, summary: `Content page “${base.title}” updated.` })
      toast.success("Content page saved", { description: "Stored in local demo data only." })
    } else {
      const page: ContentPage = { ...base, id: createId("cp"), status: "draft", author: actorName(currentUser) }
      create("contentPages", page)
      logAudit({ action: "content.created", entityType: "content", entityId: page.id, summary: `Draft content page “${page.title}” created.` })
      toast.success("Draft created", { description: "Submit it for review when ready. Demo data only." })
    }
  }

  const count = (s: EditorialStatus) => pages.filter((p) => p.status === s).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content"
        description="Editorial pages for treatments, specialties and guides. Workflow: Draft → In review → Published. Content is general information, never medical advice."
        actions={
          <Button onClick={() => openForm()}>
            <Plus /> New page
          </Button>
        }
      />
      <StatGrid>
        <StatCard label="Content pages" value={pages.length} icon={BookOpen} />
        <StatCard label="Published" value={count("published")} icon={BookCheck} />
        <StatCard label="In review" value={count("in_review")} icon={FileClock} />
        <StatCard label="Drafts" value={count("draft")} icon={FilePen} />
      </StatGrid>

      <DataTable
        columns={columns}
        data={pages}
        getRowId={(p) => p.id}
        getSearchText={(p) => `${p.title} ${p.slug} ${p.author} ${p.seo.keywords.join(" ")}`}
        searchPlaceholder="Search content pages…"
        filters={[
          { columnId: "status", title: "Status", options: (Object.keys(EDITORIAL_LABELS) as EditorialStatus[]).map((s) => ({ value: s, label: EDITORIAL_LABELS[s], count: count(s) })) },
          { columnId: "type", title: "Type", options: (Object.keys(TYPE_LABELS) as ContentPage["type"][]).map((t) => ({ value: t, label: TYPE_LABELS[t] })) },
        ]}
        initialSorting={[{ id: "updatedAt", desc: true }]}
        onRowClick={(p) => openForm(p)}
        exportFilename="content-pages"
        exportColumns={[
          { header: "ID", value: (p) => p.id },
          { header: "Title", value: (p) => p.title },
          { header: "Slug", value: (p) => p.slug },
          { header: "Type", value: (p) => TYPE_LABELS[p.type] },
          { header: "Status", value: (p) => EDITORIAL_LABELS[p.status] },
          { header: "SEO title", value: (p) => p.seo.title },
          { header: "SEO description", value: (p) => p.seo.description },
          { header: "Keywords", value: (p) => p.seo.keywords },
        ]}
        emptyTitle="No content pages"
        caption="Content pages"
      />

      <EntityFormDialog
        open={editing.open}
        onOpenChange={(o) => setEditing((e) => ({ ...e, open: o }))}
        title={editing.page ? "Edit content page" : "New content page"}
        description="Editorial content must stay general and point readers to their treating doctor. Saved locally."
        submitLabel={editing.page ? "Save changes" : "Create draft"}
        onSubmit={handleSubmit}
        className="sm:max-w-2xl"
      >
        <Field label="Title" htmlFor="cp-title">
          <Input
            id="cp-title"
            value={draft.title}
            aria-invalid={!!errors.title}
            onChange={(e) => set({ title: e.target.value, ...(editing.page ? {} : { slug: slugify(e.target.value) }) })}
          />
          {errors.title && <FieldError>{errors.title}</FieldError>}
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Slug" htmlFor="cp-slug" className="sm:col-span-1">
            <Input id="cp-slug" className="font-mono text-sm" value={draft.slug} aria-invalid={!!errors.slug} onChange={(e) => set({ slug: slugify(e.target.value) })} />
            {errors.slug && <FieldError>{errors.slug}</FieldError>}
          </Field>
          <Field label="Type" htmlFor="cp-type">
            <Select value={draft.type} onValueChange={(v) => set({ type: v as ContentPage["type"], relatedId: "" })}>
              <SelectTrigger id="cp-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TYPE_LABELS) as ContentPage["type"][]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Related" htmlFor="cp-related">
            <Select value={draft.relatedId} onValueChange={(v) => set({ relatedId: v })} disabled={draft.type === "guide"}>
              <SelectTrigger id="cp-related" className="w-full" aria-invalid={!!errors.relatedId}>
                <SelectValue placeholder={draft.type === "guide" ? "Not applicable" : "Select…"} />
              </SelectTrigger>
              <SelectContent>
                {relatedOptions.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.relatedId && <FieldError>{errors.relatedId}</FieldError>}
          </Field>
        </div>
        <fieldset className="space-y-4 rounded-lg border p-4">
          <legend className="px-1 text-sm font-medium">Search engine metadata</legend>
          <div className="space-y-2">
            <CounterLabel htmlFor="cp-seo-title" label="SEO title" length={draft.seoTitle.length} max={SEO_TITLE_MAX} />
            <Input
              id="cp-seo-title"
              value={draft.seoTitle}
              aria-invalid={!!errors.seoTitle}
              aria-describedby="cp-seo-title-count"
              onChange={(e) => set({ seoTitle: e.target.value })}
            />
            {errors.seoTitle && <FieldError>{errors.seoTitle}</FieldError>}
          </div>
          <div className="space-y-2">
            <CounterLabel htmlFor="cp-seo-desc" label="SEO description" length={draft.seoDescription.length} max={SEO_DESC_MAX} />
            <Textarea
              id="cp-seo-desc"
              rows={3}
              value={draft.seoDescription}
              aria-invalid={!!errors.seoDescription}
              aria-describedby="cp-seo-desc-count"
              onChange={(e) => set({ seoDescription: e.target.value })}
            />
            {errors.seoDescription && <FieldError>{errors.seoDescription}</FieldError>}
          </div>
          <Field label="Keywords" htmlFor="cp-keywords" description="Comma-separated, e.g. angioplasty, heart">
            <Input id="cp-keywords" value={draft.keywords} onChange={(e) => set({ keywords: e.target.value })} />
          </Field>
          <div className="rounded-md bg-muted/50 p-3 text-sm" aria-label="Search result preview">
            <p className="truncate font-medium text-primary">{draft.seoTitle || "SEO title"}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {relatedInfo(data, { type: draft.type, relatedId: draft.relatedId }).path ?? "No public page"}
            </p>
            <p className="line-clamp-2 text-muted-foreground">{draft.seoDescription || "SEO description"}</p>
          </div>
        </fieldset>
      </EntityFormDialog>

      <ConfirmDialog
        open={!!pendingTransition}
        onOpenChange={(o) => !o && setPendingTransition(null)}
        title={pendingTransition ? `${pendingTransition.t.label} “${pendingTransition.page.title}”?` : ""}
        description={
          pendingTransition?.t.to === "published"
            ? "The page becomes publicly visible. Confirm it contains general information only and no medical advice."
            : "The page is moved back to Draft and no longer shown publicly."
        }
        confirmLabel={pendingTransition?.t.label ?? "Confirm"}
        destructive={pendingTransition?.t.label === "Unpublish"}
        onConfirm={() => {
          if (pendingTransition) transition(pendingTransition.page, pendingTransition.t)
          setPendingTransition(null)
        }}
      />
    </div>
  )
}

function CounterLabel({ htmlFor, label, length, max }: { htmlFor: string; label: string; length: number; max: number }) {
  const over = length > max
  return (
    <div className="flex items-baseline justify-between gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      <span id={`${htmlFor}-count`} className={cn("text-xs tabular-nums", over ? "font-medium text-destructive-text" : "text-muted-foreground")}>
        {length}/{max}
        {over && <span className="sr-only"> — too long</span>}
      </span>
    </div>
  )
}
