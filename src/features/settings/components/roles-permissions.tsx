import { Check, ShieldAlert, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ROLE_LABELS } from "@/lib/constants"
import type { UserRole } from "@/types"

const ROLES = Object.keys(ROLE_LABELS) as UserRole[]

const CAPABILITIES: { label: string; roles: UserRole[] }[] = [
  { label: "Search & view public profiles", roles: ["patient", "doctor", "hospital_admin", "staff", "platform_admin"] },
  { label: "Send appointment requests & enquiries", roles: ["patient"] },
  { label: "Write reviews", roles: ["patient"] },
  { label: "Respond to enquiries & appointments", roles: ["doctor", "hospital_admin", "staff"] },
  { label: "Edit doctor profile & availability", roles: ["doctor"] },
  { label: "Edit hospital profile", roles: ["hospital_admin"] },
  { label: "Manage hospital team", roles: ["hospital_admin"] },
  { label: "Respond to reviews", roles: ["doctor", "hospital_admin"] },
  { label: "Verify providers", roles: ["platform_admin"] },
  { label: "Moderate reviews & reports", roles: ["platform_admin"] },
  { label: "Manage platform settings", roles: ["platform_admin"] },
]

/** Read-only roles × capabilities matrix. */
export function RolesPermissions() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold">Roles & permissions</h2>
        <CardDescription>What each demo role can do in this template.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <caption className="sr-only">Capabilities by role</caption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="min-w-56">
                  Capability
                </TableHead>
                {ROLES.map((r) => (
                  <TableHead key={r} scope="col" className="text-center">
                    {ROLE_LABELS[r]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {CAPABILITIES.map((cap) => (
                <TableRow key={cap.label}>
                  <TableHead scope="row" className="font-medium whitespace-normal text-foreground">
                    {cap.label}
                  </TableHead>
                  {ROLES.map((r) => {
                    const allowed = cap.roles.includes(r)
                    return (
                      <TableCell key={r} className="text-center">
                        <span
                          className={
                            allowed
                              ? "inline-flex items-center gap-1 text-xs font-medium text-success-text"
                              : "inline-flex items-center gap-1 text-xs text-muted-foreground"
                          }
                        >
                          {allowed ? <Check className="size-4" aria-hidden="true" /> : <X className="size-4" aria-hidden="true" />}
                          {allowed ? "Yes" : "No"}
                        </span>
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Alert>
          <ShieldAlert aria-hidden="true" />
          <AlertTitle>Not enforced</AlertTitle>
          <AlertDescription>
            This matrix only describes the demo's navigation. Real permission enforcement requires authentication and
            authorisation on a backend.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
