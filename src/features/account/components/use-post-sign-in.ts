import { useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { ROLE_HOME } from "@/lib/constants"
import type { UserRole } from "@/types"

/** Only same-origin relative paths are accepted as redirect targets. */
function safeRedirect(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null
  return value
}

/** Navigates to `?redirect=` when present, otherwise to the role's home. */
export function usePostSignIn() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = safeRedirect(params.get("redirect"))
  const go = useCallback(
    (role: UserRole) => {
      void navigate(redirect ?? ROLE_HOME[role], { replace: true })
    },
    [navigate, redirect],
  )
  return { redirect, go }
}
