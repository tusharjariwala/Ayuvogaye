import { useCallback } from "react"
import { useDemoStore } from "@/hooks/use-demo-store"
import type { NotificationType, ProviderType } from "@/types"
import { findProviderUser, providerPortalLink } from "../lib/admin-helpers"

/**
 * Sends a local in-app notification to the user account linked to a provider
 * (hospital admin or doctor). Skips silently when no account is linked so we
 * never broadcast a provider-specific message to every user of that role.
 */
export function useProviderNotify() {
  const { data, notify } = useDemoStore()
  return useCallback(
    (type: ProviderType, id: string, n: { type: NotificationType; title: string; message: string; link?: string }) => {
      const user = findProviderUser(data, type, id)
      if (!user) return false
      notify({
        type: n.type,
        title: n.title,
        message: `${n.message} (Simulated notification.)`,
        audience: user.role,
        userId: user.id,
        link: n.link ?? providerPortalLink(type),
      })
      return true
    },
    [data, notify],
  )
}
