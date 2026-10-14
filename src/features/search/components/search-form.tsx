import { MapPin, Search } from "lucide-react"
import { useId, useState, type FormEvent } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDemoStore } from "@/hooks/use-demo-store"
import { cn } from "@/lib/utils"

export type SearchType = "all" | "hospitals" | "doctors" | "treatments" | "specialties"

const TYPE_OPTIONS: { value: SearchType; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "hospitals", label: "Hospitals" },
  { value: "doctors", label: "Doctors" },
  { value: "treatments", label: "Treatments" },
  { value: "specialties", label: "Specialties" },
]

const ALL_CITIES = "all"

interface SearchFormProps {
  defaultQuery?: string
  defaultCity?: string
  defaultType?: SearchType
  size?: "default" | "lg"
  className?: string
}

/** What / type / where search form that submits to `/search`. */
export function SearchForm({ defaultQuery = "", defaultCity = "", defaultType = "all", size = "default", className }: SearchFormProps) {
  const { data } = useDemoStore()
  const navigate = useNavigate()
  const id = useId()
  const [q, setQ] = useState(defaultQuery)
  const [type, setType] = useState<SearchType>(defaultType)
  const [city, setCity] = useState(defaultCity || ALL_CITIES)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q.trim()) params.set("q", q.trim())
    if (city !== ALL_CITIES) params.set("city", city)
    if (type !== "all") params.set("type", type)
    navigate(`/search?${params.toString()}`)
  }

  const lg = size === "lg"
  const control = lg ? "h-12 text-base" : "h-10"

  return (
    <form
      role="search"
      onSubmit={submit}
      className={cn("grid gap-3 rounded-xl border bg-card p-3 shadow-soft sm:p-4 sm:grid-cols-2 sm:items-end xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1fr)_auto]", className)}
    >
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-q`} className="text-xs text-muted-foreground">
          Doctor, hospital, specialty or treatment
        </Label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id={`${id}-q`}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. knee replacement, cardiology"
            className={cn("pl-9", control)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-type`} className="text-xs text-muted-foreground">
          Looking for
        </Label>
        <Select value={type} onValueChange={(v) => setType(v as SearchType)}>
          <SelectTrigger id={`${id}-type`} className={cn("w-full", lg && "data-[size=default]:h-12")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-city`} className="text-xs text-muted-foreground">
          Location
        </Label>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger id={`${id}-city`} className={cn("w-full", lg && "data-[size=default]:h-12")}>
            <MapPin className="text-muted-foreground" aria-hidden="true" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CITIES}>All cities</SelectItem>
            {data.cities.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" size={lg ? "lg" : "default"} className={cn(lg && "h-12 px-6")}>
        <Search /> Search
      </Button>
    </form>
  )
}
