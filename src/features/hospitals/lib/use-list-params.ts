import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router"

type ParamValue = string | string[] | number | null | undefined

/** Reads a comma-separated list param. */
export function parseList(params: URLSearchParams, key: string): string[] {
  return (params.get(key) ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
}

/**
 * Small helper around `useSearchParams` for directory pages: reads params and
 * writes several keys at once (resetting the page whenever a filter changes).
 */
export function useListParams() {
  const [params, setParams] = useSearchParams()

  const get = useCallback((key: string, fallback = "") => params.get(key) ?? fallback, [params])

  const set = useCallback(
    (updates: Record<string, ParamValue>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(updates)) {
            const str = Array.isArray(value) ? value.join(",") : value === null || value === undefined ? "" : String(value)
            if (str) next.set(key, str)
            else next.delete(key)
          }
          if (!("page" in updates)) next.delete("page")
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const clear = useCallback(
    (keep: string[] = []) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams()
          keep.forEach((k) => {
            const v = prev.get(k)
            if (v) next.set(k, v)
          })
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const page = useMemo(() => Math.max(1, Number(params.get("page")) || 1), [params])

  return { params, get, set, clear, page }
}
