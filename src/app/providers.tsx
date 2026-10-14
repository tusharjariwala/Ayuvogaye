import type { ReactNode } from "react"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { DemoStoreProvider } from "./demo-store-provider"

/** Global providers. Theme sits at the top so it never resets route or data state. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <DemoStoreProvider>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster position="top-right" richColors={false} closeButton />
        </TooltipProvider>
      </DemoStoreProvider>
    </ThemeProvider>
  )
}
