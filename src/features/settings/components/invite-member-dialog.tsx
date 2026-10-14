import { UserPlus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EntityFormDialog } from "@/components/shared/overlays"
import { useDemoStore } from "@/hooks/use-demo-store"
import { ROLE_LABELS } from "@/lib/constants"
import { createId, nowISO } from "@/lib/mock-storage"
import type { UserRole } from "@/types"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

interface InviteMemberDialogProps {
  roles: UserRole[]
  hospitalId?: string
  teamLabel: string
}

/** Creates a local "invited" user. No invitation email is sent. */
export function InviteMemberDialog({ roles, hospitalId, teamLabel }: InviteMemberDialogProps) {
  const { data, currentUser, create, logAudit } = useDemoStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<UserRole>(roles[0])
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})

  const resetForm = () => {
    setName("")
    setEmail("")
    setRole(roles[0])
    setErrors({})
  }

  const submit = () => {
    const next: typeof errors = {}
    if (name.trim().length < 2) next.name = "Enter the member's name"
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address"
    else if (data.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase()))
      next.email = "A user with this email already exists"
    setErrors(next)
    if (Object.keys(next).length) return false

    const user = create("users", {
      id: createId("u"),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      status: "invited",
      city: currentUser?.city ?? "",
      createdAt: nowISO(),
      hospitalId,
    })
    logAudit({
      action: "user.invited",
      entityType: "user",
      entityId: user.id,
      summary: `Invited ${user.name} as ${ROLE_LABELS[role]} to ${teamLabel} (demo)`,
    })
    toast.success(`Invited ${user.name}`, { description: "Demo only — no invitation email was sent." })
    resetForm()
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <UserPlus /> Invite member
      </Button>
      <EntityFormDialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (!o) resetForm()
        }}
        title="Invite team member"
        description={`Add someone to ${teamLabel}. They'll appear as "Invited" — no email is sent in the demo.`}
        submitLabel="Send invite"
        onSubmit={submit}
      >
        <div className="space-y-2">
          <Label htmlFor="invite-name">Full name</Label>
          <Input
            id="invite-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "invite-name-err" : undefined}
          />
          {errors.name && (
            <p id="invite-name-err" role="alert" className="text-xs font-medium text-destructive-text">
              {errors.name}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="invite-email">Work email</Label>
          <Input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "invite-email-err" : undefined}
          />
          {errors.email && (
            <p id="invite-email-err" role="alert" className="text-xs font-medium text-destructive-text">
              {errors.email}
            </p>
          )}
        </div>
        {roles.length > 1 && (
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </EntityFormDialog>
    </>
  )
}
