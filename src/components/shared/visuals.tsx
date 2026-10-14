import {
  Activity,
  Baby,
  Droplet,
  Smile,
  Sparkles,
  Bone,
  Brain,
  Building2,
  Droplets,
  Ear,
  Eye,
  HeartHandshake,
  HeartPulse,
  Pill,
  Ribbon,
  ScanFace,
  Stethoscope,
  Syringe,
  type LucideIcon,
} from "lucide-react"
import { createElement, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { initials } from "@/lib/formatters"
import { cn } from "@/lib/utils"

const SPECIALTY_ICONS: Record<string, LucideIcon> = {
  "heart-pulse": HeartPulse,
  bone: Bone,
  brain: Brain,
  ribbon: Ribbon,
  baby: Baby,
  "heart-handshake": HeartHandshake,
  "scan-face": ScanFace,
  eye: Eye,
  ear: Ear,
  pill: Pill,
  droplets: Droplets,
  stethoscope: Stethoscope,
  syringe: Syringe,
  droplet: Droplet,
  sparkles: Sparkles,
  smile: Smile,
  activity: Activity,
}

export function getSpecialtyIcon(key: string): LucideIcon {
  return SPECIALTY_ICONS[key] ?? Stethoscope
}

export function SpecialtyIcon({ icon, className }: { icon: string; className?: string }) {
  return createElement(getSpecialtyIcon(icon), { className, "aria-hidden": true })
}

interface ImagePlaceholderProps {
  /** Real image URL. Falls back to the generated placeholder when missing or if it fails to load. */
  src?: string
  hue?: number
  label: string
  icon?: LucideIcon
  className?: string
}

/**
 * Locally rendered healthcare image placeholder (no external assets).
 * Replace with real imagery when integrating a CMS.
 */
export function ImagePlaceholder({ src, hue = 180, label, icon: Icon = Building2, className }: ImagePlaceholderProps) {
  const [failedSrc, setFailedSrc] = useState<string>()
  if (src && failedSrc !== src) {
    return (
      <img
        src={src}
        alt={label}
        loading="lazy"
        decoding="async"
        onError={() => setFailedSrc(src)}
        className={cn("w-full bg-muted object-cover", className)}
      />
    )
  }
  return (
    <div
      role="img"
      aria-label={`${label} (placeholder image)`}
      className={cn("relative flex items-center justify-center overflow-hidden bg-muted", className)}
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(${hue} 38% 42% / 0.22), hsl(${hue + 24} 45% 55% / 0.08) 60%, transparent), radial-gradient(circle at 80% 20%, hsl(${hue} 50% 60% / 0.18), transparent 45%)`,
      }}
    >
      <svg className="absolute inset-0 h-full w-full text-primary/10" aria-hidden="true">
        <defs>
          <pattern id={`grid-${hue}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${hue})`} />
      </svg>
      <Icon className="relative size-10 text-primary/60" aria-hidden="true" />
    </div>
  )
}

/** Stock photos in public/images/hospitals, used when a hospital has no image of its own. */
const HOSPITAL_STOCK_IMAGES = Array.from({ length: 7 }, (_, i) => `/images/hospitals/hospital-${i + 1}.jpg`)

/** A hospital's own image, or a stock photo picked consistently from its id. */
export function getHospitalImage(hospital: { id: string; image?: string }) {
  if (hospital.image) return hospital.image
  let hash = 0
  for (const ch of hospital.id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return HOSPITAL_STOCK_IMAGES[hash % HOSPITAL_STOCK_IMAGES.length]
}

export function PersonAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <Avatar className={cn("size-12", className)}>
      <AvatarFallback className="bg-primary/10 font-semibold text-primary">{initials(name)}</AvatarFallback>
    </Avatar>
  )
}

/**
 * Ayuvoyage brand mark: lotus in a teal disc with a dotted "journey" arc.
 * The disc keeps the fixed brand teal in both themes so the mark stays recognisable.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-9 shrink-0", className)} aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#0F5C63" />
      <path d="M13.5 25.5C19 16.5 33 12.5 44 18" fill="none" stroke="#E8923A" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="0.1 4.6" />
      <path d="M43.2 13.6 51 20.2l-9.9 2.2z" fill="#E8923A" />
      <path d="M17 36.5c6.8-1.6 12.6 2.6 14 10.4-7.7.9-12.8-3.4-14-10.4Z" fill="#D6E8E4" />
      <path d="M47 36.5c-6.8-1.6-12.6 2.6-14 10.4 7.7.9 12.8-3.4 14-10.4Z" fill="#D6E8E4" />
      <path d="M32 23.5c5.2 6.4 6 15.6 0 23.4-6-7.8-5.2-17 0-23.4Z" fill="#FFFFFF" />
    </svg>
  )
}

interface BrandLogoProps {
  className?: string
  showName?: boolean
  /** Show the "Medical Tourism" tagline under the wordmark. */
  showTagline?: boolean
  nameClassName?: string
}

/** Full Ayuvoyage logo (mark + wordmark). */
export function BrandLogo({ className, showName = true, showTagline = true, nameClassName }: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark />
      {showName && (
        <span className={cn("flex flex-col leading-none", nameClassName)}>
          <span className="text-[1.3rem] font-extrabold tracking-tight">
            <span className="text-primary">Ayu</span>
            <span className="text-foreground">voyage</span>
          </span>
          {showTagline && (
            <span className="mt-1 text-[0.56rem] font-semibold tracking-[0.3em] text-muted-foreground uppercase">Medical Tourism</span>
          )}
        </span>
      )}
    </span>
  )
}
