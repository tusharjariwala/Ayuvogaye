import { useId } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface SortSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  className?: string
}

export function SortSelect({ value, onChange, options, className }: SortSelectProps) {
  const id = useId()
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Label htmlFor={id} className="shrink-0 text-sm text-muted-foreground">
        Sort by
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full min-w-44 bg-card sm:w-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
