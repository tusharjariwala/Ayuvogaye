import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns"

function toDate(value: string | Date): Date | null {
  const d = typeof value === "string" ? parseISO(value) : value
  return isValid(d) ? d : null
}

export function formatDate(value?: string | Date, pattern = "d MMM yyyy"): string {
  if (!value) return "—"
  const d = toDate(value)
  return d ? format(d, pattern) : "—"
}

export function formatDateTime(value?: string | Date): string {
  return formatDate(value, "d MMM yyyy, h:mm a")
}

export function formatRelative(value?: string | Date): string {
  if (!value) return "—"
  const d = toDate(value)
  return d ? `${formatDistanceToNowStrict(d)} ago` : "—"
}

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 })
const plain = new Intl.NumberFormat("en-IN")

export function formatCurrency(value?: number): string {
  return value === undefined ? "Not provided" : inr.format(value)
}

export function formatCurrencyRange(min: number, max: number): string {
  return `${inr.format(min)} – ${inr.format(max)}`
}

export function formatNumber(value: number): string {
  return plain.format(value)
}

export function formatCompact(value: number): string {
  return compact.format(value)
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`
}

export function initials(name: string): string {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`
}

export function titleCase(value: string): string {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

/** "10:30" -> "10:30 AM" */
export function formatTime(value?: string): string {
  if (!value) return "—"
  const [h, m] = value.split(":").map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return value
  const suffix = h >= 12 ? "PM" : "AM"
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`
}
