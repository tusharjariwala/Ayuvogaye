/**
 * Safe localStorage helpers for demo persistence.
 * Every access is wrapped so private windows or blocked storage never break the UI.
 */
export const STORAGE_PREFIX = "hd-demo"

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}:${key}`)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}:${key}`, JSON.stringify(value))
  } catch {
    /* quota exceeded or storage disabled — the demo continues in memory */
  }
}

export function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(`${STORAGE_PREFIX}:${key}`)
  } catch {
    /* ignore */
  }
}

export function clearDemoStorage(): void {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(`${STORAGE_PREFIX}:`))
      .forEach((k) => window.localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
}

let counter = 0
/** Generates a reasonably unique local id, e.g. `apt-mgk2x91`. */
export function createId(prefix: string): string {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}${counter.toString(36)}`
}

export function nowISO(): string {
  return new Date().toISOString()
}
