import type { Weekday } from "@/types"

const JS_DAYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

export function getToday(date = new Date()): Weekday {
  return JS_DAYS[date.getDay()]
}

export const FIELD_GROUP_LABELS: Record<string, string> = {
  basic_info: "Basic information (name, address, contact)",
  accreditations: "Accreditations",
  facilities: "Facilities",
  departments: "Departments",
  doctors: "Doctor associations",
  hours: "Operating hours",
}

export const ALL_FIELD_GROUPS = ["basic_info", "accreditations", "facilities", "departments", "doctors", "hours"]
