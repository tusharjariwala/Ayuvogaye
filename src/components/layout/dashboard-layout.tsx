import { ExternalLink, FlaskConical } from "lucide-react"
import { Suspense } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { LoadingSkeleton } from "@/components/shared/states"
import { BrandLogo, BrandMark } from "@/components/shared/visuals"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import type { NavGroup } from "@/app/navigation"
import { useDemoStore } from "@/hooks/use-demo-store"
import { ROLE_LABELS } from "@/lib/constants"
import { initials } from "@/lib/formatters"
import { Breadcrumbs } from "./breadcrumbs"
import { CommandMenu } from "./command-menu"
import { NotificationMenu } from "./notification-menu"
import { SkipLink } from "./public-layout"
import { UserMenu } from "./user-menu"

interface AppSidebarProps {
  nav: NavGroup[]
  portalName: string
  portalSubtitle?: string
}

export function AppSidebar({ nav, portalName, portalSubtitle }: AppSidebarProps) {
  const { pathname } = useLocation()
  const { setOpenMobile, isMobile } = useSidebar()
  const { currentUser } = useDemoStore()
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-3 px-3 pt-4 pb-2">
        <Link to="/" className="flex items-center rounded-lg p-1 group-data-[collapsible=icon]:justify-center" aria-label="Ayuvoyage — back to public site">
          <BrandLogo className="group-data-[collapsible=icon]:hidden" />
          <BrandMark className="hidden size-8 group-data-[collapsible=icon]:block" />
        </Link>
        <div className="rounded-xl border border-sidebar-border bg-background/60 px-3 py-2.5 group-data-[collapsible=icon]:hidden">
          <p className="text-[11px] font-semibold tracking-wider text-primary uppercase">{portalName}</p>
          {portalSubtitle && <p className="truncate text-sm font-medium">{portalSubtitle}</p>}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-1">
        {nav.map((group) => (
          <SidebarGroup key={group.label} className="py-1.5">
            <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider uppercase">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <NavLink to={item.href} aria-current={active ? "page" : undefined} onClick={() => isMobile && setOpenMobile(false)}>
                          <item.icon />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="gap-2 border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="View public site">
              <Link to="/">
                <ExternalLink />
                <span>View public site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {currentUser && (
          <div className="flex items-center gap-2.5 rounded-xl bg-sidebar-accent/60 p-2.5 group-data-[collapsible=icon]:hidden">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">{initials(currentUser.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{currentUser.name}</p>
              <p className="truncate text-xs text-muted-foreground">{ROLE_LABELS[currentUser.role]} · demo</p>
            </div>
          </div>
        )}
        <p className="flex items-start gap-1.5 px-1 text-[11px] leading-snug text-muted-foreground group-data-[collapsible=icon]:hidden">
          <FlaskConical className="mt-0.5 size-3 shrink-0 text-warning" aria-hidden="true" />
          Demo portal — changes stay in this browser.
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export function AppHeader({ nav }: { nav: NavGroup[] }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-md sm:px-6">
      <SidebarTrigger aria-label="Toggle sidebar" className="size-9" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-5" />
      <Breadcrumbs className="hidden min-w-0 md:block" />
      <Link to="/" className="md:hidden" aria-label="Ayuvoyage home">
        <BrandMark className="size-8" />
      </Link>
      <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
        <CommandMenu navItems={nav.flatMap((g) => g.items)} compact className="md:hidden" />
        <CommandMenu navItems={nav.flatMap((g) => g.items)} className="hidden md:inline-flex" />
        <ThemeToggle />
        <NotificationMenu />
        <UserMenu />
      </div>
    </header>
  )
}

/** Shared shell for the hospital portal, doctor portal and admin dashboard. */
export function DashboardLayout({ nav, portalName, portalSubtitle }: AppSidebarProps) {
  return (
    <SidebarProvider>
      <SkipLink />
      <AppSidebar nav={nav} portalName={portalName} portalSubtitle={portalSubtitle} />
      <SidebarInset className="min-w-0 bg-background">
        <AppHeader nav={nav} />
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1440px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<LoadingSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
