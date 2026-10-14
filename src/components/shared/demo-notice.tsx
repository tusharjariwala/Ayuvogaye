import { FlaskConical, X } from "lucide-react"
import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { DEMO_NOTICE } from "@/lib/constants"
import { readStorage, writeStorage } from "@/lib/mock-storage"
import { cn } from "@/lib/utils"

/** Slim site-wide banner reminding reviewers that everything is simulated. */
export function DemoBanner() {
  const [hidden, setHidden] = useState(() => readStorage("demo-banner-hidden", false))
  if (hidden) return null
  return (
    <div className="border-b border-warning/30 bg-warning-soft text-warning-text">
      <div className="container-page flex items-center gap-3 py-2 text-xs sm:text-sm">
        <FlaskConical className="size-4 shrink-0" aria-hidden="true" />
        <p className="flex-1">
          <strong className="font-semibold">Demo only.</strong> Static, fictional data. Requests and actions are
          simulated in your browser and never reach a real provider.
        </p>
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-warning-text hover:bg-warning/15"
          aria-label="Dismiss demo notice"
          onClick={() => {
            setHidden(true)
            writeStorage("demo-banner-hidden", true)
          }}
        >
          <X />
        </Button>
      </div>
    </div>
  )
}

/** Inline notice for forms and confirmation screens. */
export function DemoNotice({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <Alert className={cn("border-warning/30 bg-warning-soft text-warning-text", className)}>
      <FlaskConical aria-hidden="true" />
      <AlertTitle>Simulated action</AlertTitle>
      <AlertDescription className="text-warning-text/90">{children ?? DEMO_NOTICE}</AlertDescription>
    </Alert>
  )
}
