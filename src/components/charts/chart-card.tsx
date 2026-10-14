import { BarChart3, Table2 } from "lucide-react"
import { useId, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type ChartRange = "3" | "6" | "12"

export interface ChartTableColumn<T> {
  key: keyof T & string
  label: string
  format?: (value: T[keyof T]) => string
}

interface ChartCardProps<T> {
  title: string
  description?: string
  /** Plain-language summary read by assistive technology and shown under the chart. */
  summary: string
  rows: T[]
  tableColumns: ChartTableColumn<T>[]
  children: ReactNode
  /** Show the 3/6/12-month range filter. */
  range?: ChartRange
  onRangeChange?: (range: ChartRange) => void
  className?: string
  action?: ReactNode
}

/**
 * Card wrapper for every chart: title, optional time-range filter, accessible
 * summary, and a "View as table" alternative so data is never chart-only.
 */
export function ChartCard<T>({
  title,
  description,
  summary,
  rows,
  tableColumns,
  children,
  range,
  onRangeChange,
  className,
  action,
}: ChartCardProps<T>) {
  const [showTable, setShowTable] = useState(false)
  const summaryId = useId()
  return (
    <Card className={cn("gap-4", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <CardAction className="flex items-center gap-1.5">
          {action}
          {range && onRangeChange && (
            <Select value={range} onValueChange={(v) => onRangeChange(v as ChartRange)}>
              <SelectTrigger size="sm" className="w-[9.25rem]" aria-label={`${title} time range`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="3">Last 3 months</SelectItem>
                <SelectItem value="6">Last 6 months</SelectItem>
                <SelectItem value="12">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowTable((v) => !v)}
            aria-pressed={showTable}
            aria-label={showTable ? `Show ${title} as chart` : `Show ${title} as table`}
          >
            {showTable ? <BarChart3 /> : <Table2 />}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {showTable ? (
          <div className="max-h-72 overflow-auto rounded-lg border">
            <Table>
              <caption className="sr-only">{title}</caption>
              <TableHeader>
                <TableRow>
                  {tableColumns.map((c) => (
                    <TableHead key={c.key}>{c.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={i}>
                    {tableColumns.map((c) => (
                      <TableCell key={c.key} className="tabular-nums">
                        {c.format ? c.format(r[c.key]) : String(r[c.key])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <figure aria-describedby={summaryId} className="m-0">
            {children}
          </figure>
        )}
        <p id={summaryId} className="text-xs text-muted-foreground">
          {summary}
        </p>
      </CardContent>
    </Card>
  )
}

export function sliceByRange<T>(rows: T[], range: ChartRange): T[] {
  return rows.slice(-Number(range))
}
