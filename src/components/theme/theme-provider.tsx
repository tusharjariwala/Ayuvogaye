import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  ThemeContext,
  applyThemeClass,
  getSystemTheme,
  readStoredTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme"

/**
 * Light / Dark / System theme provider.
 * - First-time visitors get Light.
 * - Explicit choices persist in localStorage; "system" follows the OS live.
 * - index.html runs a tiny inline script that applies the class before paint.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(() => readStoredTheme())
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme())

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? "dark" : "light")
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme

  useEffect(() => {
    applyThemeClass(resolvedTheme)
  }, [resolvedTheme])

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      /* storage unavailable — keep in-memory preference */
    }
  }, [])

  const resetTheme = useCallback(() => {
    setThemeState(DEFAULT_THEME)
    try {
      window.localStorage.removeItem(THEME_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, resetTheme }),
    [theme, resolvedTheme, setTheme, resetTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
