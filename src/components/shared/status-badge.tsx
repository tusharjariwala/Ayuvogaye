import {
  Ban,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  CircleDot,
  Clock,
  EyeOff,
  FileCheck2,
  MessageSquare,
  PhoneCall,
  Search,
  Send,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  APPOINTMENT_STATUS_LABELS,
  ENQUIRY_STATUS_LABELS,
  REVIEW_STATUS_LABELS,
} from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { AppointmentStatus, EnquiryStatus, ReviewStatus } from "@/types"

type Tone = "success" | "warning" | "info" | "danger" | "muted" | "highlight" | "secondary"

interface StatusConfig {
  label: string
  tone: Tone
  icon: LucideIcon
}

const APPOINTMENT: Record<AppointmentStatus, StatusConfig> = {
  requested: { label: APPOINTMENT_STATUS_LABELS.requested, tone: "info", icon: CircleDot },
  confirmed: { label: APPOINTMENT_STATUS_LABELS.confirmed, tone: "success", icon: CalendarCheck },
  rescheduled: { label: APPOINTMENT_STATUS_LABELS.rescheduled, tone: "warning", icon: CalendarClock },
  completed: { label: APPOINTMENT_STATUS_LABELS.completed, tone: "muted", icon: CheckCircle2 },
  cancelled: { label: APPOINTMENT_STATUS_LABELS.cancelled, tone: "danger", icon: XCircle },
}

const ENQUIRY: Record<EnquiryStatus, StatusConfig> = {
  new: { label: ENQUIRY_STATUS_LABELS.new, tone: "info", icon: MessageSquare },
  contacted: { label: ENQUIRY_STATUS_LABELS.contacted, tone: "secondary", icon: PhoneCall },
  under_review: { label: ENQUIRY_STATUS_LABELS.under_review, tone: "warning", icon: Search },
  quote_sent: { label: ENQUIRY_STATUS_LABELS.quote_sent, tone: "highlight", icon: Send },
  converted: { label: ENQUIRY_STATUS_LABELS.converted, tone: "success", icon: FileCheck2 },
  closed: { label: ENQUIRY_STATUS_LABELS.closed, tone: "muted", icon: Ban },
}

const REVIEW: Record<ReviewStatus, StatusConfig> = {
  pending: { label: REVIEW_STATUS_LABELS.pending, tone: "warning", icon: Clock },
  published: { label: REVIEW_STATUS_LABELS.published, tone: "success", icon: CheckCircle2 },
  hidden: { label: REVIEW_STATUS_LABELS.hidden, tone: "muted", icon: EyeOff },
  rejected: { label: REVIEW_STATUS_LABELS.rejected, tone: "danger", icon: XCircle },
}

/** Generic statuses used by admin tables (accounts, listings, reports, content…). */
const GENERIC: Record<string, StatusConfig> = {
  active: { label: "Active", tone: "success", icon: CheckCircle2 },
  suspended: { label: "Suspended", tone: "danger", icon: Ban },
  invited: { label: "Invited", tone: "info", icon: Send },
  pending: { label: "Pending", tone: "warning", icon: Clock },
  approved: { label: "Approved", tone: "success", icon: CheckCircle2 },
  rejected: { label: "Rejected", tone: "danger", icon: XCircle },
  scheduled: { label: "Scheduled", tone: "info", icon: CalendarClock },
  paused: { label: "Paused", tone: "muted", icon: CircleDashed },
  expired: { label: "Expired", tone: "muted", icon: Clock },
  open: { label: "Open", tone: "warning", icon: CircleDot },
  resolved: { label: "Resolved", tone: "success", icon: CheckCircle2 },
  dismissed: { label: "Dismissed", tone: "muted", icon: Ban },
  draft: { label: "Draft", tone: "muted", icon: CircleDashed },
  in_review: { label: "In Review", tone: "warning", icon: Search },
  published: { label: "Published", tone: "success", icon: CheckCircle2 },
  ended: { label: "Ended", tone: "muted", icon: Ban },
}

const TONE_VARIANT: Record<Tone, "success" | "warning" | "info" | "danger" | "muted" | "highlight" | "secondary"> = {
  success: "success",
  warning: "warning",
  info: "info",
  danger: "danger",
  muted: "muted",
  highlight: "highlight",
  secondary: "secondary",
}

export type StatusKind = "appointment" | "enquiry" | "review" | "generic"

export interface StatusBadgeProps {
  kind?: StatusKind
  status: string
  className?: string
}

/** Status pill that always pairs color with an icon and a text label. */
export function StatusBadge({ kind = "generic", status, className }: StatusBadgeProps) {
  const map: Record<string, StatusConfig> =
    kind === "appointment" ? APPOINTMENT : kind === "enquiry" ? ENQUIRY : kind === "review" ? REVIEW : GENERIC
  const config = map[status] ?? { label: status.replace(/_/g, " "), tone: "muted" as Tone, icon: CircleDot }
  const Icon = config.icon
  return (
    <Badge variant={TONE_VARIANT[config.tone]} className={cn("gap-1 capitalize", className)}>
      <Icon aria-hidden="true" />
      {config.label}
    </Badge>
  )
}
