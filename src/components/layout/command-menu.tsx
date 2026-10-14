import { Hospital, Monitor, Moon, Search, Stethoscope, Sun, Syringe, Tags } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import type { NavItem } from "@/app/navigation"
import { useDemoStore } from "@/hooks/use-demo-store"
import { useTheme } from "@/hooks/use-theme"
import { cn } from "@/lib/utils"

interface CommandMenuProps {
  navItems?: NavItem[]
  className?: string
  /** Compact icon-only trigger. */
  compact?: boolean
}

/** ⌘K / Ctrl+K palette for navigation, provider search and theme switching. */
export function CommandMenu({ navItems = [], className, compact }: CommandMenuProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { data } = useDemoStore()
  const { setTheme } = useTheme()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const go = (href: string) => {
    setOpen(false)
    navigate(href)
  }

  return (
    <>
      {compact ? (
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open search (Ctrl+K)" className={className}>
          <Search />
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className={cn("w-full justify-start gap-2 bg-card text-muted-foreground sm:w-64", className)}
          aria-label="Open search (Ctrl+K)"
        >
          <Search />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="pointer-events-none hidden rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:inline-block">
            Ctrl K
          </kbd>
        </Button>
      )}
      <CommandDialog open={open} onOpenChange={setOpen} title="Search" description="Search pages, hospitals, doctors and treatments">
        <CommandInput placeholder="Search pages, hospitals, doctors, treatments…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {navItems.length > 0 && (
            <CommandGroup heading="Pages">
              {navItems.map((item) => (
                <CommandItem key={item.href} value={`page ${item.title} ${item.href}`} onSelect={() => go(item.href)}>
                  <item.icon />
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandGroup heading="Hospitals">
            {data.hospitals.map((h) => (
              <CommandItem key={h.id} value={`hospital ${h.name} ${h.city}`} onSelect={() => go(`/hospital/${h.slug}`)}>
                <Hospital />
                <span className="truncate">{h.name}</span>
                <CommandShortcut>{h.city}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Doctors">
            {data.doctors.map((d) => (
              <CommandItem key={d.id} value={`doctor ${d.name} ${d.city}`} onSelect={() => go(`/doctor/${d.slug}`)}>
                <Stethoscope />
                <span className="truncate">{d.name}</span>
                <CommandShortcut>{d.city}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Treatments & specialties">
            {data.treatments.map((t) => (
              <CommandItem key={t.id} value={`treatment ${t.name}`} onSelect={() => go(`/treatment/${t.slug}`)}>
                <Syringe />
                {t.name}
              </CommandItem>
            ))}
            {data.specialties.map((s) => (
              <CommandItem key={s.id} value={`specialty ${s.name}`} onSelect={() => go(`/specialties/${s.slug}`)}>
                <Tags />
                {s.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem value="theme light" onSelect={() => { setTheme("light"); setOpen(false) }}>
              <Sun /> Light theme
            </CommandItem>
            <CommandItem value="theme dark" onSelect={() => { setTheme("dark"); setOpen(false) }}>
              <Moon /> Dark theme
            </CommandItem>
            <CommandItem value="theme system" onSelect={() => { setTheme("system"); setOpen(false) }}>
              <Monitor /> System theme
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
