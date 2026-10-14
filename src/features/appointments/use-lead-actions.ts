import { useCallback } from "react"
import { toast } from "sonner"
import { getProviderName } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { APPOINTMENT_STATUS_LABELS, ENQUIRY_STATUS_LABELS, ROLE_LABELS } from "@/lib/constants"
import { formatDate } from "@/lib/formatters"
import { createId, nowISO } from "@/lib/mock-storage"
import type { Appointment, AppointmentStatus, Enquiry, EnquiryStatus } from "@/types"

/** Which status transitions each role may perform (UI-level rule for the demo). */
export const APPOINTMENT_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  requested: ["confirmed", "rescheduled", "cancelled"],
  confirmed: ["rescheduled", "completed", "cancelled"],
  rescheduled: ["confirmed", "cancelled"],
  completed: [],
  cancelled: [],
}

export const ENQUIRY_TRANSITIONS: Record<EnquiryStatus, EnquiryStatus[]> = {
  new: ["contacted", "under_review", "closed"],
  contacted: ["under_review", "quote_sent", "closed"],
  under_review: ["quote_sent", "contacted", "closed"],
  quote_sent: ["converted", "closed"],
  converted: ["closed"],
  closed: [],
}

/**
 * Centralised, local-only appointment & enquiry mutations. Every change adds a
 * timeline event, an audit-log entry and an in-app (never external) notification.
 */
export function useLeadActions() {
  const { data, update, logAudit, notify, currentUser } = useDemoStore()
  const actor = currentUser ? `${currentUser.name} (${ROLE_LABELS[currentUser.role]})` : "Demo user"

  const changeAppointmentStatus = useCallback(
    (appt: Appointment, status: AppointmentStatus, opts: { note?: string; newDate?: string; newTime?: string } = {}) => {
      const at = nowISO()
      const label =
        status === "rescheduled" && opts.newDate
          ? `Rescheduled to ${formatDate(opts.newDate)}${opts.newTime ? ` at ${opts.newTime}` : ""}`
          : `Status changed to ${APPOINTMENT_STATUS_LABELS[status]}`
      update("appointments", appt.id, (prev) => ({
        ...prev,
        status,
        preferredDate: opts.newDate ?? prev.preferredDate,
        preferredTime: opts.newTime ?? prev.preferredTime,
        updatedAt: at,
        timeline: [...prev.timeline, { id: createId("ev"), at, label, actor, note: opts.note }],
      }))
      logAudit({
        action: "appointment.status_changed",
        entityType: "appointment",
        entityId: appt.id,
        summary: `${appt.ref} → ${APPOINTMENT_STATUS_LABELS[status]}`,
      })
      if (appt.patientId) {
        notify({
          type: "appointment_update",
          title: `Appointment ${APPOINTMENT_STATUS_LABELS[status].toLowerCase()}`,
          message: `${appt.ref} with ${getProviderName(data, appt)} is now ${APPOINTMENT_STATUS_LABELS[status]} (simulated).`,
          audience: "patient",
          userId: appt.patientId,
          link: "/account/appointments",
        })
      }
      toast.success(`${appt.ref} marked ${APPOINTMENT_STATUS_LABELS[status]}`, {
        description: "Demo action — no real patient or provider is contacted.",
      })
    },
    [actor, data, logAudit, notify, update],
  )

  const changeEnquiryStatus = useCallback(
    (enq: Enquiry, status: EnquiryStatus, note?: string) => {
      const at = nowISO()
      update("enquiries", enq.id, (prev) => ({
        ...prev,
        status,
        updatedAt: at,
        timeline: [
          ...prev.timeline,
          { id: createId("ev"), at, label: `Status changed to ${ENQUIRY_STATUS_LABELS[status]}`, actor, note },
        ],
      }))
      logAudit({
        action: "enquiry.status_changed",
        entityType: "enquiry",
        entityId: enq.id,
        summary: `${enq.ref} → ${ENQUIRY_STATUS_LABELS[status]}`,
      })
      if (enq.patientId) {
        notify({
          type: "appointment_update",
          title: `Enquiry ${ENQUIRY_STATUS_LABELS[status].toLowerCase()}`,
          message: `${enq.ref} (“${enq.subject}”) is now ${ENQUIRY_STATUS_LABELS[status]} (simulated).`,
          audience: "patient",
          userId: enq.patientId,
          link: "/account/appointments?tab=enquiries",
        })
      }
      toast.success(`${enq.ref} marked ${ENQUIRY_STATUS_LABELS[status]}`, {
        description: "Demo action — no message is sent.",
      })
    },
    [actor, logAudit, notify, update],
  )

  const addAppointmentNote = useCallback(
    (appt: Appointment, note: string) => {
      const at = nowISO()
      update("appointments", appt.id, (prev) => ({
        ...prev,
        updatedAt: at,
        timeline: [...prev.timeline, { id: createId("ev"), at, label: "Internal note added", actor, note }],
      }))
      toast.success("Note added")
    },
    [actor, update],
  )

  const addEnquiryNote = useCallback(
    (enq: Enquiry, note: string) => {
      const at = nowISO()
      update("enquiries", enq.id, (prev) => ({
        ...prev,
        updatedAt: at,
        timeline: [...prev.timeline, { id: createId("ev"), at, label: "Internal note added", actor, note }],
      }))
      toast.success("Note added")
    },
    [actor, update],
  )

  return { changeAppointmentStatus, changeEnquiryStatus, addAppointmentNote, addEnquiryNote }
}
