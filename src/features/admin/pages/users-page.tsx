import type { ColumnDef } from "@tanstack/react-table"
import { Ban, Mail, ShieldCheck, Stethoscope, Trash2, UserCheck, UserCog, UserPlus, Users } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, DataTableColumnHeader, selectColumn } from "@/components/data-table"
import { Field } from "@/components/forms/form-field"
import { ConfirmDialog, EntityFormDialog } from "@/components/shared/overlays"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { PersonAvatar } from "@/components/shared/visuals"
import { useDemoStore } from "@/hooks/use-demo-store"
import { ROLE_LABELS } from "@/lib/constants"
import { formatDate, formatRelative } from "@/lib/formatters"
import { createId, nowISO } from "@/lib/mock-storage"
import type { AccountStatus, User, UserRole } from "@/types"
import { FieldError, RowActions, StatGrid } from "../components/admin-ui"

const ROLES = Object.keys(ROLE_LABELS) as UserRole[]
const STATUS_LABELS: Record<AccountStatus, string> = { active: "Active", suspended: "Suspended", invited: "Invited" }

interface InviteDraft {
  name: string
  email: string
  role: UserRole
  city: string
}

export default function UsersPage() {
  const { data, currentUser, create, update, remove, logAudit, notify } = useDemoStore()
  const users = data.users
  const [inviteOpen, setInviteOpen] = useState(false)
  const [invite, setInvite] = useState<InviteDraft>({ name: "", email: "", role: "patient", city: "" })
  const [inviteErrors, setInviteErrors] = useState<Partial<Record<keyof InviteDraft, string>>>({})
  const [roleTarget, setRoleTarget] = useState<User | null>(null)
  const [nextRole, setNextRole] = useState<UserRole>("patient")
  const [statusChange, setStatusChange] = useState<{ users: User[]; status: "active" | "suspended"; onDone?: () => void } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  const isSelf = (u: User) => u.id === currentUser?.id

  const applyStatus = (targets: User[], status: "active" | "suspended") => {
    const eligible = targets.filter((u) => !isSelf(u) && u.status !== status)
    if (targets.some(isSelf)) toast.error("You can't suspend your own admin account.")
    if (eligible.length === 0) return
    eligible.forEach((u) => {
      update("users", u.id, { status })
      logAudit({
        action: status === "suspended" ? "user.suspended" : "user.reactivated",
        entityType: "user",
        entityId: u.id,
        summary: `${u.name} (${ROLE_LABELS[u.role]}) ${status === "suspended" ? "suspended" : "reactivated"}.`,
      })
    })
    toast.success(eligible.length === 1 ? `${eligible[0].name} ${status === "suspended" ? "suspended" : "reactivated"}` : `${eligible.length} accounts updated`, {
      description: "Demo action — no email is sent to the user.",
    })
  }

  const columns = useMemo<ColumnDef<User, unknown>[]>(
    () => [
      selectColumn<User>(),
      {
        accessorKey: "name",
        meta: { label: "Name" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
        cell: ({ row }) => (
          <div className="flex min-w-48 items-center gap-3">
            <PersonAvatar name={row.original.name} className="size-8" />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 font-medium">
                {row.original.name}
                {isSelf(row.original) && <Badge variant="info">You</Badge>}
              </p>
              <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "role",
        meta: { label: "Role" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
        cell: ({ row }) => <Badge variant="outline">{ROLE_LABELS[row.original.role]}</Badge>,
      },
      {
        accessorKey: "status",
        meta: { label: "Status" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      { accessorKey: "city", meta: { label: "City" }, header: ({ column }) => <DataTableColumnHeader column={column} title="City" /> },
      {
        accessorKey: "createdAt",
        meta: { label: "Created" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.createdAt)}</span>,
      },
      {
        id: "lastActiveAt",
        accessorFn: (u) => u.lastActiveAt ?? "",
        meta: { label: "Last active" },
        header: ({ column }) => <DataTableColumnHeader column={column} title="Last active" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">{row.original.lastActiveAt ? formatRelative(row.original.lastActiveAt) : "Never"}</span>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const u = row.original
          const self = isSelf(u)
          return (
            <RowActions
              label={u.name}
              actions={[
                {
                  label: "Change role",
                  icon: UserCog,
                  disabled: self,
                  onSelect: () => {
                    setNextRole(u.role)
                    setRoleTarget(u)
                  },
                },
                u.status === "suspended"
                  ? { label: "Reactivate", icon: UserCheck, onSelect: () => setStatusChange({ users: [u], status: "active" }) }
                  : { label: "Suspend", icon: Ban, disabled: self, onSelect: () => setStatusChange({ users: [u], status: "suspended" }) },
                { label: "Delete", icon: Trash2, destructive: true, disabled: self, separator: true, onSelect: () => setDeleteTarget(u) },
              ]}
            />
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser?.id],
  )

  const providers = users.filter((u) => u.role === "doctor" || u.role === "hospital_admin" || u.role === "staff").length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage demo accounts, roles and access. Invitations and role changes are simulated — no emails are sent."
        actions={
          <Button
            onClick={() => {
              setInvite({ name: "", email: "", role: "patient", city: data.cities[0]?.name ?? "" })
              setInviteErrors({})
              setInviteOpen(true)
            }}
          >
            <UserPlus /> Invite user
          </Button>
        }
      />

      <StatGrid>
        <StatCard label="Total users" value={users.length} icon={Users} hint={`${users.filter((u) => u.status === "active").length} active`} />
        <StatCard label="Patients" value={users.filter((u) => u.role === "patient").length} icon={Users} />
        <StatCard label="Provider accounts" value={providers} icon={Stethoscope} hint="Doctors, hospital admins & staff" />
        <StatCard
          label="Suspended / invited"
          value={`${users.filter((u) => u.status === "suspended").length} / ${users.filter((u) => u.status === "invited").length}`}
          icon={ShieldCheck}
        />
      </StatGrid>

      <DataTable
        columns={columns}
        data={users}
        getRowId={(u) => u.id}
        getSearchText={(u) => `${u.name} ${u.email} ${u.city} ${ROLE_LABELS[u.role]}`}
        searchPlaceholder="Search by name, email or city…"
        filters={[
          { columnId: "role", title: "Role", options: ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r], count: users.filter((u) => u.role === r).length })) },
          {
            columnId: "status",
            title: "Status",
            options: (Object.keys(STATUS_LABELS) as AccountStatus[]).map((s) => ({ value: s, label: STATUS_LABELS[s], count: users.filter((u) => u.status === s).length })),
          },
        ]}
        initialSorting={[{ id: "createdAt", desc: true }]}
        exportFilename="users"
        exportColumns={[
          { header: "ID", value: (u) => u.id },
          { header: "Name", value: (u) => u.name },
          { header: "Email", value: (u) => u.email },
          { header: "Role", value: (u) => ROLE_LABELS[u.role] },
          { header: "Status", value: (u) => STATUS_LABELS[u.status] },
          { header: "City", value: (u) => u.city },
          { header: "Created", value: (u) => formatDate(u.createdAt) },
          { header: "Last active", value: (u) => formatDate(u.lastActiveAt) },
        ]}
        bulkActions={(rows, clear) => (
          <>
            <Button size="sm" variant="outline" disabled={!rows.some((u) => u.status === "suspended")} onClick={() => setStatusChange({ users: rows, status: "active", onDone: clear })}>
              <UserCheck /> Reactivate
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={!rows.some((u) => u.status !== "suspended" && !isSelf(u))}
              onClick={() => setStatusChange({ users: rows, status: "suspended", onDone: clear })}
            >
              <Ban /> Suspend
            </Button>
          </>
        )}
        emptyTitle="No users found"
        caption="Users"
      />

      <EntityFormDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        title="Invite user"
        description="Creates an account in the Invited state. In this demo no invitation email is sent."
        submitLabel="Send invite (demo)"
        onSubmit={() => {
          const errors: typeof inviteErrors = {}
          if (invite.name.trim().length < 2) errors.name = "Enter the person's name."
          if (!/^\S+@\S+\.\S+$/.test(invite.email.trim())) errors.email = "Enter a valid email address."
          else if (users.some((u) => u.email.toLowerCase() === invite.email.trim().toLowerCase())) errors.email = "A user with this email already exists."
          setInviteErrors(errors)
          if (Object.keys(errors).length) return false
          const user: User = {
            id: createId("u"),
            name: invite.name.trim(),
            email: invite.email.trim(),
            role: invite.role,
            status: "invited",
            city: invite.city,
            createdAt: nowISO(),
          }
          create("users", user)
          logAudit({ action: "user.invited", entityType: "user", entityId: user.id, summary: `${user.name} invited as ${ROLE_LABELS[user.role]}.` })
          toast.success(`Invitation created for ${user.name}`, { description: "Demo only — no email was sent." })
        }}
      >
        <Field label="Full name" htmlFor="invite-name">
          <Input id="invite-name" value={invite.name} aria-invalid={!!inviteErrors.name} onChange={(e) => setInvite((d) => ({ ...d, name: e.target.value }))} />
          {inviteErrors.name && <FieldError>{inviteErrors.name}</FieldError>}
        </Field>
        <Field label="Email" htmlFor="invite-email">
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="invite-email"
              type="email"
              className="pl-9"
              value={invite.email}
              aria-invalid={!!inviteErrors.email}
              onChange={(e) => setInvite((d) => ({ ...d, email: e.target.value }))}
              placeholder="name@example.com"
            />
          </div>
          {inviteErrors.email && <FieldError>{inviteErrors.email}</FieldError>}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Role" htmlFor="invite-role">
            <Select value={invite.role} onValueChange={(v) => setInvite((d) => ({ ...d, role: v as UserRole }))}>
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="City" htmlFor="invite-city">
            <Select value={invite.city} onValueChange={(v) => setInvite((d) => ({ ...d, city: v }))}>
              <SelectTrigger id="invite-city" className="w-full">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {data.cities.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </EntityFormDialog>

      <EntityFormDialog
        open={!!roleTarget}
        onOpenChange={(o) => !o && setRoleTarget(null)}
        title={`Change role · ${roleTarget?.name ?? ""}`}
        description="Role changes alter which portal the account can open. Provider links (hospital/doctor) are not changed."
        submitLabel="Update role"
        onSubmit={() => {
          if (!roleTarget) return
          if (isSelf(roleTarget)) {
            toast.error("You can't change your own role.")
            return false
          }
          if (nextRole === roleTarget.role) return
          update("users", roleTarget.id, { role: nextRole })
          logAudit({
            action: "user.role_changed",
            entityType: "user",
            entityId: roleTarget.id,
            summary: `${roleTarget.name}: ${ROLE_LABELS[roleTarget.role]} → ${ROLE_LABELS[nextRole]}.`,
          })
          notify({
            type: "profile_approval",
            title: "Your account role changed",
            message: `An admin changed your role to ${ROLE_LABELS[nextRole]}. (Simulated notification.)`,
            audience: nextRole,
            userId: roleTarget.id,
          })
          toast.success(`${roleTarget.name} is now ${ROLE_LABELS[nextRole]}`, { description: "Demo action — stored locally." })
          setRoleTarget(null)
        }}
      >
        <Field label="New role" htmlFor="role-select">
          <Select value={nextRole} onValueChange={(v) => setNextRole(v as UserRole)}>
            <SelectTrigger id="role-select" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </EntityFormDialog>

      <ConfirmDialog
        open={!!statusChange}
        onOpenChange={(o) => !o && setStatusChange(null)}
        title={
          statusChange
            ? `${statusChange.status === "suspended" ? "Suspend" : "Reactivate"} ${statusChange.users.length === 1 ? statusChange.users[0].name : `${statusChange.users.length} accounts`}?`
            : ""
        }
        description={
          statusChange?.status === "suspended"
            ? `Suspended users can't sign in to the demo.${statusChange.users.some(isSelf) ? " Your own account will be skipped." : ""}`
            : "The account(s) can sign in again."
        }
        confirmLabel={statusChange?.status === "suspended" ? "Suspend" : "Reactivate"}
        destructive={statusChange?.status === "suspended"}
        onConfirm={() => {
          if (statusChange) {
            applyStatus(statusChange.users, statusChange.status)
            statusChange.onDone?.()
          }
          setStatusChange(null)
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.name ?? "user"}?`}
        description={`The account is removed from local demo data${deleteTarget?.hospitalId || deleteTarget?.doctorId ? "; the linked provider listing stays in place" : ""}. “Reset demo data” restores it.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleteTarget && !isSelf(deleteTarget)) {
            remove("users", deleteTarget.id)
            logAudit({ action: "user.deleted", entityType: "user", entityId: deleteTarget.id, summary: `${deleteTarget.name} account deleted.` })
            toast.success(`${deleteTarget.name} deleted`, { description: "Removed from local demo data." })
          }
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
