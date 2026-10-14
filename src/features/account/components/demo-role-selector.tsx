import { Building2, ChevronRight, ShieldCheck, Stethoscope, UserRound, UsersRound, type LucideIcon } from "lucide-react"
import { toast } from "sonner"
import { demoAccounts } from "@/data"
import { useDemoStore } from "@/hooks/use-demo-store"
import { ROLE_LABELS } from "@/lib/constants"
import type { UserRole } from "@/types"

const ROLE_META: { role: UserRole; icon: LucideIcon; summary: string }[] = [
  { role: "patient", icon: UserRound, summary: "Search, save favourites, request appointments" },
  { role: "doctor", icon: Stethoscope, summary: "Doctor portal: requests, availability, profile" },
  { role: "hospital_admin", icon: Building2, summary: "Hospital portal: leads, profile, team" },
  { role: "staff", icon: UsersRound, summary: "Handle hospital enquiries and appointments" },
  { role: "platform_admin", icon: ShieldCheck, summary: "Moderation, verification, platform settings" },
]

/** One-click sample accounts for each demo role. */
export function DemoRoleSelector({ onSignedIn }: { onSignedIn: (role: UserRole) => void }) {
  const { data, signInAsRole } = useDemoStore()

  const signIn = (role: UserRole) => {
    const user = signInAsRole(role)
    if (!user) {
      toast.error("Sample account not found", { description: "Try resetting the demo data." })
      return
    }
    toast.success(`Signed in as ${user.name}`, { description: `Demo role: ${ROLE_LABELS[role]} — no real authentication.` })
    onSignedIn(role)
  }

  return (
    <ul className="grid gap-2" aria-label="Sample demo accounts">
      {ROLE_META.map(({ role, icon: Icon, summary }) => {
        const user = data.users.find((u) => u.id === demoAccounts[role]) ?? data.users.find((u) => u.role === role)
        return (
          <li key={role}>
            <button
              type="button"
              onClick={() => signIn(role)}
              disabled={!user}
              aria-label={`Sign in as ${ROLE_LABELS[role]}${user ? ` (${user.name})` : ""}`}
              className="group flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors outline-none hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{ROLE_LABELS[role]}</span>
                <span className="block truncate text-xs text-foreground/80">
                  {user ? `${user.name} · ${user.email}` : "Unavailable"}
                </span>
                <span className="block truncate text-xs text-muted-foreground">{summary}</span>
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
