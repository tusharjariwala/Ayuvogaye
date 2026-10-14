import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { ConfirmDialog, DetailList } from "@/components/shared/overlays"
import { StatusBadge } from "@/components/shared/status-badge"
import { useDemoStore } from "@/hooks/use-demo-store"
import { ROLE_LABELS } from "@/lib/constants"
import { formatDate, formatRelative } from "@/lib/formatters"
import { AccountShell } from "../components/account-shell"
import { ProfileForm } from "../components/profile-form"

export default function ProfilePage() {
  const { currentUser } = useDemoStore()
  if (!currentUser) return null

  return (
    <AccountShell title="Profile" description="Your personal details used to pre-fill requests. Stored only in this browser.">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold">Personal details</h2>
            <CardDescription>Update how you appear on requests and reviews.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={currentUser} />
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader>
            <h2 className="text-base font-semibold">Account</h2>
            <CardDescription>These details can't be changed in the demo.</CardDescription>
          </CardHeader>
          <CardContent>
            <DetailList
              items={[
                { label: "Email", value: <span className="break-all">{currentUser.email}</span> },
                { label: "Role", value: <Badge variant="secondary">{ROLE_LABELS[currentUser.role]}</Badge> },
                { label: "Status", value: <StatusBadge status={currentUser.status} /> },
                { label: "Member since", value: formatDate(currentUser.createdAt) },
                { label: "Last active", value: currentUser.lastActiveAt ? formatRelative(currentUser.lastActiveAt) : "—" },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="border-destructive/30">
        <CardHeader>
          <h2 className="text-base font-semibold">Delete account</h2>
          <CardDescription>
            In a real product this would permanently remove your account and request history after confirmation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConfirmDialog
            title="Delete your account?"
            description="This is a demo — sample accounts can't be deleted. In production, deletion would be handled securely on the server."
            confirmLabel="Delete account"
            destructive
            onConfirm={() => toast.info("Demo only", { description: "Account deletion is not available in this demo. Nothing was deleted." })}
            trigger={
              <Button variant="destructive">
                <Trash2 /> Delete account
              </Button>
            }
          />
        </CardContent>
      </Card>
    </AccountShell>
  )
}
