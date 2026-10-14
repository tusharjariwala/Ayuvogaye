import type { ColumnDef } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { ConfirmDialog } from "@/components/shared/overlays"
import { StatusBadge } from "@/components/shared/status-badge"
import { PersonAvatar } from "@/components/shared/visuals"
import { getManagedHospital } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { ROLE_LABELS } from "@/lib/constants"
import { formatRelative } from "@/lib/formatters"
import type { User, UserRole } from "@/types"
import { InviteMemberDialog } from "./invite-member-dialog"

const HOSPITAL_ROLES: UserRole[] = ["staff", "hospital_admin"]

/** Team list for a hospital (same hospitalId) or the platform (platform admins). */
export function TeamMembers({ variant }: { variant: "hospital" | "admin" }) {
  const { data, currentUser, update, remove, logAudit } = useDemoStore()
  const [removing, setRemoving] = useState<User | null>(null)

  const hospital = variant === "hospital" ? getManagedHospital(data, currentUser) : undefined
  const teamLabel = variant === "hospital" ? (hospital?.name ?? "your hospital") : "the platform team"
  const canManage = variant === "admin" ? currentUser?.role === "platform_admin" : currentUser?.role === "hospital_admin"

  const members = useMemo(
    () =>
      variant === "hospital"
        ? data.users.filter((u) => !!currentUser?.hospitalId && u.hospitalId === currentUser.hospitalId)
        : data.users.filter((u) => u.role === "platform_admin"),
    [data.users, currentUser, variant],
  )

  const columns = useMemo<ColumnDef<User, unknown>[]>(() => {
    const changeRole = (user: User, role: UserRole) => {
      update("users", user.id, { role })
      logAudit({
        action: "user.role_changed",
        entityType: "user",
        entityId: user.id,
        summary: `Changed ${user.name}'s role to ${ROLE_LABELS[role]} (demo)`,
      })
      toast.success(`${user.name} is now ${ROLE_LABELS[role]}`, { description: "Demo only — permissions aren't enforced." })
    }

    return [
      {
        accessorKey: "name",
        meta: { label: "Member" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Member" />,
        cell: ({ row }) => (
          <div className="flex min-w-48 items-center gap-3">
            <PersonAvatar name={row.original.name} className="size-8" />
            <div className="min-w-0">
              <p className="truncate font-medium">
                {row.original.name}
                {row.original.id === currentUser?.id && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}
              </p>
              <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "role",
        meta: { label: "Role" },
        header: "Role",
        cell: ({ row }) => {
          const u = row.original
          if (variant !== "hospital" || !canManage || u.id === currentUser?.id) return ROLE_LABELS[u.role]
          return (
            <Select value={u.role} onValueChange={(v) => changeRole(u, v as UserRole)}>
              <SelectTrigger size="sm" className="w-40" aria-label={`Role for ${u.name}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOSPITAL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        },
      },
      {
        accessorKey: "status",
        meta: { label: "Status" },
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "lastActiveAt",
        meta: { label: "Last active" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Last active" />,
        cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{formatRelative(row.original.lastActiveAt)}</span>,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        enableHiding: false,
        cell: ({ row }) =>
          canManage && row.original.id !== currentUser?.id ? (
            <Button variant="ghost" size="icon-sm" aria-label={`Remove ${row.original.name}`} onClick={() => setRemoving(row.original)}>
              <Trash2 />
            </Button>
          ) : null,
      },
    ]
  }, [canManage, currentUser?.id, logAudit, update, variant])

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold">Team members</h2>
        <CardDescription>
          {variant === "hospital" ? `People who can manage ${teamLabel}.` : "Platform administrators with moderation access."}
          {!canManage && " Only admins can invite or change members."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={members}
          getRowId={(u) => u.id}
          getSearchText={(u) => `${u.name} ${u.email} ${ROLE_LABELS[u.role]}`}
          searchPlaceholder="Search members…"
          toolbarActions={
            canManage ? (
              <InviteMemberDialog
                roles={variant === "hospital" ? HOSPITAL_ROLES : ["platform_admin"]}
                hospitalId={variant === "hospital" ? currentUser?.hospitalId : undefined}
                teamLabel={teamLabel}
              />
            ) : undefined
          }
          emptyTitle="No team members"
          emptyDescription="Invite colleagues to help manage requests."
          caption="Team members"
        />
      </CardContent>
      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        title={`Remove ${removing?.name ?? "member"}?`}
        description="They'll lose access to this workspace. This only changes local demo data."
        confirmLabel="Remove member"
        destructive
        onConfirm={() => {
          if (!removing) return
          remove("users", removing.id)
          logAudit({
            action: "user.removed",
            entityType: "user",
            entityId: removing.id,
            summary: `Removed ${removing.name} from ${teamLabel} (demo)`,
          })
          toast.success(`Removed ${removing.name}`, { description: "Demo only — stored in this browser." })
          setRemoving(null)
        }}
      />
    </Card>
  )
}
