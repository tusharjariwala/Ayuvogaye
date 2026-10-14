import { LockKeyhole, UserCog } from "lucide-react"
import type { ReactNode } from "react"
import { Navigate, useLocation, useNavigate } from "react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { useDemoStore } from "@/hooks/use-demo-store"
import { ROLE_HOME, ROLE_LABELS } from "@/lib/constants"
import type { UserRole } from "@/types"

interface RequireRoleProps {
  roles?: UserRole[]
  children: ReactNode
}

/**
 * Client-side route guard used ONLY to demonstrate navigation between demo
 * roles. It provides no security — production apps must enforce
 * authentication and authorisation on a backend.
 */
export function RequireRole({ roles, children }: RequireRoleProps) {
  const { currentUser, signInAsRole } = useDemoStore()
  const location = useLocation()
  const navigate = useNavigate()

  if (!currentUser) {
    return <Navigate to={`/account/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />
  }

  if (roles && !roles.includes(currentUser.role)) {
    const target = roles[0]
    return (
      <div className="flex min-h-[70svh] items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="items-center">
            <span className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
              <LockKeyhole className="size-6 text-muted-foreground" aria-hidden="true" />
            </span>
            <h1 className="text-lg font-semibold">This area is for {roles.map((r) => ROLE_LABELS[r]).join(" or ")} accounts</h1>
            <CardDescription>
              You're signed in as <strong>{currentUser.name}</strong> ({ROLE_LABELS[currentUser.role]}). Switch to a demo
              account with the right role to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              onClick={() => {
                const user = signInAsRole(target)
                if (user) toast.success(`Switched to ${user.name}`, { description: `Demo role: ${ROLE_LABELS[target]}` })
              }}
            >
              <UserCog /> Switch to {ROLE_LABELS[target]}
            </Button>
            <Button variant="outline" onClick={() => navigate(ROLE_HOME[currentUser.role])}>
              Go to my area
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
