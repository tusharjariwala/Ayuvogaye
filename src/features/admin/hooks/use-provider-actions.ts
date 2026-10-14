import { useCallback } from "react"
import { toast } from "sonner"
import type { Collections } from "@/data"
import { getCity } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { slugify } from "@/lib/formatters"
import { createId, nowISO } from "@/lib/mock-storage"
import type { ChangeRequest, Doctor, Hospital, ProviderType } from "@/types"
import { PROVIDER_LABEL, PROVIDER_STATUS_LABELS, getProvider } from "../lib/admin-helpers"
import { useProviderNotify } from "./use-provider-notify"

export interface ProviderDraft {
  name: string
  citySlug: string
  status: Hospital["status"]
  hospitalType: Hospital["type"]
  specialtyId: string
  sponsored: boolean
  email: string
  phone: string
}

export function emptyProviderDraft(data: Collections): ProviderDraft {
  return {
    name: "",
    citySlug: data.cities[0]?.slug ?? "",
    status: "pending",
    hospitalType: "Multi-speciality",
    specialtyId: data.specialties[0]?.id ?? "",
    sponsored: false,
    email: "",
    phone: "",
  }
}

export function providerToDraft(data: Collections, type: ProviderType, id: string): ProviderDraft {
  const base = emptyProviderDraft(data)
  if (type === "hospital") {
    const h = data.hospitals.find((x) => x.id === id)
    if (!h) return base
    return { ...base, name: h.name, citySlug: h.citySlug, status: h.status, hospitalType: h.type, sponsored: h.sponsored, email: h.email, phone: h.phone }
  }
  const d = data.doctors.find((x) => x.id === id)
  if (!d) return base
  return { ...base, name: d.name, citySlug: d.citySlug, status: d.status, specialtyId: d.specialtyId }
}

function uniqueSlug(base: string, taken: Set<string>) {
  let slug = base || "provider"
  let i = 2
  while (taken.has(slug)) slug = `${base}-${i++}`
  return slug
}

function newHospital(data: Collections, draft: ProviderDraft): Hospital {
  const city = getCity(data, draft.citySlug)
  const at = nowISO()
  return {
    id: createId("h"),
    slug: uniqueSlug(slugify(`${draft.name} ${city?.name ?? ""}`), new Set(data.hospitals.map((h) => h.slug))),
    name: draft.name,
    type: draft.hospitalType,
    tagline: "New listing — profile details pending",
    description: "This listing was created by a platform admin in the demo. Details are pending provider submission.",
    citySlug: draft.citySlug,
    city: city?.name ?? draft.citySlug,
    state: city?.state ?? "",
    address: "Address pending",
    pincode: "000000",
    phone: draft.phone || "+91 00000 00000",
    email: draft.email || "contact@example.in",
    establishedYear: new Date().getFullYear(),
    beds: 0,
    specialtyIds: [],
    departmentIds: [],
    facilityIds: [],
    accreditationIds: [],
    treatmentIds: [],
    locations: [],
    operatingHours: [],
    emergency: null,
    appointmentAvailability: "limited",
    verification: { status: "unverified" },
    verifiedFields: [],
    sponsored: draft.sponsored,
    claimed: false,
    profileCompleteness: 20,
    profileViews: 0,
    status: draft.status,
    imageHue: Math.floor(Math.random() * 360),
    createdAt: at,
    updatedAt: at,
  }
}

function newDoctor(data: Collections, draft: ProviderDraft): Doctor {
  const city = getCity(data, draft.citySlug)
  const specialty = data.specialties.find((s) => s.id === draft.specialtyId)
  const at = nowISO()
  const id = createId("d")
  return {
    id,
    slug: uniqueSlug(slugify(`${draft.name.replace(/^dr\.?\s*/i, "")} ${specialty?.slug ?? ""}`), new Set(data.doctors.map((d) => d.slug))),
    name: draft.name,
    specialtyId: draft.specialtyId,
    bio: "This profile was created by a platform admin in the demo. Details are pending provider submission.",
    qualifications: [],
    experienceYears: 0,
    languages: ["English"],
    consultationModes: ["in_person"],
    citySlug: draft.citySlug,
    city: city?.name ?? draft.citySlug,
    state: city?.state ?? "",
    treatmentIds: [],
    availability: [],
    availabilityLevel: "unavailable",
    registration: { council: "State Medical Council (placeholder)", placeholderRef: `REG-PLACEHOLDER-${id.slice(2, 8).toUpperCase()}` },
    verification: { status: "unverified" },
    claimed: false,
    profileCompleteness: 20,
    profileViews: 0,
    status: draft.status,
    createdAt: at,
    updatedAt: at,
  }
}

