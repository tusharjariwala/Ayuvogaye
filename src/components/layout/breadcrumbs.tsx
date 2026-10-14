import { Fragment } from "react"
import { Link, useLocation } from "react-router"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ALL_NAV_ITEMS } from "@/app/navigation"
import { titleCase } from "@/lib/formatters"

const SEGMENT_LABELS: Record<string, string> = {
  provider: "Provider portal",
  hospital: "Hospital",
  doctor: "Doctor",
  admin: "Admin",
  account: "Account",
}

/** Breadcrumbs derived from the current path and navigation config. */
export function Breadcrumbs({ className }: { className?: string }) {
  const { pathname } = useLocation()
  const segments = pathname.split("/").filter(Boolean)
  const crumbs = segments.map((seg, i) => {
    const href = `/${segments.slice(0, i + 1).join("/")}`
    const nav = ALL_NAV_ITEMS.find((n) => n.href === href)
    return { href, label: nav?.title ?? SEGMENT_LABELS[seg] ?? titleCase(decodeURIComponent(seg)) }
  })
  // Skip non-navigable intermediate segments such as "/provider".
  const visible = crumbs.filter((c, i) => i === crumbs.length - 1 || c.href !== "/provider")

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {visible.map((c, i) => (
          <Fragment key={c.href}>
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {i === visible.length - 1 ? (
                <BreadcrumbPage>{c.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={ALL_NAV_ITEMS.some((n) => n.href === `${c.href}/dashboard`) ? `${c.href}/dashboard` : c.href}>{c.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
