import { MapPin, Pencil, Phone, Plus, Star } from "lucide-react"
import { useState, type ChangeEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DeleteConfirmationDialog, EntityFormDialog } from "@/components/shared/overlays"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/states"
import { createId } from "@/lib/mock-storage"
import type { HospitalLocation } from "@/types"
import { InlineError } from "../components/inline-error"
import { MissingProviderState, PendingChangesNotice, ReadOnlyNotice } from "../components/portal-widgets"
import { useManagedHospital } from "../use-managed-hospital"

type Draft = Omit<HospitalLocation, "id" | "isPrimary">
type Errors = Partial<Record<keyof Draft, string>>

function validate(d: Draft): Errors {
  const e: Errors = {}
  if (d.label.trim().length < 2) e.label = "Enter a label, e.g. Main campus"
  if (d.address.trim().length < 5) e.address = "Enter the street address"
  if (!d.citySlug) e.citySlug = "Choose a city"
  if (!/^\d{6}$/.test(d.pincode.trim())) e.pincode = "Pincode must be 6 digits"
  if (!/^\+?[\d\s-]{8,16}$/.test(d.phone.trim())) e.phone = "Enter a valid phone number"
  return e
}


export default function LocationsPage() {
  const { hospital, data, canEdit, pendingChanges, saveHospital } = useManagedHospital()
  const [editing, setEditing] = useState<HospitalLocation | "new" | null>(null)
  const [draft, setDraft] = useState<Draft>({ label: "", address: "", citySlug: "", pincode: "", phone: "" })
  const [errors, setErrors] = useState<Errors>({})

  if (!hospital) return <MissingProviderState kind="hospital" />
  const locations = [...hospital.locations].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
  const cityName = (slug: string) => data.cities.find((c) => c.slug === slug)?.name ?? slug

  const openEditor = (loc: HospitalLocation | "new") => {
    setErrors({})
    setDraft(
      loc === "new"
        ? { label: "", address: "", citySlug: hospital.citySlug, pincode: "", phone: "" }
        : { label: loc.label, address: loc.address, citySlug: loc.citySlug, pincode: loc.pincode, phone: loc.phone },
    )
    setEditing(loc)
  }

  const persist = (next: HospitalLocation[], summary: string) =>
    saveHospital({ locations: next }, { fields: ["locations"], summary, action: "hospital.locations_updated", invalidateGroups: ["locations"], toastTitle: "Locations updated" })

  const submit = () => {
    const e = validate(draft)
    setErrors(e)
    if (Object.keys(e).length > 0) return false
    const clean: Draft = { label: draft.label.trim(), address: draft.address.trim(), citySlug: draft.citySlug, pincode: draft.pincode.trim(), phone: draft.phone.trim() }
    if (editing === "new") {
      persist([...hospital.locations, { ...clean, id: createId("loc"), isPrimary: hospital.locations.length === 0 }], `Added location “${clean.label}”`)
    } else if (editing) {
      persist(hospital.locations.map((l) => (l.id === editing.id ? { ...l, ...clean } : l)), `Edited location “${clean.label}”`)
    }
    setEditing(null)
  }

  const field = (key: keyof Draft) => ({
    id: `loc-${key}`,
    value: draft[key],
    onChange: (e: ChangeEvent<HTMLInputElement>) => setDraft((d) => ({ ...d, [key]: e.target.value })),
    "aria-invalid": !!errors[key],
    "aria-describedby": errors[key] ? `loc-${key}-err` : undefined,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locations"
        description="Branches, clinics and campuses patients can visit. The primary location is shown first on your profile."
        actions={
          canEdit && (
            <Button onClick={() => openEditor("new")}>
              <Plus /> Add location
            </Button>
          )
        }
      />
      {!canEdit && <ReadOnlyNotice />}
      <PendingChangesNotice requests={pendingChanges.filter((c) => c.fields.includes("locations"))} verified={hospital.verification.status === "verified"} />

      {locations.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No locations yet"
          description="Add at least one location so patients know where to go."
          action={canEdit && <Button onClick={() => openEditor("new")}>Add location</Button>}
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {locations.map((loc) => (
            <li key={loc.id}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>
                    <h2>{loc.label}</h2>
                  </CardTitle>
                  <CardDescription>{cityName(loc.citySlug)}</CardDescription>
                  {loc.isPrimary && (
                    <CardAction>
                      <Badge variant="success">
                        <Star aria-hidden="true" /> Primary
                      </Badge>
                    </CardAction>
                  )}
                </CardHeader>
                <CardContent className="flex-1 space-y-2 text-sm">
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span>
                      {loc.address}, {cityName(loc.citySlug)} {loc.pincode}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span>{loc.phone}</span>
                  </p>
                </CardContent>
                {canEdit && (
                  <CardFooter className="flex flex-wrap gap-2 border-t">
                    <Button variant="outline" size="sm" onClick={() => openEditor(loc)}>
                      <Pencil /> Edit
                    </Button>
                    {!loc.isPrimary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          persist(
                            hospital.locations.map((l) => ({ ...l, isPrimary: l.id === loc.id })),
                            `Set “${loc.label}” as the primary location`,
                          )
                        }
                      >
                        <Star /> Set as primary
                      </Button>
                    )}
                    <span className="ml-auto">
                      {loc.isPrimary ? (
                        <span className="text-xs text-muted-foreground">Set another primary to delete</span>
                      ) : (
                        <DeleteConfirmationDialog
                          itemName={loc.label}
                          onConfirm={() => persist(hospital.locations.filter((l) => l.id !== loc.id), `Removed location “${loc.label}”`)}
                        />
                      )}
                    </span>
                  </CardFooter>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}

      <EntityFormDialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? "Add location" : "Edit location"}
        description="Location changes are sent to the platform for review (demo)."
        submitLabel={editing === "new" ? "Add location" : "Save location"}
        onSubmit={submit}
      >
        <div className="space-y-2">
          <Label htmlFor="loc-label">Label</Label>
          <Input {...field("label")} placeholder="e.g. City clinic" />
          <InlineError id="loc-label-err" message={errors.label} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="loc-address">Street address</Label>
          <Input {...field("address")} autoComplete="street-address" />
          <InlineError id="loc-address-err" message={errors.address} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="loc-citySlug">City</Label>
            <Select value={draft.citySlug} onValueChange={(v) => setDraft((d) => ({ ...d, citySlug: v }))}>
              <SelectTrigger id="loc-citySlug" className="w-full" aria-invalid={!!errors.citySlug} aria-describedby={errors.citySlug ? "loc-citySlug-err" : undefined}>
                <SelectValue placeholder="Choose a city" />
              </SelectTrigger>
              <SelectContent>
                {data.cities.map((c) => (
                  <SelectItem key={c.id} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <InlineError id="loc-citySlug-err" message={errors.citySlug} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loc-pincode">Pincode</Label>
            <Input {...field("pincode")} inputMode="numeric" maxLength={6} />
            <InlineError id="loc-pincode-err" message={errors.pincode} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="loc-phone">Phone</Label>
          <Input {...field("phone")} type="tel" />
          <InlineError id="loc-phone-err" message={errors.phone} />
        </div>
      </EntityFormDialog>
    </div>
  )
}
