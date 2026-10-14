import { Bell, CalendarClock, CheckCheck, MessageSquare, ShieldCheck, Star, TriangleAlert, UserCheck, type LucideIcon } from "lucide-react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { getNotificationsForUser } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { formatRelative } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { NotificationType } from "@/types"

export const NOTIFICATION_ICONS: Record<NotificationType, LucideIcon> = {
  new_enquiry: MessageSquare,
  appointment_request: CalendarClock,
  appointment_update: CalendarClock,
  verification_update: ShieldCheck,
  profile_approval: UserCheck,
  review_submission: Star,
  moderation_alert: TriangleAlert,
}

export function NotificationMenu() {
  const { data, currentUser, update } = useDemoStore()
  const items = getNotificationsForUser(data, currentUser)
  const unread = items.filter((n) => !n.read)

  if (!currentUser) return null

  const markAll = () => unread.forEach((n) => update("notifications", n.id, { read: true }))

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications, ${unread.length} unread`}>
          <Bell />
          {unread.length > 0 && (
            <span className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-4 font-semibold text-destructive-foreground">
              {unread.length > 9 ? "9+" : unread.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="font-semibold">Notifications</p>
          <Button variant="ghost" size="sm" onClick={markAll} disabled={unread.length === 0}>
            <CheckCheck /> Mark all read
          </Button>
        </div>
        <Separator />
        <ul className="max-h-80 overflow-y-auto" aria-label="Recent notifications">
          {items.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">You're all caught up.</li>}
          {items.slice(0, 6).map((n) => {
            const Icon = NOTIFICATION_ICONS[n.type]
            return (
              <li key={n.id}>
                <Link
                  to={n.link ?? "/account/notifications"}
                  onClick={() => update("notifications", n.id, { read: true })}
                  className={cn("flex gap-3 px-4 py-3 hover:bg-accent focus-visible:bg-accent focus-visible:outline-none", !n.read && "bg-primary/5")}
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{n.title}</span>
                      {!n.read && (
                        <Badge variant="info" className="h-4 px-1.5 text-[10px]">
                          New
                        </Badge>
                      )}
                    </span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">{n.message}</span>
                    <span className="text-[11px] text-muted-foreground">{formatRelative(n.createdAt)}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        <Separator />
        <div className="p-2">
          <Button asChild variant="ghost" className="w-full">
            <Link to="/account/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
