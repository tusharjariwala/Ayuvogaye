import { CheckCircle2, Inbox, MessageSquare, Send } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { EnquiriesTable } from "@/features/enquiries/components/enquiries-table"
import { useDemoStore } from "@/hooks/use-demo-store"
import { formatPercent } from "@/lib/formatters"
import { StatGrid } from "../components/admin-ui"

export default function EnquiriesPage() {
  const { data } = useDemoStore()
  const enquiries = data.enquiries
  const count = (s: string) => enquiries.filter((e) => e.status === s).length
  const converted = count("converted")
  return (
    <div className="space-y-6">
      <PageHeader
        title="Enquiries"
        description="Platform-wide monitoring of patient enquiries across all providers. All enquiries are fictional sample records; no messages are delivered."
      />
      <StatGrid>
        <StatCard label="Total enquiries" value={enquiries.length} icon={MessageSquare} />
        <StatCard label="New" value={count("new")} icon={Inbox} hint="Awaiting first response" />
        <StatCard label="In progress" value={count("contacted") + count("under_review") + count("quote_sent")} icon={Send} hint="Contacted, reviewing or quoted" />
        <StatCard
          label="Converted"
          value={converted}
          icon={CheckCircle2}
          hint={`${formatPercent(enquiries.length ? (converted / enquiries.length) * 100 : 0)} conversion`}
        />
      </StatGrid>
      <EnquiriesTable enquiries={enquiries} perspective="admin" />
    </div>
  )
}
