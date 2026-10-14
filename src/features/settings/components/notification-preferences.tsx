import { Info } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDemoStore } from "@/hooks/use-demo-store"
import { NOTIFICATION_TYPE_LABELS, NOTIFICATION_TYPES } from "@/lib/constants"
import type { NotificationType, User } from "@/types"

const CHANNELS = [
  { key: "inApp", label: "In-app" },
  { key: "email", label: "Email" },
] as const

/** Notification type × channel matrix bound to the user's stored preferences. */
export function NotificationPreferencesCard({ user }: { user: User }) {
  const { getNotificationPreferences, setNotificationPreferences } = useDemoStore()
  const prefs = getNotificationPreferences(user.id)

  const toggle = (channel: "inApp" | "email", type: NotificationType, value: boolean) => {
    setNotificationPreferences(user.id, { ...prefs, [channel]: { ...prefs[channel], [type]: value } })
    toast(`${NOTIFICATION_TYPE_LABELS[type]}: ${channel === "inApp" ? "in-app" : "email"} ${value ? "on" : "off"}`, {
      description: "Preference saved in this browser.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold">Notification preferences</h2>
        <CardDescription>Choose which updates you receive and where.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <caption className="sr-only">Notification preferences by type and channel</caption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Notification type</TableHead>
                {CHANNELS.map((c) => (
                  <TableHead key={c.key} scope="col" className="w-24 text-center">
                    {c.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {NOTIFICATION_TYPES.map((type) => (
                <TableRow key={type}>
                  <TableCell className="font-medium whitespace-normal">{NOTIFICATION_TYPE_LABELS[type]}</TableCell>
                  {CHANNELS.map((c) => (
                    <TableCell key={c.key} className="text-center">
                      <Switch
                        checked={prefs[c.key][type]}
                        onCheckedChange={(v) => toggle(c.key, type, v)}
                        aria-label={`${NOTIFICATION_TYPE_LABELS[type]} — ${c.label}`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Email is never sent in this demo. In-app notifications are generated locally in your browser.
        </p>
      </CardContent>
    </Card>
  )
}
