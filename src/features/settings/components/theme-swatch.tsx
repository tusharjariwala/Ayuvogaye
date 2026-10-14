import { cn } from "@/lib/utils"

/**
 * Miniature UI mock drawn entirely with theme tokens. The dark variant is
 * scoped with the `.dark` class so it always shows dark tokens; the light
 * variant uses a `.light` scope (see report: needs a matching token scope in
 * globals.css to stay light while the app itself is dark).
 */
function MiniUi({ scope }: { scope: "light" | "dark" }) {
  return (
    <div className={cn(scope, "h-full bg-background p-2 text-foreground")}>
      <div className="flex h-full flex-col gap-1.5 rounded-md border border-border bg-card p-2">
        <div className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-primary" />
          <span className="h-1.5 w-10 rounded-full bg-foreground/70" />
        </div>
        <span className="h-1.5 w-16 rounded-full bg-muted-foreground/50" />
        <span className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
        <div className="mt-auto flex gap-1">
          <span className="h-3 w-8 rounded bg-primary" />
          <span className="h-3 w-6 rounded border border-border bg-muted" />
        </div>
      </div>
    </div>
  )
}

export function ThemeSwatch({ theme, className }: { theme: "light" | "dark" | "system"; className?: string }) {
  return (
    <div className={cn("relative h-24 overflow-hidden rounded-lg border", className)} aria-hidden="true">
      {theme === "system" ? (
        <div className="grid h-full grid-cols-2">
          <MiniUi scope="light" />
          <MiniUi scope="dark" />
        </div>
      ) : (
        <MiniUi scope={theme} />
      )}
    </div>
  )
}
