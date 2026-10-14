import {
  BadgeCheck,
  CalendarClock,
  CalendarPlus,
  FileCheck2,
  MessageSquarePlus,
  ShieldAlert,
  Star,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { NotificationType } from "@/types"

const ICONS: Record<NotificationType, { icon: LucideIcon; tone: string }> = {
  new_enquiry: { icon: MessageSquarePlus, tone: "bg-info-soft text-info-text" },
  appointment_request: { icon: CalendarPlus, tone: "bg-info-soft text-info-text" },
  appointment_update: { icon: CalendarClock, tone: "bg-success-soft text-success-text" },
  verification_update: { icon: BadgeCheck, tone: "bg-success-soft text-success-text" },
  profile_approval: { icon: FileCheck2, tone: "bg-warning-soft text-warning-text" },
  review_submission: { icon: Star, tone: "bg-highlight/15 text-foreground" },
  moderation_alert: { icon: ShieldAlert, tone: "bg-destructive-soft text-destructive-text" },
}

/** Rounded icon tile for a notification type (decorative — the type label is shown as text). */
export function NotificationIcon({ type, className }: { type: NotificationType; className?: string }) {
  const { icon: Icon, tone } = ICONS[type]
  return (
    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", tone, className)}>
      <Icon className="size-4" aria-hidden="true" />
    </span>
  )
}
