import { Check, Plus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCompare } from "@/hooks/use-compare"
import { useDemoStore } from "@/hooks/use-demo-store"
import { MAX_COMPARE } from "@/lib/constants"
import { cn } from "@/lib/utils"

/** Searchable hospital picker that adds to the comparison (max MAX_COMPARE). */
export function AddHospitalCombobox({ className }: { className?: string }) {
  const { data } = useDemoStore()
  const { compareIds, add } = useCompare()
  const [open, setOpen] = useState(false)
  const full = compareIds.length >= MAX_COMPARE
  const hospitals = data.hospitals.filter((h) => h.status !== "suspended")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" disabled={full} className={className} aria-label={full ? `Comparison is full (${MAX_COMPARE} hospitals)` : "Add a hospital to compare"}>
          <Plus /> {full ? `Maximum ${MAX_COMPARE} hospitals` : "Add hospital"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-[calc(100vw-2rem)] p-0" align="end">
        <Command>
          <CommandInput placeholder="Search hospitals…" />
          <CommandList>
            <CommandEmpty>No hospitals found.</CommandEmpty>
            <CommandGroup heading={`${compareIds.length}/${MAX_COMPARE} selected`}>
              {hospitals.map((h) => {
                const selected = compareIds.includes(h.id)
                return (
                  <CommandItem
                    key={h.id}
                    value={`${h.name} ${h.city}`}
                    disabled={selected}
                    onSelect={() => {
                      add(h.id, h.name)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn("size-4", selected ? "opacity-100" : "opacity-0")} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{h.name}</span>
                      <span className="block text-xs text-muted-foreground">{h.city}</span>
                    </span>
                    {selected && <span className="text-xs text-muted-foreground">Added</span>}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
