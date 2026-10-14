// Fictional, illustrative sample data. Not real people, providers, credentials or patient records.
import type { Facility } from "@/types"

export const facilities: Facility[] = [
  { id: "fac-icu", name: "Intensive Care Unit (ICU)", category: "clinical" },
  { id: "fac-nicu", name: "Neonatal ICU (NICU)", category: "clinical" },
  { id: "fac-cath-lab", name: "Cardiac Cath Lab", category: "clinical" },
  { id: "fac-modular-ot", name: "Modular Operation Theatres", category: "clinical" },
  { id: "fac-dialysis", name: "Dialysis Unit", category: "clinical" },
  { id: "fac-physiotherapy", name: "Physiotherapy & Rehabilitation", category: "clinical" },
  { id: "fac-mri", name: "MRI", category: "diagnostics" },
  { id: "fac-ct", name: "CT Scan", category: "diagnostics" },
  { id: "fac-diagnostic-lab", name: "Diagnostic Laboratory", category: "diagnostics" },
  { id: "fac-blood-bank", name: "Blood Bank", category: "clinical" },
  { id: "fac-pharmacy-24x7", name: "24x7 Pharmacy", category: "patient_comfort" },
  { id: "fac-cafeteria", name: "Cafeteria", category: "patient_comfort" },
  { id: "fac-patient-lounge", name: "Patient & Family Lounge", category: "patient_comfort" },
  { id: "fac-emergency-24x7", name: "24x7 Emergency", category: "emergency" },
  { id: "fac-ambulance", name: "Ambulance Service", category: "emergency" },
  { id: "fac-wheelchair-access", name: "Wheelchair Access", category: "accessibility" },
]
