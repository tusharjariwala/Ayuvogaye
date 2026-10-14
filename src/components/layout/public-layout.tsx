import { Menu, UserPlus } from "lucide-react"
import { Suspense, useState } from "react"
import { Link, NavLink, Outlet } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DemoBanner } from "@/components/shared/demo-notice"
import { LoadingSkeleton } from "@/components/shared/states"
import { BrandLogo } from "@/components/shared/visuals"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { accountNav, publicNav } from "@/app/navigation"
import { useDemoStore } from "@/hooks/use-demo-store"
import { APP_NAME, ROLE_HOME } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { CommandMenu } from "./command-menu"
import { NotificationMenu } from "./notification-menu"
import { UserMenu } from "./user-menu"

function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Skip to main content
    </a>
  )
}

export function PublicHeader() {
  const { compareIds, currentUser } = useDemoStore()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-page flex h-16 items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[18rem] p-0">
            <SheetHeader className="border-b p-4">
              <SheetTitle>
                <BrandLogo />
              </SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col gap-1 p-3" aria-label="Mobile">
              {publicNav.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-accent",
                      isActive && "bg-accent text-primary",
                    )
                  }
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  {item.title}
                  {item.href === "/compare/hospitals" && compareIds.length > 0 && <Badge className="ml-auto">{compareIds.length}</Badge>}
                </NavLink>
              ))}
              <Separator className="my-2" />
              {currentUser ? (
                (currentUser.role === "patient" ? accountNav : [{ title: "Go to dashboard", href: ROLE_HOME[currentUser.role], icon: accountNav[0].icon }]).map(
                  (item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm hover:bg-accent"
                    >
                      <item.icon className="size-4" aria-hidden="true" />
                      {item.title}
                    </NavLink>
                  ),
                )
              ) : (
                <div className="grid gap-2 p-1">
                  <Button asChild onClick={() => setOpen(false)}>
                    <Link to="/account/login">Sign in</Link>
                  </Button>
                  <Button asChild variant="outline" onClick={() => setOpen(false)}>
                    <Link to="/account/register">Create account</Link>
                  </Button>
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="rounded-md" aria-label={`${APP_NAME} home`}>
          <BrandLogo nameClassName="max-[420px]:sr-only" />
        </Link>

        <nav className="ml-2 hidden items-center gap-0.5 lg:flex xl:ml-6 xl:gap-1" aria-label="Main">
          {publicNav.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  isActive && "bg-accent text-primary",
                )
              }
            >
              {item.title}
              {item.href === "/compare/hospitals" && compareIds.length > 0 && (
                <Badge className="h-5 min-w-5 px-1 tabular-nums" aria-label={`${compareIds.length} hospitals selected`}>
                  {compareIds.length}
                </Badge>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <CommandMenu compact className="xl:hidden" />
          <CommandMenu className="hidden w-56 xl:inline-flex" />
          <ThemeToggle />
          <NotificationMenu />
          {!currentUser && (
            <Button asChild variant="highlight" className="hidden md:inline-flex">
              <Link to="/account/register">
                <UserPlus /> Register
              </Link>
            </Button>
          )}
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

const CURRENT_YEAR = new Date().getFullYear()

const FOOTER_LINKS = [
  {
    title: "Discover",
    links: [
      { label: "Hospitals", href: "/hospitals" },
      { label: "Doctors", href: "/doctors" },
      { label: "Treatments", href: "/treatments" },
      { label: "Compare hospitals", href: "/compare/hospitals" },
    ],
  },
  {
    title: "For providers",
    links: [
      { label: "Claim your profile", href: "/account/register?type=provider" },
      { label: "Hospital portal (demo)", href: "/provider/hospital/dashboard" },
      { label: "Doctor portal (demo)", href: "/provider/doctor/dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Videos", href: "/videos" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Report a profile", href: "/report-profile" },
    ],
  },
]

export function PublicFooter() {
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <BrandLogo />
          <p className="max-w-xs text-sm text-muted-foreground">
            A demo healthcare discovery template for exploring hospitals, doctors and treatments in India with transparent,
            clearly labelled information.
          </p>
          <p className="text-xs text-muted-foreground">
            Not medical advice. In an emergency, contact local emergency services.
          </p>
        </div>
        {FOOTER_LINKS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="mb-3 text-sm font-semibold">{col.title}</h2>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-muted-foreground hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t">
        <p className="container-page py-4 text-xs text-muted-foreground">
          © {CURRENT_YEAR} {APP_NAME} demo template. All providers, people, reviews and figures are fictional and for illustration only.
        </p>
      </div>
    </footer>
  )
}

export function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <SkipLink />
      <DemoBanner />
      <PublicHeader />
      <main id="main" className="flex-1" tabIndex={-1}>
        <Suspense
          fallback={
            <div className="container-page py-10">
              <LoadingSkeleton />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  )
}

export { SkipLink }
