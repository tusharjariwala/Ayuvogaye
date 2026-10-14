/**
 * Generic, typed, side-effect-free data-access helpers that operate on the
 * in-memory mock collections. A backend integration would replace these with
 * API calls that accept the same parameters.
 */

export type SortDirection = "asc" | "desc"

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

type Primitive = string | number | boolean | null | undefined

/** Case-insensitive, multi-term search over the values returned by `getText`. */
export function searchItems<T>(items: T[], query: string, getText: (item: T) => Array<Primitive | Primitive[]>): T[] {
  const q = query.trim().toLowerCase()
  if (!q) return items
  const terms = q.split(/\s+/)
  return items.filter((item) => {
    const haystack = getText(item)
      .flat()
      .filter((v) => v !== null && v !== undefined)
      .join(" ")
      .toLowerCase()
    return terms.every((t) => haystack.includes(t))
  })
}

/** Applies every predicate (logical AND). Falsy predicates are skipped. */
export function filterItems<T>(items: T[], predicates: Array<((item: T) => boolean) | undefined | false>): T[] {
  const active = predicates.filter((p): p is (item: T) => boolean => typeof p === "function")
  if (active.length === 0) return items
  return items.filter((item) => active.every((p) => p(item)))
}

/** "Any of" match helper for multi-select filters. An empty selection matches everything. */
export function matchesAny<V>(selected: V[], values: V | V[]): boolean {
  if (selected.length === 0) return true
  const list = Array.isArray(values) ? values : [values]
  return list.some((v) => selected.includes(v))
}

export function sortItems<T>(items: T[], getValue: (item: T) => Primitive, direction: SortDirection = "asc"): T[] {
  const factor = direction === "asc" ? 1 : -1
  return [...items].sort((a, b) => {
    const av = getValue(a)
    const bv = getValue(b)
    if (av === bv) return 0
    if (av === null || av === undefined) return 1
    if (bv === null || bv === undefined) return -1
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * factor
    return String(av).localeCompare(String(bv), "en-IN", { numeric: true }) * factor
  })
}

export function paginate<T>(items: T[], page: number, pageSize: number): PageResult<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(Math.max(1, page), pageCount)
  const start = (safePage - 1) * pageSize
  return { items: items.slice(start, start + pageSize), total: items.length, page: safePage, pageSize, pageCount }
}

export function findById<T extends { id: string }>(items: T[], id: string | undefined): T | undefined {
  return id ? items.find((i) => i.id === id) : undefined
}

export function findBySlug<T extends { slug: string }>(items: T[], slug: string | undefined): T | undefined {
  return slug ? items.find((i) => i.slug === slug) : undefined
}

export function createItem<T extends { id: string }>(items: T[], item: T): T[] {
  return [item, ...items]
}

export function updateItem<T extends { id: string }>(items: T[], id: string, patch: Partial<T> | ((prev: T) => T)): T[] {
  return items.map((i) => (i.id === id ? (typeof patch === "function" ? patch(i) : { ...i, ...patch }) : i))
}

export function deleteItem<T extends { id: string }>(items: T[], id: string): T[] {
  return items.filter((i) => i.id !== id)
}

export function uniqueValues<T, V>(items: T[], get: (item: T) => V | V[]): V[] {
  const set = new Set<V>()
  items.forEach((i) => {
    const v = get(i)
    const list = Array.isArray(v) ? v : [v]
    list.forEach((x) => set.add(x))
  })
  return [...set]
}

function csvCell(v: unknown): string {
  const s =
    v === null || v === undefined
      ? ""
      : Array.isArray(v)
        ? v.join("; ")
        : typeof v === "object"
          ? JSON.stringify(v)
          : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export interface CsvColumn<T> {
  header: string
  value: (row: T) => unknown
}

/** Serialises rows to CSV and triggers a browser download. Static data only. */
export function downloadCsv<T>(filename: string, rows: T[], columns: CsvColumn<T>[]): void {
  const csv = [
    columns.map((c) => csvCell(c.header)).join(","),
    ...rows.map((r) => columns.map((c) => csvCell(c.value(r))).join(",")),
  ].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
