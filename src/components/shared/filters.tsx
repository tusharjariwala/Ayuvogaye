import { Check, ChevronDown, Search, X } from "lucide-react"
import { useId, type ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
  id?: string
}

export function SearchInput({ value, onChange, placeholder = "Search…", label = "Search", className, id }: SearchInputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className={cn("relative", className)}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input
        id={inputId}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-9 pl-9"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute top-1/2 right-2 -translate-y-1/2"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X />
        </Button>
      )}
    </div>
  )
}

export interface FilterOption {
  value: string
  label: string
  count?: number
}

interface FacetFilterProps {
  title: string
  options: FilterOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  className?: string
  /** Single-select behaves like a radio group. */
  single?: boolean
}

/** Multi-select popover filter (shadcn "faceted filter" pattern). */
export function FacetFilter({ title, options, selected, onChange, className, single }: FacetFilterProps) {
  const toggle = (value: string) => {
    if (single) {
      onChange(selected.includes(value) ? [] : [value])
      return
    }
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-between gap-2 border-dashed bg-card", className)}>
          <span>{title}</span>
          {selected.length > 0 && (
            <Badge variant="secondary" className="rounded-md px-1.5 tabular-nums">
              {selected.length}
            </Badge>
          )}
          <ChevronDown className="opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          {options.length > 7 && <CommandInput placeholder={`Filter ${title.toLowerCase()}…`} />}
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((o) => {
                const isSelected = selected.includes(o.value)
                return (
                  <CommandItem key={o.value} value={o.label} onSelect={() => toggle(o.value)} aria-selected={isSelected}>
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border border-input",
                        isSelected && "border-primary bg-primary text-primary-foreground",
                      )}
                      aria-hidden="true"
                    >
                      {isSelected && <Check className="size-3" />}
                    </span>
                    <span className="flex-1 truncate">{o.label}</span>
                    {o.count !== undefined && <span className="text-xs text-muted-foreground tabular-nums">{o.count}</span>}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selected.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => onChange([])} className="justify-center text-center">
                    Clear filter
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface FilterBarProps {
  children: ReactNode
  activeCount?: number
  onClear?: () => void
  className?: string
  resultsLabel?: ReactNode
}

/** Wrapping row of filters with a "Clear filters" action and result count. */
export function FilterBar({ children, activeCount = 0, onClear, className, resultsLabel }: FilterBarProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)} role="group" aria-label="Filters">
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {activeCount > 0 && onClear && (
          <Button variant="ghost" onClick={onClear} className="text-muted-foreground">
            <X /> Clear filters ({activeCount})
          </Button>
        )}
      </div>
      {resultsLabel && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {resultsLabel}
        </p>
      )}
    </div>
  )
}
