import { LayoutDashboard, LogIn, LogOut, RotateCcw, Settings, UserCog } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/shared/overlays"
import { ROLE_SETTINGS } from "@/app/navigation"
import { useDemoStore } from "@/hooks/use-demo-store"
import { ROLE_HOME, ROLE_LABELS } from "@/lib/constants"
import { initials } from "@/lib/formatters"
import type { UserRole } from "@/types"

const ROLES = Object.keys(ROLE_LABELS) as UserRole[]

/** Avatar menu with the demo role switcher and "Reset demo data". */
export function UserMenu() {
  const { currentUser, signInAsRole, signOut, resetDemoData } = useDemoStore()
  const navigate = useNavigate()
  const [confirmReset, setConfirmReset] = useState(false)

  const switchRole = (role: UserRole) => {
    const user = signInAsRole(role)
    if (user) {
      toast.success(`Signed in as ${user.name}`, { description: `Demo role: ${ROLE_LABELS[role]}` })
      navigate(ROLE_HOME[role])
    }
  }

  if (!currentUser) {
    return (
      <Button asChild variant="outline">
        <Link to="/account/login">
          <LogIn /> <span className="hidden sm:inline">Sign in</span>
        </Link>
      </Button>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 gap-2 px-1.5" aria-label={`Account menu for ${currentUser.name}`}>
            <Avatar className="size-7">
              <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">{initials(currentUser.name)}</AvatarFallback>
            </Avatar>
            <span className="hidden max-w-32 truncate text-sm font-medium lg:inline">{currentUser.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="font-normal">
            <p className="truncate font-medium">{currentUser.name}</p>
            <p className="truncate text-xs text-muted-foreground">{currentUser.email}</p>
            <p className="mt-1 text-xs text-primary">{ROLE_LABELS[currentUser.role]} · demo account</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to={ROLE_HOME[currentUser.role]}>
                <LayoutDashboard /> {currentUser.role === "patient" ? "My account" : "Dashboard"}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={ROLE_SETTINGS[currentUser.role]}>
                <Settings /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <UserCog /> Switch demo role
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuRadioGroup value={currentUser.role} onValueChange={(v) => switchRole(v as UserRole)}>
                  {ROLES.map((r) => (
                    <DropdownMenuRadioItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setConfirmReset(true)}>
            <RotateCcw /> Reset demo data
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              signOut()
              toast("Signed out of the demo")
              navigate("/")
            }}
          >
            <LogOut /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reset all demo data?"
        description="This restores every sample hospital, doctor, request, review and log to its original state and clears your local changes. Your theme preference is kept."
        confirmLabel="Reset data"
        destructive
        onConfirm={() => {
          resetDemoData()
          toast.success("Demo data reset", { description: "All sample records were restored." })
        }}
      />
    </>
  )
}
