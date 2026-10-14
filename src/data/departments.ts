// Fictional, illustrative sample data. Not real people, providers, credentials or patient records.
import type { Department } from "@/types"

export const departments: Department[] = [
  { id: "dep-cardiology", slug: "cardiology", name: "Cardiology", specialtyId: "sp-cardiology", description: "Outpatient and inpatient heart care, including diagnostic tests such as ECG and echo." },
  { id: "dep-cardiac-surgery", slug: "cardiac-surgery", name: "Cardiac Surgery", specialtyId: "sp-cardiology", description: "Surgical heart procedures carried out by a cardiac surgical team." },
  { id: "dep-orthopaedics", slug: "orthopaedics", name: "Orthopaedics", specialtyId: "sp-orthopaedics", description: "Bone, joint and sports-injury care, including joint replacement services." },
  { id: "dep-neurology", slug: "neurology", name: "Neurology", specialtyId: "sp-neurology", description: "Assessment and ongoing care for conditions of the brain and nerves." },
  { id: "dep-neurosurgery", slug: "neurosurgery", name: "Neurosurgery", specialtyId: "sp-neurology", description: "Surgical care for the brain, spine and nervous system." },
  { id: "dep-medical-oncology", slug: "medical-oncology", name: "Medical Oncology", specialtyId: "sp-oncology", description: "Medication-based cancer care such as chemotherapy, coordinated by an oncology team." },
  { id: "dep-radiation-oncology", slug: "radiation-oncology", name: "Radiation Oncology", specialtyId: "sp-oncology", description: "Radiation-based cancer treatment planning and delivery." },
  { id: "dep-paediatrics", slug: "paediatrics", name: "Paediatrics", specialtyId: "sp-paediatrics", description: "General health care for infants, children and adolescents." },
  { id: "dep-neonatology", slug: "neonatology", name: "Neonatology", specialtyId: "sp-paediatrics", description: "Specialised care for newborns, including those needing intensive care." },
  { id: "dep-obstetrics", slug: "obstetrics", name: "Obstetrics & Gynaecology", specialtyId: "sp-obstetrics-gynaecology", description: "Pregnancy, childbirth and women's reproductive health services." },
  { id: "dep-dermatology", slug: "dermatology", name: "Dermatology", specialtyId: "sp-dermatology", description: "Skin, hair and nail consultations and procedures." },
  { id: "dep-ophthalmology", slug: "ophthalmology", name: "Ophthalmology", specialtyId: "sp-ophthalmology", description: "Eye examinations, vision care and eye procedures." },
  { id: "dep-ent", slug: "ent", name: "ENT", specialtyId: "sp-ent", description: "Ear, nose and throat consultations and procedures." },
  { id: "dep-gastroenterology", slug: "gastroenterology", name: "Gastroenterology", specialtyId: "sp-gastroenterology", description: "Digestive and liver care, including endoscopy services." },
  { id: "dep-nephrology", slug: "nephrology", name: "Nephrology", specialtyId: "sp-nephrology", description: "Kidney care and dialysis services." },
  { id: "dep-internal-medicine", slug: "internal-medicine", name: "Internal Medicine", specialtyId: "sp-general-medicine", description: "General adult medicine, health check-ups and referrals." },
]
