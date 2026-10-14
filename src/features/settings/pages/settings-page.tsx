import { Bell, Building2, KeyRound, Palette, SlidersHorizontal, UserRound, Users, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { useSearchParams } from "react-router"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/shared/page-header"
import { AccountShell } from "@/features/account/components/account-shell"
import { useDemoStore } from "@/hooks/use-demo-store"
import { AppearanceSettings } from "../components/appearance-settings"
import { DemoDataCard } from "../components/demo-data-card"
import { GeneralSettings } from "../components/general-settings"
import { NotificationPreferencesCard } from "../components/notification-preferences"
import { OrganizationSettings } from "../components/organization-settings"
import { PlatformSettingsForm } from "../components/platform-settings-form"
import { ProfileSettings } from "../components/profile-settings"
import { RolesPermissions } from "../components/roles-permissions"
import { TeamMembers } from "../components/team-members"

type Variant = "patient" | "hospital" | "doctor" | "admin"
type TabKey = "general" | "profile" | "organization" | "appearance" | "notifications" | "team" | "roles"

const TABS: { key: TabKey; label: string; icon: LucideIcon; variants: Variant[] }[] = [
  { key: "general", label: "General", icon: SlidersHorizontal, variants: ["patient", "hospital", "doctor", "admin"] },
  { key: "profile", label: "Profile", icon: UserRound, variants: ["patient", "hospital", "doctor", "admin"] },
  { key: "organization", label: "Organization", icon: Building2, variants: ["hospital", "doctor", "admin"] },
  { key: "appearance", label: "Appearance", icon: Palette, variants: ["patient", "hospital", "doctor", "admin"] },
  { key: "notifications", label: "Notifications", icon: Bell, variants: ["patient", "hospital", "doctor", "admin"] },
  { key: "team", label: "Team members", icon: Users, variants: ["hospital", "admin"] },
  { key: "roles", label: "Roles & permissions", icon: KeyRound, variants: ["hospital", "doctor", "admin"] },
]

const DESCRIPTIONS: Record<Variant, string> = {
  patient: "Manage your preferences, appearance and notifications.",
  hospital: "Manage your hospital workspace, team and preferences.",
  doctor: "Manage your practice details and preferences.",
  admin: "Configure the platform, team access and your preferences.",
}

export default function SettingsPage({ variant }: { variant: Variant }) {
  const { currentUser } = useDemoStore()
  const [params, setParams] = useSearchParams()
  const tabs = TABS.filter((t) => t.variants.includes(variant))
  const requested = params.get("tab")
  const active = tabs.find((t) => t.key === requested)?.key ?? "general"

  const changeTab = (value: string) => {
    const next = new URLSearchParams(params)
    if (value === "general") next.delete("tab")
    else next.set("tab", value)
    setParams(next, { replace: true })
  }

  const panels: Record<TabKey, ReactNode> = {
    general: (
      <div className="space-y-6">
        {variant === "admin" && <PlatformSettingsForm />}
        <GeneralSettings />
      </div>
    ),
    profile: currentUser ? <ProfileSettings user={currentUser} variant={variant} /> : null,
    organization: variant === "patient" ? null : <OrganizationSettings variant={variant} />,
    appearance: <AppearanceSettings />,
    notifications: currentUser ? <NotificationPreferencesCard user={currentUser} /> : null,
    team: variant === "hospital" || variant === "admin" ? <TeamMembers variant={variant} /> : null,
    roles: <RolesPermissions />,
  }

  const body = (
    <div className="space-y-6">
      <Tabs value={active} onValueChange={changeTab} className="gap-5">
        <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <TabsList className="w-max">
            {tabs.map(({ key, label, icon: Icon }) => (
              <TabsTrigger key={key} value={key} className="px-3">
                <Icon aria-hidden="true" /> {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {tabs.map((t) => (
          <TabsContent key={t.key} value={t.key}>
            {panels[t.key]}
          </TabsContent>
        ))}
      </Tabs>
      <DemoDataCard />
    </div>
  )

  if (variant === "patient") {
    return (
      <AccountShell title="Settings" description={DESCRIPTIONS.patient}>
        {body}
      </AccountShell>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description={DESCRIPTIONS[variant]} />
      {body}
    </div>
  )
}
