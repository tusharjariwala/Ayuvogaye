import { useState } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCompact, formatNumber } from "@/lib/formatters"
import { ChartCard, sliceByRange, type ChartRange } from "./chart-card"

/*
 * All charts read colors from CSS variables (--chart-1…5), so they follow the
 * Light/Dark theme automatically. The categorical palette was validated for
 * colour-vision deficiency and contrast against both card surfaces.
 * Conventions: one y-axis, 2px lines, 4px rounded bar ends, recessive grid,
 * legend whenever there are two or more series, and a table view.
 */

const axisProps = { tickLine: false, axisLine: false, tickMargin: 8 } as const
const yAxisProps = { ...axisProps, width: 44, tickFormatter: (v: number) => formatCompact(v) } as const

function sum<T>(rows: T[], get: (r: T) => number) {
  return rows.reduce((s, r) => s + get(r), 0)
}

// ---------- Patient acquisition ----------

export interface AcquisitionPoint {
  month: string
  patients: number
  providers: number
}

const acquisitionConfig = {
  patients: { label: "New patients", color: "var(--chart-1)" },
  providers: { label: "New providers", color: "var(--chart-2)" },
} satisfies ChartConfig

export function PatientAcquisitionChart({ data, title = "User acquisition" }: { data: AcquisitionPoint[]; title?: string }) {
  const [range, setRange] = useState<ChartRange>("12")
  const rows = sliceByRange(data, range)
  return (
    <ChartCard
      title={title}
      description="New patient and provider sign-ups per month (sample data)"
      summary={`Over the selected ${rows.length} months, ${formatNumber(sum(rows, (r) => r.patients))} patients and ${formatNumber(sum(rows, (r) => r.providers))} providers joined (illustrative figures).`}
      rows={rows}
      tableColumns={[
        { key: "month", label: "Month" },
        { key: "patients", label: "Patients" },
        { key: "providers", label: "Providers" },
      ]}
      range={range}
      onRangeChange={setRange}
    >
      <ChartContainer config={acquisitionConfig} className="aspect-auto h-64 w-full">
        <LineChart data={rows} margin={{ left: 0, right: 12, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="month" {...axisProps} />
          <YAxis {...yAxisProps} />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line dataKey="patients" type="monotone" stroke="var(--color-patients)" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
          <Line dataKey="providers" type="monotone" stroke="var(--color-providers)" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </ChartContainer>
    </ChartCard>
  )
}

// ---------- Enquiry conversion ----------

export interface ConversionPoint {
  month: string
  enquiries: number
  converted: number
}

const conversionConfig = {
  enquiries: { label: "Enquiries", color: "var(--chart-1)" },
  converted: { label: "Converted", color: "var(--chart-3)" },
} satisfies ChartConfig

export function EnquiryConversionChart({ data, title = "Enquiry conversion" }: { data: ConversionPoint[]; title?: string }) {
  const [range, setRange] = useState<ChartRange>("6")
  const rows = sliceByRange(data, range)
  const total = sum(rows, (r) => r.enquiries)
  const converted = sum(rows, (r) => r.converted)
  const rate = total ? ((converted / total) * 100).toFixed(1) : "0"
  return (
    <ChartCard
      title={title}
      description="Enquiries received vs. converted to appointments"
      summary={`${formatNumber(converted)} of ${formatNumber(total)} enquiries converted (${rate}%) in the selected period. Sample data.`}
      rows={rows}
      tableColumns={[
        { key: "month", label: "Month" },
        { key: "enquiries", label: "Enquiries" },
        { key: "converted", label: "Converted" },
      ]}
      range={range}
      onRangeChange={setRange}
    >
      <ChartContainer config={conversionConfig} className="aspect-auto h-64 w-full">
        <BarChart data={rows} margin={{ left: 0, right: 12, top: 8 }} barGap={2}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="month" {...axisProps} />
          <YAxis {...yAxisProps} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="enquiries" fill="var(--color-enquiries)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="converted" fill="var(--color-converted)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}

// ---------- Revenue (illustrative) ----------

export interface RevenuePoint {
  month: string
  sponsored: number
  subscriptions: number
}

const revenueConfig = {
  subscriptions: { label: "Subscriptions", color: "var(--chart-1)" },
  sponsored: { label: "Sponsored listings", color: "var(--chart-2)" },
} satisfies ChartConfig

export function RevenueChart({ data, title = "Platform revenue (illustrative)" }: { data: RevenuePoint[]; title?: string }) {
  const [range, setRange] = useState<ChartRange>("12")
  const rows = sliceByRange(data, range)
  return (
    <ChartCard
      title={title}
      description="₹ thousands per month — fictional figures, no payments are processed"
      summary={`Illustrative totals for the selected period: ₹${formatNumber(sum(rows, (r) => r.subscriptions))}k subscriptions and ₹${formatNumber(sum(rows, (r) => r.sponsored))}k sponsored listings.`}
      rows={rows}
      tableColumns={[
        { key: "month", label: "Month" },
        { key: "subscriptions", label: "Subscriptions (₹k)" },
        { key: "sponsored", label: "Sponsored (₹k)" },
      ]}
      range={range}
      onRangeChange={setRange}
    >
      <ChartContainer config={revenueConfig} className="aspect-auto h-64 w-full">
        <AreaChart data={rows} margin={{ left: 0, right: 12, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="month" {...axisProps} />
          <YAxis {...yAxisProps} />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Area dataKey="subscriptions" type="monotone" stackId="r" stroke="var(--color-subscriptions)" fill="var(--color-subscriptions)" fillOpacity={0.18} strokeWidth={2} />
          <Area dataKey="sponsored" type="monotone" stackId="r" stroke="var(--color-sponsored)" fill="var(--color-sponsored)" fillOpacity={0.18} strokeWidth={2} />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  )
}

// ---------- Appointment status ----------

export interface StatusCountPoint {
  status: string
  count: number
}

const statusConfig = { count: { label: "Appointments", color: "var(--chart-1)" } } satisfies ChartConfig

/** Single-series bar chart; status names are on the axis so color carries no meaning. */
export function AppointmentStatusChart({ data, title = "Appointments by status" }: { data: StatusCountPoint[]; title?: string }) {
  const total = sum(data, (r) => r.count)
  return (
    <ChartCard
      title={title}
      description="Current status of appointment requests in the demo data"
      summary={`${formatNumber(total)} appointment requests: ${data.map((d) => `${d.status} ${d.count}`).join(", ")}.`}
      rows={data}
      tableColumns={[
        { key: "status", label: "Status" },
        { key: "count", label: "Count" },
      ]}
    >
      <ChartContainer config={statusConfig} className="aspect-auto h-64 w-full">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} {...axisProps} />
          <YAxis type="category" dataKey="status" width={90} {...axisProps} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} maxBarSize={24} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}

// ---------- Provider distribution ----------

export interface DistributionPoint {
  city: string
  hospitals: number
  doctors: number
}

const distributionConfig = {
  hospitals: { label: "Hospitals", color: "var(--chart-1)" },
  doctors: { label: "Doctors", color: "var(--chart-3)" },
} satisfies ChartConfig

export function ProviderDistributionChart({ data, title = "Provider distribution by city" }: { data: DistributionPoint[]; title?: string }) {
  return (
    <ChartCard
      title={title}
      description="Listed hospitals and doctors per city"
      summary={`Providers are listed in ${data.length} cities. ${data
        .slice(0, 3)
        .map((d) => `${d.city}: ${d.hospitals} hospitals, ${d.doctors} doctors`)
        .join("; ")}.`}
      rows={data}
      tableColumns={[
        { key: "city", label: "City" },
        { key: "hospitals", label: "Hospitals" },
        { key: "doctors", label: "Doctors" },
      ]}
    >
      <ChartContainer config={distributionConfig} className="aspect-auto h-64 w-full">
        <BarChart data={data} margin={{ left: 0, right: 12, top: 8 }} barGap={2}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="city" {...axisProps} interval={0} angle={-30} textAnchor="end" height={50} />
          <YAxis allowDecimals={false} {...axisProps} width={32} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} verticalAlign="top" />
          <Bar dataKey="hospitals" fill="var(--color-hospitals)" radius={[4, 4, 0, 0]} maxBarSize={22} />
          <Bar dataKey="doctors" fill="var(--color-doctors)" radius={[4, 4, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}

// ---------- Generic monthly trend (portals) ----------

export interface TrendSeries {
  key: string
  label: string
  /** 1–5: index into the validated categorical palette. */
  colorIndex: 1 | 2 | 3 | 4 | 5
}

export function MonthlyTrendChart<T extends { month: string }>({
  data,
  series,
  title,
  description,
  summary,
  variant = "bar",
}: {
  data: T[]
  series: TrendSeries[]
  title: string
  description?: string
  summary: string
  variant?: "bar" | "line"
}) {
  const [range, setRange] = useState<ChartRange>("6")
  const rows = sliceByRange(data, range)
  const config = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: `var(--chart-${s.colorIndex})` }]),
  ) satisfies ChartConfig
  return (
    <ChartCard
      title={title}
      description={description}
      summary={summary}
      rows={rows}
      tableColumns={[
        { key: "month", label: "Month" },
        ...series.map((s) => ({ key: s.key as keyof T & string, label: s.label })),
      ]}
      range={range}
      onRangeChange={setRange}
    >
      <ChartContainer config={config} className="aspect-auto h-64 w-full">
        {variant === "bar" ? (
          <BarChart data={rows} margin={{ left: 0, right: 12, top: 8 }} barGap={2}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...yAxisProps} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} fill={`var(--color-${s.key})`} radius={[4, 4, 0, 0]} maxBarSize={28} />
            ))}
          </BarChart>
        ) : (
          <LineChart data={rows} margin={{ left: 0, right: 12, top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...yAxisProps} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
            {series.map((s) => (
              <Line key={s.key} dataKey={s.key} type="monotone" stroke={`var(--color-${s.key})`} strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        )}
      </ChartContainer>
    </ChartCard>
  )
}
