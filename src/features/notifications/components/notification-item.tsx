import { ArrowRight, Mail, MailOpen, Trash2 } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { NOTIFICATION_TYPE_LABELS } from "@/lib/constants"
import { formatDateTime, formatRelative } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { AppNotification } from "@/types"
import { NotificationIcon } from "./notification-icon"

interface NotificationItemProps {
  notification: AppNotification
  onToggleRead: (n: AppNotification) => void
  onOpen: (n: AppNotification) => void
  onDelete: (n: AppNotification) => void
}

export function NotificationItem({ notification: n, onToggleRead, onOpen, onDelete }: NotificationItemProps) {
  return (
    <li
      className={cn(
        "relative flex gap-3 rounded-xl border p-4 transition-colors",
        n.read ? "bg-card" : "border-primary/25 bg-primary/5",
      )}
    >
      <NotificationIcon type={n.type} />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span className="font-medium">{NOTIFICATION_TYPE_LABELS[n.type]}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={n.createdAt} title={formatDateTime(n.createdAt)}>
            {formatRelative(n.createdAt)}
          </time>
          {!n.read && (
            <span className="inline-flex items-center gap-1 font-semibold text-primary">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" /> Unread
            </span>
          )}
        </div>
        <h3 className={cn("text-sm leading-snug", n.read ? "font-medium" : "font-semibold")}>{n.title}</h3>
        <p className="text-sm text-muted-foreground">{n.message}</p>
        {n.link && (
          <Link
            to={n.link}
            onClick={() => onOpen(n)}
            className="inline-flex items-center gap-1 pt-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View details <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
      <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-start">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onToggleRead(n)}
              aria-label={n.read ? `Mark "${n.title}" as unread` : `Mark "${n.title}" as read`}
            >
              {n.read ? <Mail /> : <MailOpen />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{n.read ? "Mark as unread" : "Mark as read"}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={() => onDelete(n)} aria-label={`Delete "${n.title}"`}>
              <Trash2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>
    </li>
  )
}
