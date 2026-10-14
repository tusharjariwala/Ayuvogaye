import { Building2, Heart, Stethoscope, Syringe } from "lucide-react"
import { useMemo } from "react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DoctorCard, HospitalCard, TreatmentCard } from "@/components/shared/entity-cards"
import { EmptyState } from "@/components/shared/states"
import { getDoctor, getHospital, getTreatment } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { AccountShell } from "../components/account-shell"
import { FavouriteGrid, type FavouriteEntry } from "../components/favourite-grid"

type Group = "hospital" | "doctor" | "treatment"

const GROUPS: { value: Group; label: string; icon: typeof Heart; href: string; browse: string }[] = [
  { value: "hospital", label: "Hospitals", icon: Building2, href: "/hospitals", browse: "Browse hospitals" },
  { value: "doctor", label: "Doctors", icon: Stethoscope, href: "/doctors", browse: "Find doctors" },
  { value: "treatment", label: "Treatments", icon: Syringe, href: "/treatments", browse: "Explore treatments" },
]

export default function FavouritesPage() {
  const { data, currentUser } = useDemoStore()

  const grouped = useMemo(() => {
    const result: Record<Group, FavouriteEntry[]> = { hospital: [], doctor: [], treatment: [] }
    const mine = data.favourites
      .filter((f) => f.userId === currentUser?.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    for (const favourite of mine) {
      if (favourite.entityType === "hospital") {
        const h = getHospital(data, favourite.entityId)
        if (h) result.hospital.push({ favourite, name: h.name, card: <HospitalCard hospital={h} /> })
      } else if (favourite.entityType === "doctor") {
        const d = getDoctor(data, favourite.entityId)
        if (d) result.doctor.push({ favourite, name: d.name, card: <DoctorCard doctor={d} /> })
      } else {
        const t = getTreatment(data, favourite.entityId)
        if (t) result.treatment.push({ favourite, name: t.name, card: <TreatmentCard treatment={t} /> })
      }
    }
    return result
  }, [data, currentUser?.id])

  const total = grouped.hospital.length + grouped.doctor.length + grouped.treatment.length
  const firstNonEmpty = GROUPS.find((g) => grouped[g.value].length > 0)?.value ?? "hospital"

  return (
    <AccountShell
      title="Favourites"
      description="Hospitals, doctors and treatments you've saved for later. Saved items are stored only in this browser."
    >
      {total === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favourites yet"
          description="Tap the heart on any hospital, doctor or treatment card to save it here."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {GROUPS.map((g) => (
                <Button key={g.value} asChild variant="outline" size="sm">
                  <Link to={g.href}>{g.browse}</Link>
                </Button>
              ))}
            </div>
          }
        />
      ) : (
        <Tabs defaultValue={firstNonEmpty} className="gap-5">
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <TabsList>
              {GROUPS.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value} className="px-3">
                  <Icon aria-hidden="true" />
                  {label}
                  <Badge variant="muted" className="ml-0.5 px-1.5 tabular-nums">
                    {grouped[value].length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {GROUPS.map((g) => (
            <TabsContent key={g.value} value={g.value}>
              {grouped[g.value].length ? (
                <FavouriteGrid entries={grouped[g.value]} />
              ) : (
                <EmptyState
                  icon={g.icon}
                  title={`No saved ${g.label.toLowerCase()}`}
                  description={`Save ${g.label.toLowerCase()} to compare and revisit them later.`}
                  action={
                    <Button asChild variant="outline">
                      <Link to={g.href}>{g.browse}</Link>
                    </Button>
                  }
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </AccountShell>
  )
}
