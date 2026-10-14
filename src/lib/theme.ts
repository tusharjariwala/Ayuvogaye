import { createContext } from "react"

export type ThemePreference = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

export const THEME_STORAGE_KEY = "hd-theme"
export const DEFAULT_THEME: ThemePreference = "light"

export interface ThemeContextValue {
  /** The user's stored preference. */
  theme: ThemePreference
  /** The theme actually applied after resolving "system". */
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemePreference) => void
  resetTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system"
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function readStoredTheme(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isThemePreference(stored) ? stored : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function applyThemeClass(resolved: ResolvedTheme) {
  const root = document.documentElement
  root.classList.toggle("dark", resolved === "dark")
  root.style.colorScheme = resolved
}
