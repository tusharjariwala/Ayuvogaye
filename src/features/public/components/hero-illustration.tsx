import { BadgeCheck, CalendarCheck, HeartPulse, MapPin, Star } from "lucide-react"
import { ImagePlaceholder } from "@/components/shared/visuals"

/**
 * Decorative hero composition built from local placeholders and inline SVG.
 * Hidden from assistive technology; replace with brand imagery.
 */
export function HeroIllustration() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-md select-none">
      <svg viewBox="0 0 400 400" className="absolute -inset-6 h-[calc(100%+3rem)] w-[calc(100%+3rem)]" fill="none">
        <circle cx="200" cy="200" r="180" className="fill-primary/5" />
        <circle cx="200" cy="200" r="130" className="origin-center animate-spin-slow stroke-primary/15" strokeWidth="1.5" strokeDasharray="4 8" />
        <path d="M40 210h70l18-40 26 80 22-60 14 20h170" className="animate-draw stroke-primary/40" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="330" cy="80" r="10" className="animate-pulse fill-highlight/60" />
      </svg>

      <div className="relative animate-float rounded-2xl border bg-card p-4 shadow-raised">
        <ImagePlaceholder hue={176} label="Hospital" className="h-36 rounded-xl" />
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success-text">
              <BadgeCheck className="size-3.5" /> Verified details
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5" /> Pune
            </span>
          </div>
          <div className="h-3 w-3/4 rounded-full bg-foreground/80" />
          <div className="h-2.5 w-1/2 rounded-full bg-muted-foreground/30" />
          <div className="flex gap-1 pt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="size-3.5 fill-highlight text-highlight" />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 -left-6 flex animate-float items-center gap-3 rounded-xl border bg-card p-3 shadow-raised [animation-delay:-2s]">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <HeartPulse className="size-5" />
        </span>
        <div className="space-y-1.5">
          <div className="h-2.5 w-24 rounded-full bg-foreground/70" />
          <div className="h-2 w-16 rounded-full bg-muted-foreground/30" />
        </div>
      </div>

      <div className="absolute -top-4 -right-4 flex animate-float items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-raised [animation-delay:-4s]">
        <CalendarCheck className="size-4 text-primary" />
        <span className="text-xs font-medium">Request sent (demo)</span>
      </div>
    </div>
  )
}
