import { Network, Plus, X } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/states"
import { SourceBadge } from "@/components/shared/trust-badges"
import { getSpecialty } from "@/data/selectors"
import type { Hospital } from "@/types"
import { MissingProviderState, PendingChangesNotice, ReadOnlyNotice, UnsavedChangesBar } from "../components/portal-widgets"
import { isSameSet, joinList } from "../lib/provider-workflow"
import { useManagedHospital } from "../use-managed-hospital"

function DepartmentsEditor({ hospital }: { hospital: Hospital }) {
  const { data, canEdit, pendingChanges, saveHospital } = useManagedHospital()
  const [ids, setIds] = useState<string[]>(hospital.departmentIds)
  const [open, setOpen] = useState(false)
  const dirty = !isSameSet(ids, hospital.departmentIds)

  const current = ids.map((id) => data.departments.find((d) => d.id === id)).filter((d) => d !== undefined)
  const available = data.departments.filter((d) => !ids.includes(d.id))
  const groups = Array.from(new Set(available.map((d) => d.specialtyId)))

  const save = () => {
    const added = ids.filter((id) => !hospital.departmentIds.includes(id))
    const removed = hospital.departmentIds.filter((id) => !ids.includes(id))
    const name = (id: string) => data.departments.find((d) => d.id === id)?.name ?? id
    const parts = [added.length ? `added ${joinList(added.map(name))}` : "", removed.length ? `removed ${joinList(removed.map(name))}` : ""].filter(Boolean)
    // New departments bring their specialty with them; existing specialties are kept.
    const specialtyIds = Array.from(new Set([...hospital.specialtyIds, ...added.map((id) => data.departments.find((d) => d.id === id)?.specialtyId).filter((s) => s !== undefined)]))
    const summary = `Departments: ${parts.join("; ")}`
    saveHospital(
      { departmentIds: ids, specialtyIds },
      {
        fields: specialtyIds.length !== hospital.specialtyIds.length ? ["departmentIds", "specialtyIds"] : ["departmentIds"],
        summary: summary.charAt(0).toUpperCase() + summary.slice(1),
        action: "hospital.departments_updated",
        invalidateGroups: added.length ? ["departments"] : [],
        toastTitle: "Departments saved",
      },
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Departments listed on your profile. Adding a department also lists its specialty so patients can find you."
        actions={
          canEdit && (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button disabled={available.length === 0}>
                  <Plus /> Add department
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[min(22rem,calc(100vw-2rem))] p-0" align="end">
                <Command>
                  <CommandInput placeholder="Search departments…" aria-label="Search departments" />
                  <CommandList>
                    <CommandEmpty>No matching departments.</CommandEmpty>
                    {groups.map((sid) => (
                      <CommandGroup key={sid} heading={getSpecialty(data, sid)?.name ?? "Other"}>
                        {available
                          .filter((d) => d.specialtyId === sid)
                          .map((d) => (
                            <CommandItem
                              key={d.id}
                              value={`${d.name} ${getSpecialty(data, sid)?.name ?? ""}`}
                              onSelect={() => {
                                setIds((prev) => [...prev, d.id])
                                setOpen(false)
                              }}
                            >
                              {d.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )
        }
      />
      {!canEdit && <ReadOnlyNotice />}
      <PendingChangesNotice requests={pendingChanges.filter((c) => c.fields.includes("departmentIds"))} verified={hospital.verification.status === "verified"} />

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Listed departments ({current.length})</h2>
          </CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-2">
            Source: <SourceBadge source={hospital.verifiedFields.includes("departments") ? "platform_verified" : "provider_submitted"} />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {current.length === 0 ? (
            <EmptyState icon={Network} title="No departments listed" description="Add the departments your hospital runs." />
          ) : (
            <ul className="divide-y">
              {current.map((d) => {
                const isNew = !hospital.departmentIds.includes(d.id)
                return (
                  <li key={d.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="flex flex-wrap items-center gap-2 font-medium">
                        {d.name}
                        <Badge variant="secondary">{getSpecialty(data, d.specialtyId)?.name ?? "—"}</Badge>
                        {isNew && <Badge variant="info">Unsaved</Badge>}
                      </p>
                      <p className="text-sm text-muted-foreground">{d.description}</p>
                    </div>
                    {canEdit && (
                      <Button variant="ghost" size="icon-sm" aria-label={`Remove ${d.name}`} onClick={() => setIds((prev) => prev.filter((x) => x !== d.id))}>
                        <X />
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <UnsavedChangesBar dirty={dirty} onSave={save} onDiscard={() => setIds(hospital.departmentIds)} />
    </div>
  )
}

export default function DepartmentsPage() {
  const { hospital } = useManagedHospital()
  if (!hospital) return <MissingProviderState kind="hospital" />
  return <DepartmentsEditor key={hospital.updatedAt} hospital={hospital} />
}
