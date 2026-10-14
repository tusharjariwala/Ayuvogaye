import { CheckCircle2, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { StatusBadge } from "@/components/shared/status-badge"
import { VerificationBadge } from "@/components/shared/verification-badge"
import { THEME_OPTIONS } from "@/components/theme/theme-toggle"
import { useTheme } from "@/hooks/use-theme"
import { DEFAULT_THEME, type ThemePreference } from "@/lib/theme"
import { cn } from "@/lib/utils"
import { ThemeSwatch } from "./theme-swatch"

const DESCRIPTIONS: Record<ThemePreference, string> = {
  light: "Bright surfaces with high contrast text. The default.",
  dark: "Dimmed surfaces that are easier on the eyes at night.",
  system: "Follows your device setting and switches automatically.",
}

/** Theme picker (Light / Dark / System) with a live component preview. */
export function AppearanceSettings() {
  const { theme, resolvedTheme, setTheme, resetTheme } = useTheme()

  const choose = (value: string) => {
    const next = value as ThemePreference
    setTheme(next)
    toast.success(`Theme set to ${THEME_OPTIONS.find((o) => o.value === next)?.label ?? next}`)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Theme</h2>
          <CardDescription>
            Changes apply immediately. Your preference is stored in this browser only.
            {theme === "system" && (
              <>
                {" "}
                Your device is currently using the <strong className="text-foreground">{resolvedTheme}</strong> theme.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={theme} onValueChange={choose} aria-label="Colour theme" className="grid gap-3 sm:grid-cols-3">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
              const selected = theme === value
              return (
                <label
                  key={value}
                  htmlFor={`theme-${value}`}
                  className={cn(
                    "relative flex cursor-pointer flex-col gap-3 rounded-xl border bg-card p-3 transition-colors has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50",
                    selected ? "border-primary ring-1 ring-primary" : "hover:border-primary/40",
                  )}
                >
                  <ThemeSwatch theme={value} />
                  <span className="flex items-start gap-2">
                    <RadioGroupItem id={`theme-${value}`} value={value} className="mt-0.5" />
                    <span className="min-w-0 flex-1 space-y-0.5">
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        <Icon className="size-4" aria-hidden="true" /> {label}
                        {value === DEFAULT_THEME && (
                          <Badge variant="muted" className="ml-auto">
                            Default
                          </Badge>
                        )}
                      </span>
                      <span className="block text-xs text-muted-foreground">{DESCRIPTIONS[value]}</span>
                      {value === "system" && selected && (
                        <span className="block text-xs font-medium text-primary">Currently {resolvedTheme}</span>
                      )}
                    </span>
                  </span>
                  {selected && (
                    <CheckCircle2 className="absolute top-2 right-2 size-5 rounded-full bg-card text-primary" aria-hidden="true" />
                  )}
                </label>
              )
            })}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t">
          <p className="text-xs text-muted-foreground">
            Active: {THEME_OPTIONS.find((o) => o.value === theme)?.label}
            {theme === "system" ? ` (${resolvedTheme})` : ""}
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={theme === DEFAULT_THEME}
            onClick={() => {
              resetTheme()
              toast("Theme reset to default (Light)")
            }}
          >
            <RotateCcw /> Reset to default (Light)
          </Button>
        </CardFooter>
      </Card>

      <ThemePreview />
    </div>
  )
}

function ThemePreview() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold">Preview</h2>
        <CardDescription>Sample components rendered in the current theme.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Button size="sm">Primary</Button>
          <Button size="sm" variant="secondary">
            Secondary
          </Button>
          <Button size="sm" variant="outline">
            Outline
          </Button>
          <Button size="sm" variant="ghost">
            Ghost
          </Button>
          <Button size="sm" variant="highlight">
            Highlight
          </Button>
          <Button size="sm" variant="destructive">
            Destructive
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="danger">Danger</Badge>
          <StatusBadge kind="appointment" status="confirmed" />
          <VerificationBadge status="verified" withTooltip={false} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="preview-input">Sample input</Label>
            <Input id="preview-input" placeholder="Search hospitals…" />
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-soft">
            <p className="text-sm font-semibold">Sample card</p>
            <p className="mt-1 text-sm text-muted-foreground">Cards, borders and muted text adapt to the theme.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