/** Local CRUD + status changes for hospitals and doctors, with audit, toast and notifications. */
export function useProviderActions() {
  const { data, create, update, remove, logAudit } = useDemoStore()
  const notifyProvider = useProviderNotify()

  const saveProvider = useCallback(
    (type: ProviderType, draft: ProviderDraft, existingId?: string) => {
      const city = getCity(data, draft.citySlug)
      const at = nowISO()
      if (existingId) {
        if (type === "hospital") {
          update("hospitals", existingId, {
            name: draft.name,
            citySlug: draft.citySlug,
            city: city?.name ?? draft.citySlug,
            state: city?.state ?? "",
            status: draft.status,
            type: draft.hospitalType,
            sponsored: draft.sponsored,
            email: draft.email,
            phone: draft.phone,
            updatedAt: at,
          })
        } else {
          update("doctors", existingId, {
            name: draft.name,
            citySlug: draft.citySlug,
            city: city?.name ?? draft.citySlug,
            state: city?.state ?? "",
            status: draft.status,
            specialtyId: draft.specialtyId,
            updatedAt: at,
          })
        }
        logAudit({ action: `${type}.updated`, entityType: type, entityId: existingId, summary: `${draft.name} details updated by admin.` })
        toast.success(`${draft.name} updated`, { description: "Saved to local demo data only." })
        return existingId
      }
      const record = type === "hospital" ? newHospital(data, draft) : newDoctor(data, draft)
      if (type === "hospital") create("hospitals", record as Hospital)
      else create("doctors", record as Doctor)
      logAudit({
        action: `${type}.created`,
        entityType: type,
        entityId: record.id,
        summary: `${record.name} ${PROVIDER_LABEL[type].toLowerCase()} listing created (unverified).`,
      })
      toast.success(`${record.name} created`, { description: "New listings start unverified. Demo data only." })
      return record.id
    },
    [create, data, logAudit, update],
  )

  const setStatus = useCallback(
    (type: ProviderType, ids: string[], status: "active" | "suspended") => {
      const at = nowISO()
      const names: string[] = []
      for (const id of ids) {
        const p = getProvider(data, type, id)
        if (!p || p.status === status) continue
        names.push(p.name)
        if (type === "hospital") update("hospitals", id, { status, updatedAt: at })
        else update("doctors", id, { status, updatedAt: at })
        logAudit({
          action: `${type}.${status === "suspended" ? "suspended" : "reactivated"}`,
          entityType: type,
          entityId: id,
          summary: `${p.name} ${status === "suspended" ? "suspended — hidden from public listings" : "reactivated"}.`,
        })
        notifyProvider(type, id, {
          type: "profile_approval",
          title: status === "suspended" ? "Listing suspended" : "Listing reactivated",
          message: `${p.name} is now ${PROVIDER_STATUS_LABELS[status].toLowerCase()} on the platform.`,
        })
      }
      if (names.length === 0) {
        toast.info("No changes needed", { description: `Selected listings are already ${status}.` })
        return
      }
      toast.success(
        names.length === 1 ? `${names[0]} ${status === "suspended" ? "suspended" : "reactivated"}` : `${names.length} listings ${status === "suspended" ? "suspended" : "reactivated"}`,
        { description: "Demo action — stored locally in this browser." },
      )
    },
    [data, logAudit, notifyProvider, update],
  )

  const deleteProvider = useCallback(
    (type: ProviderType, id: string) => {
      const p = getProvider(data, type, id)
      if (!p) return
      if (type === "hospital") remove("hospitals", id)
      else remove("doctors", id)
      data.featuredListings.filter((l) => l.entityType === type && l.entityId === id).forEach((l) => remove("featuredListings", l.id))
      logAudit({ action: `${type}.deleted`, entityType: type, entityId: id, summary: `${p.name} listing deleted.` })
      toast.success(`${p.name} deleted`, { description: "Removed from local demo data. Reset demo data to restore." })
    },
    [data, logAudit, remove],
  )

  const decideChangeRequest = useCallback(
    (cr: ChangeRequest, status: "approved" | "rejected") => {
      const p = getProvider(data, cr.entityType, cr.entityId)
      const name = p?.name ?? "provider"
      update("changeRequests", cr.id, { status })
      if (p && status === "approved") {
        if (cr.entityType === "hospital") update("hospitals", cr.entityId, { updatedAt: nowISO() })
        else update("doctors", cr.entityId, { updatedAt: nowISO() })
      }
      logAudit({
        action: `change_request.${status}`,
        entityType: cr.entityType,
        entityId: cr.entityId,
        summary: `Change request "${cr.summary}" ${status} for ${name}.`,
      })
      notifyProvider(cr.entityType, cr.entityId, {
        type: "profile_approval",
        title: `Profile change ${status}`,
        message: `Your request "${cr.summary}" was ${status}.`,
      })
      toast.success(`Change request ${status}`, { description: "Demo action — no profile data was transmitted." })
    },
    [data, logAudit, notifyProvider, update],
  )

  return { saveProvider, setStatus, deleteProvider, decideChangeRequest }
}
