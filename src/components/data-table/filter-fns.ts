import type { FilterFn } from "@tanstack/react-table"

/** Matches when the cell value (or any array item) is in the selected values. */
export const facetFilterFn: FilterFn<unknown> = (row, columnId, value: string[]) => {
  if (!value || value.length === 0) return true
  const cell = row.getValue(columnId)
  const values = Array.isArray(cell) ? cell.map(String) : [String(cell)]
  return values.some((v) => value.includes(v))
}
