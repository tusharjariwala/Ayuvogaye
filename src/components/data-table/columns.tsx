import type { Column, ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

/** Sortable column header button. */
export function DataTableColumnHeader<T>({ column, title, className }: { column: Column<T, unknown>; title: string; className?: string }) {
  if (!column.getCanSort()) return <span className={className}>{title}</span>
  const sorted = column.getIsSorted()
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-2.5 h-8 data-[state=open]:bg-accent", className)}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      {sorted === "desc" ? <ArrowDown /> : sorted === "asc" ? <ArrowUp /> : <ChevronsUpDown className="opacity-50" />}
      <span className="sr-only">
        {sorted ? `Sorted ${sorted === "asc" ? "ascending" : "descending"}` : "Sort"}
      </span>
    </Button>
  )
}

/** Row-selection checkbox column. */
export function selectColumn<T>(): ColumnDef<T, unknown> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all rows on this page"
      />
    ),
    cell: ({ row }) => (
      <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />
    ),
    enableSorting: false,
    enableHiding: false,
  }
}
