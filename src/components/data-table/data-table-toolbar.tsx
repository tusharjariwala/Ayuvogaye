import type { Table } from "@tanstack/react-table"
import { Download, Settings2, X } from "lucide-react"
import type { ReactNode } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FacetFilter, SearchInput, type FilterOption } from "@/components/shared/filters"
import { downloadCsv, type CsvColumn } from "@/lib/data-access"

export interface DataTableFilter {
  columnId: string
  title: string
  options: FilterOption[]
}

interface DataTableToolbarProps<T> {
  table: Table<T>
  filters: DataTableFilter[]
  searchPlaceholder?: string
  actions?: ReactNode
  bulkActions?: ReactNode
  selectedCount: number
  exportFilename?: string
  exportColumns?: CsvColumn<T>[]
}

export function DataTableToolbar<T>({
  table,
  filters,
  searchPlaceholder = "Search…",
  actions,
  bulkActions,
  selectedCount,
  exportFilename,
  exportColumns,
}: DataTableToolbarProps<T>) {
  const globalFilter = String(table.getState().globalFilter ?? "")
  const isFiltered = table.getState().columnFilters.length > 0 || globalFilter.length > 0

  const handleExport = () => {
    if (!exportFilename || !exportColumns) return
    const rows = table.getFilteredRowModel().rows.map((r) => r.original)
    downloadCsv(exportFilename, rows, exportColumns)
    toast.success(`Exported ${rows.length} rows`, { description: "CSV generated from local static data." })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchInput
            value={globalFilter}
            onChange={(v) => {
              table.setGlobalFilter(v)
              table.setPageIndex(0)
            }}
            placeholder={searchPlaceholder}
            className="w-full sm:w-72"
          />
          {filters.map((f) => {
            const column = table.getColumn(f.columnId)
            if (!column) return null
            const value = (column.getFilterValue() as string[] | undefined) ?? []
            return (
              <FacetFilter
                key={f.columnId}
                title={f.title}
                options={f.options}
                selected={value}
                onChange={(next) => {
                  column.setFilterValue(next.length ? next : undefined)
                  table.setPageIndex(0)
                }}
              />
            )
          })}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => {
                table.resetColumnFilters()
                table.setGlobalFilter("")
              }}
            >
              <X /> Reset
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {exportFilename && exportColumns && (
            <Button variant="outline" onClick={handleExport}>
              <Download /> Export CSV
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" aria-label="Toggle columns">
                <Settings2 /> <span className="hidden sm:inline">Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((c) => c.getCanHide())
                .map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c.id}
                    checked={c.getIsVisible()}
                    onCheckedChange={(v) => c.toggleVisibility(!!v)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {typeof c.columnDef.meta === "object" && c.columnDef.meta && "label" in c.columnDef.meta
                      ? String((c.columnDef.meta as { label: string }).label)
                      : c.id.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {actions}
        </div>
      </div>
      {selectedCount > 0 && bulkActions && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-accent px-3 py-2 text-sm">
          <span className="font-medium">{selectedCount} selected</span>
          <span className="flex-1" />
          {bulkActions}
        </div>
      )}
    </div>
  )
}
