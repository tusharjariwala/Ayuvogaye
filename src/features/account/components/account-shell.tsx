import type { ReactNode } from "react"
import { NavLink } from "react-router"
import { PageHeader } from "@/components/shared/page-header"
import { accountNav } from "@/app/navigation"
import { useDemoStore } from "@/hooks/use-demo-store"
import { ROLE_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface AccountShellProps {
  title: string
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
}

/** Two-column account layout: sub-navigation on the left, page content on the right. */
export function AccountShell({ title, description, actions, children }: AccountShellProps) {
  const { currentUser } = useDemoStore()
  return (
    <div className="container-page py-8">
      <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          {currentUser && (
            <div className="mb-4 hidden rounded-xl border bg-card p-4 lg:block">
              <p className="truncate text-sm font-semibold">{currentUser.name}</p>
              <p className="truncate text-xs text-muted-foreground">{currentUser.email}</p>
              <p className="mt-1 text-xs text-primary">{ROLE_LABELS[currentUser.role]} · demo account</p>
            </div>
          )}
          <nav aria-label="Account">
            <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
              {accountNav.map(({ title: label, href, icon: Icon }) => (
                <li key={href} className="shrink-0">
                  <NavLink
                    to={href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )
                    }
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <div className="min-w-0 space-y-6">
          <PageHeader title={title} description={description} actions={actions} />
          {children}
        </div>
      </div>
    </div>
  )
}
