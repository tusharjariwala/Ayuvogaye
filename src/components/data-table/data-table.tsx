import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type Row,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { useMemo, useState, type ReactNode } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/shared/states"
import type { CsvColumn } from "@/lib/data-access"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { DataTableMobileList } from "./data-table-mobile"
import { facetFilterFn } from "./filter-fns"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar, type DataTableFilter } from "./data-table-toolbar"

export interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[]
  data: T[]
  /** Text used for global search. Defaults to the row's primitive values. */
  getSearchText?: (row: T) => string
  searchPlaceholder?: string
  filters?: DataTableFilter[]
  toolbarActions?: ReactNode
  /** Rendered when one or more rows are selected (requires a selection column). */
  bulkActions?: (rows: T[], clearSelection: () => void) => ReactNode
  onRowClick?: (row: T) => void
  exportFilename?: string
  exportColumns?: CsvColumn<T>[]
  pageSize?: number
  initialSorting?: SortingState
  initialHidden?: VisibilityState
  getRowId?: (row: T) => string
  emptyTitle?: string
  emptyDescription?: string
  caption?: string
  className?: string
}

function defaultSearchText(row: unknown): string {
  if (!row || typeof row !== "object") return String(row ?? "")
  return Object.values(row)
    .filter((v) => typeof v === "string" || typeof v === "number")
    .join(" ")
}

export function DataTable<T>({
  columns,
  data,
  getSearchText,
  searchPlaceholder,
  filters = [],
  toolbarActions,
  bulkActions,
  onRowClick,
  exportFilename,
  exportColumns,
  pageSize = 10,
  initialSorting = [],
  initialHidden = {},
  getRowId,
  emptyTitle = "No results",
  emptyDescription = "Try adjusting your search or filters.",
  caption,
  className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialHidden)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")

  const filterIds = useMemo(() => new Set(filters.map((f) => f.columnId)), [filters])
  const preparedColumns = useMemo(
    () =>
      columns.map((c) => {
        const id = c.id ?? ("accessorKey" in c ? String(c.accessorKey) : undefined)
        return id && filterIds.has(id) && !c.filterFn ? { ...c, filterFn: facetFilterFn as FilterFn<T> } : c
      }),
    [columns, filterIds],
  )

  const globalFilterFn = useMemo<FilterFn<T>>(
    () => (row: Row<T>, _columnId: string, value: string) =>
      (getSearchText ? getSearchText(row.original) : defaultSearchText(row.original))
        .toLowerCase()
        .includes(String(value).toLowerCase()),
    [getSearchText],
  )

  const table = useReactTable({
    data,
    columns: preparedColumns,
    state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter },
    initialState: { pagination: { pageSize } },
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
    getColumnCanGlobalFilter: () => true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  })

  const isMobile = useIsMobile()
  const selected = table.getSelectedRowModel().rows.map((r) => r.original)
  const rows = table.getRowModel().rows

  return (
    <div className={cn("space-y-3", className)}>
      <DataTableToolbar
        table={table}
        filters={filters}
        searchPlaceholder={searchPlaceholder}
        actions={toolbarActions}
        exportFilename={exportFilename}
        exportColumns={exportColumns}
        bulkActions={selected.length > 0 && bulkActions ? bulkActions(selected, () => table.resetRowSelection()) : null}
        selectedCount={selected.length}
      />
      {isMobile ? (
        <DataTableMobileList
          table={table}
          rows={rows}
          onRowClick={onRowClick}
          empty={<EmptyState title={emptyTitle} description={emptyDescription} />}
          caption={caption}
        />
      ) : (
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft">
        <div className="overflow-x-auto">
          <Table>
            {caption && <caption className="sr-only">{caption}</caption>}
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-11 px-3 whitespace-nowrap"
                      aria-sort={
                        header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : undefined
                      }
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className={cn(onRowClick && "cursor-pointer")}
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
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-3 py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={table.getVisibleLeafColumns().length} className="p-4">
                    <EmptyState title={emptyTitle} description={emptyDescription} className="border-0 bg-transparent" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      )}
      <DataTablePagination table={table} />
    </div>
  )
}
