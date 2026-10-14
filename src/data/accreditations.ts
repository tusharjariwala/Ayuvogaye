// Fictional, illustrative sample data. Not real people, providers, credentials or patient records.
import type { Accreditation } from "@/types"

const disclaimer =
  "Shown as an accreditation category for illustration only — this template does not confirm that any listed provider holds a real accreditation."

export const accreditations: Accreditation[] = [
  {
    id: "acc-nabh",
    code: "NABH",
    name: "National Accreditation Board for Hospitals & Healthcare Providers",
    description: `A hospital quality accreditation category. ${disclaimer}`,
  },
  {
    id: "acc-nabl",
    code: "NABL",
    name: "National Accreditation Board for Testing and Calibration Laboratories",
    description: `A laboratory quality accreditation category. ${disclaimer}`,
  },
  {
    id: "acc-jci",
    code: "JCI",
    name: "Joint Commission International",
    description: `An international hospital accreditation category. ${disclaimer}`,
  },
  {
    id: "acc-nabh-entry",
    code: "NABH-E",
    name: "NABH Entry Level",
    description: `An entry-level hospital quality certification category. ${disclaimer}`,
  },
  {
    id: "acc-green-ot",
    code: "GOT",
    name: "Green OT Practices (sample certification)",
    description: `A made-up sample certification for operation theatre practices. ${disclaimer}`,
  },
]
