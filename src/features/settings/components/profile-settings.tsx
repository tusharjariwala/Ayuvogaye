import { ArrowRight } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { DetailList } from "@/components/shared/overlays"
import { StatusBadge } from "@/components/shared/status-badge"
import { PersonAvatar } from "@/components/shared/visuals"
import { ProfileForm } from "@/features/account/components/profile-form"
import { ROLE_LABELS } from "@/lib/constants"
import { formatDate } from "@/lib/formatters"
import type { User } from "@/types"

export function ProfileSettings({ user, variant }: { user: User; variant: "patient" | "hospital" | "doctor" | "admin" }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
      <Card className="self-start">
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <PersonAvatar name={user.name} className="size-12" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{user.name}</p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <DetailList
            items={[
              { label: "Role", value: ROLE_LABELS[user.role] },
              { label: "Status", value: <StatusBadge status={user.status} /> },
              { label: "City", value: user.city },
              { label: "Member since", value: formatDate(user.createdAt) },
            ]}
          />
          {variant === "patient" && (
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/account/profile">
                Open full profile <ArrowRight />
              </Link>
            </Button>
          )}
          {variant === "doctor" && (
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/provider/doctor/profile">
                Edit public doctor profile <ArrowRight />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Your details</h2>
          <CardDescription>Email and role are managed by the platform and can't be changed here.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>
    </div>
  )
}
