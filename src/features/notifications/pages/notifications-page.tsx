import { BellOff, CheckCheck, Info } from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { FacetFilter } from "@/components/shared/filters"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/states"
import { getNotificationsForUser } from "@/data/selectors"
import { AccountShell } from "@/features/account/components/account-shell"
import { useDemoStore } from "@/hooks/use-demo-store"
import { NOTIFICATION_TYPE_LABELS, NOTIFICATION_TYPES } from "@/lib/constants"
import { pluralize } from "@/lib/formatters"
import type { AppNotification } from "@/types"
import { NotificationItem } from "../components/notification-item"

const TITLE = "Notifications"
const DESCRIPTION = "Updates about your requests, reviews and profile activity."

export default function NotificationsPage() {
  const { data, currentUser, update, remove, create } = useDemoStore()
  const [view, setView] = useState<"all" | "unread">("all")
  const [types, setTypes] = useState<string[]>([])

  const all = useMemo(() => getNotificationsForUser(data, currentUser), [data, currentUser])
  const unreadCount = all.filter((n) => !n.read).length
  const visible = all.filter((n) => (view === "all" || !n.read) && (!types.length || types.includes(n.type)))

  const typeOptions = NOTIFICATION_TYPES.map((t) => ({
    value: t,
    label: NOTIFICATION_TYPE_LABELS[t],
    count: all.filter((n) => n.type === t).length,
  })).filter((o) => o.count > 0)

  const toggleRead = (n: AppNotification) => {
    update("notifications", n.id, { read: !n.read })
    toast(n.read ? "Marked as unread" : "Marked as read")
  }
  const markAllRead = () => {
    all.filter((n) => !n.read).forEach((n) => update("notifications", n.id, { read: true }))
    toast.success(`Marked ${pluralize(unreadCount, "notification")} as read`)
  }
  const deleteOne = (n: AppNotification) => {
    remove("notifications", n.id)
    toast("Notification deleted", { action: { label: "Undo", onClick: () => create("notifications", n) } })
  }
  const open = (n: AppNotification) => {
    if (!n.read) update("notifications", n.id, { read: true })
  }

  const actions = (
    <Button variant="outline" onClick={markAllRead} disabled={!unreadCount}>
      <CheckCheck /> Mark all read
    </Button>
  )

  const content = (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            type="single"
            variant="outline"
            spacing={0}
            value={view}
            onValueChange={(v) => v && setView(v as "all" | "unread")}
            aria-label="Show notifications"
          >
            <ToggleGroupItem value="all" className="px-3">
              All ({all.length})
            </ToggleGroupItem>
            <ToggleGroupItem value="unread" className="px-3">
              Unread ({unreadCount})
            </ToggleGroupItem>
          </ToggleGroup>
          <FacetFilter title="Type" options={typeOptions} selected={types} onChange={setTypes} />
          {types.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setTypes([])}>
              Clear
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Showing {pluralize(visible.length, "notification")}
        </p>
      </div>

      <p className="flex items-start gap-2 rounded-lg border border-info/25 bg-info-soft p-3 text-sm text-info-text">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Notifications are generated locally; nothing is delivered by email/SMS/push.
      </p>

      {visible.length ? (
        <ul className="space-y-3">
          {visible.map((n) => (
            <NotificationItem key={n.id} notification={n} onToggleRead={toggleRead} onOpen={open} onDelete={deleteOne} />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={BellOff}
          title={all.length ? "No matching notifications" : "You're all caught up"}
          description={
            all.length
              ? "Try another filter to see more notifications."
              : "New activity on your requests and profile will appear here."
          }
          action={
            all.length ? (
              <Button
                variant="outline"
                onClick={() => {
                  setView("all")
                  setTypes([])
                }}
              >
                Show all
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  )

  return currentUser?.role === "patient" ? (
    <AccountShell title={TITLE} description={DESCRIPTION} actions={actions}>
      {content}
    </AccountShell>
  ) : (
    <PlainLayout actions={actions}>{content}</PlainLayout>
  )
}

function PlainLayout({ actions, children }: { actions: ReactNode; children: ReactNode }) {
  return (
    <div className="container-page space-y-6 py-8">
      <PageHeader title={TITLE} description={DESCRIPTION} actions={actions} />
      {children}
    </div>
  )
}
