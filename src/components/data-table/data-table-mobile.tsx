import { flexRender, type Column, type Row, type Table } from "@tanstack/react-table"
import { ArrowDownUp } from "lucide-react"
import type { ReactNode } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { titleCase } from "@/lib/formatters"
import { cn } from "@/lib/utils"

const UTILITY_COLUMNS = new Set(["select", "actions"])

function columnLabel<T>(column: Column<T, unknown>): string {
  const meta = column.columnDef.meta
  if (meta && typeof meta === "object" && "label" in meta) return String((meta as { label: string }).label)
  const header = column.columnDef.header
  return typeof header === "string" ? header : titleCase(column.id)
}

interface DataTableMobileListProps<T> {
  table: Table<T>
  rows: Row<T>[]
  onRowClick?: (row: T) => void
  empty: ReactNode
  caption?: string
}

/**
 * Phone layout for DataTable: each row becomes a labelled card (first column as
 * the title, remaining visible columns as a definition list), plus a sort picker
 * because column headers are not shown.
 */
export function DataTableMobileList<T>({ table, rows, onRowClick, empty, caption }: DataTableMobileListProps<T>) {
  const sortable = table.getAllLeafColumns().filter((c) => c.getCanSort() && c.getIsVisible() && !UTILITY_COLUMNS.has(c.id))
  const sort = table.getState().sorting[0]
  const sortValue = sort ? `${sort.id}:${sort.desc ? "desc" : "asc"}` : "none"

  return (
    <div className="space-y-3">
      {sortable.length > 0 && (
        <div className="flex items-center gap-2">
          <ArrowDownUp className="size-4 text-muted-foreground" aria-hidden="true" />
          <Select
            value={sortValue}
            onValueChange={(v) => {
              if (v === "none") return table.setSorting([])
              const [id, dir] = v.split(":")
              table.setSorting([{ id, desc: dir === "desc" }])
            }}
          >
            <SelectTrigger className="flex-1" aria-label="Sort rows">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Default order</SelectItem>
              {sortable.flatMap((c) => [
                <SelectItem key={`${c.id}:asc`} value={`${c.id}:asc`}>
                  {columnLabel(c)} (A → Z / low → high)
                </SelectItem>,
                <SelectItem key={`${c.id}:desc`} value={`${c.id}:desc`}>
                  {columnLabel(c)} (Z → A / high → low)
                </SelectItem>,
              ])}
            </SelectContent>
          </Select>
        </div>
      )}
      {rows.length === 0 ? (
        empty
      ) : (
        <ul className="space-y-3" aria-label={caption}>
          {rows.map((row) => {
            const cells = row.getVisibleCells()
            const select = cells.find((c) => c.column.id === "select")
            const actions = cells.find((c) => c.column.id === "actions")
            const [first, ...rest] = cells.filter((c) => !UTILITY_COLUMNS.has(c.column.id))
            return (
              <li
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
                className={cn(
                  "rounded-2xl border border-border/80 bg-card p-4 shadow-soft data-[state=selected]:border-primary/40 data-[state=selected]:bg-accent",
                  onRowClick && "cursor-pointer active:bg-accent",
                )}
                onClick={
                  onRowClick
                    ? (e) => {
                        const target = e.target as HTMLElement
                        if (target.closest("button, a, input, [role=checkbox], [role=menuitem]")) return
                        onRowClick(row.original)
                      }
                    : undefined
                }
              >
                <div className="flex items-start gap-3">
                  {select && <div className="pt-0.5">{flexRender(select.column.columnDef.cell, select.getContext())}</div>}
                  <div className="min-w-0 flex-1 text-sm font-medium">{first && flexRender(first.column.columnDef.cell, first.getContext())}</div>
                  {actions && <div className="-mt-1 -mr-1">{flexRender(actions.column.columnDef.cell, actions.getContext())}</div>}
                </div>
                {rest.length > 0 && (
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/70 pt-3">
                    {rest.map((cell) => (
                      <div key={cell.id} className="min-w-0">
                        <dt className="text-xs text-muted-foreground">{columnLabel(cell.column)}</dt>
                        <dd className="mt-0.5 min-w-0 text-sm break-words [&_*]:max-w-full">{flexRender(cell.column.columnDef.cell, cell.getContext())}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
