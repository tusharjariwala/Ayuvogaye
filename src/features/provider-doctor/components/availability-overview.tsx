import { WEEKDAYS, WEEKDAY_LABELS } from "@/lib/constants"
import { formatTime } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { TimeSlot } from "@/types"
import { WEEKDAY_SHORT } from "@/features/provider-hospital/lib/provider-workflow"

/** Compact 7-day grid showing how many consultation slots exist per weekday. */
export function AvailabilityOverview({ slots }: { slots: TimeSlot[] }) {
  return (
    <ul className="grid grid-cols-7 gap-1 sm:gap-2" aria-label="Weekly availability">
      {WEEKDAYS.map((day) => {
        const daySlots = slots.filter((s) => s.day === day).sort((a, b) => a.start.localeCompare(b.start))
        const has = daySlots.length > 0
        return (
          <li
            key={day}
            className={cn("flex min-w-0 flex-col items-center gap-1 rounded-lg border p-1.5 text-center sm:p-2", has ? "border-primary/30 bg-primary/5" : "bg-muted/40")}
          >
            <span className="sr-only">{`${WEEKDAY_LABELS[day]}: ${has ? daySlots.map((s) => `${formatTime(s.start)} to ${formatTime(s.end)}`).join(", ") : "no slots"}`}</span>
            <span className="text-xs font-medium" aria-hidden="true">
              {WEEKDAY_SHORT[day]}
            </span>
            <span className={cn("text-lg font-semibold tabular-nums", !has && "text-muted-foreground")} aria-hidden="true">
              {daySlots.length}
            </span>
            <span className="hidden truncate text-[0.7rem] text-muted-foreground md:block" aria-hidden="true">
              {has ? formatTime(daySlots[0]?.start) : "—"}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
