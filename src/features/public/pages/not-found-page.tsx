import { ArrowLeft, Building2, Compass, Search, Stethoscope, Syringe } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"

const LINKS = [
  { to: "/hospitals", label: "Hospitals", icon: Building2 },
  { to: "/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/treatments", label: "Treatments", icon: Syringe },
  { to: "/search", label: "Search", icon: Search },
]

export default function NotFoundPage() {
  return (
    <div className="container-page flex flex-col items-center py-16 text-center sm:py-24">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="size-8" aria-hidden="true" />
      </span>
      <p className="mt-6 text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">We couldn't find that page</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The link may be broken or the page may have moved. Try one of these instead.
      </p>
      <ul className="mt-8 grid w-full max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
        {LINKS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-sm font-medium shadow-soft transition-shadow hover:shadow-raised focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Icon className="size-5 text-primary" aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <Button asChild className="mt-8">
        <Link to="/">
          <ArrowLeft /> Back to home
        </Link>
      </Button>
    </div>
  )
}
