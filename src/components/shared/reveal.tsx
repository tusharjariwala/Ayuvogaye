import { useEffect, useRef, useState, type ReactNode, type Ref } from "react"
import { cn } from "@/lib/utils"

const OBSERVER_OPTIONS: IntersectionObserverInit = { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }

/** Returns a ref and whether the element has scrolled into view (latches true once seen). */
function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(() => typeof IntersectionObserver === "undefined")

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        observer.disconnect()
      }
    }, OBSERVER_OPTIONS)
    observer.observe(el)
    return () => observer.disconnect()
  }, [inView])

  return [ref, inView] as const
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

interface RevealProps {
  as?: "div" | "ul" | "ol"
  /** Animate direct children one after another instead of the whole block. */
  stagger?: boolean
  className?: string
  children: ReactNode
}

/** Fades and slides content up when it scrolls into view. Disabled under prefers-reduced-motion. */
export function Reveal({ as: Tag = "div", stagger, className, children }: RevealProps) {
  const [ref, inView] = useInView<HTMLElement>()
  return (
    <Tag ref={ref as Ref<never>} data-visible={inView} className={cn(stagger ? "reveal-stagger" : "reveal", className)}>
      {children}
    </Tag>
  )
}

/** Counts from 0 up to `value` once visible. */
export function CountUp({ value, duration = 1400 }: { value: number; duration?: number }) {
  const [ref, inView] = useInView<HTMLSpanElement>()
  const [reduced] = useState(prefersReducedMotion)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView || reduced) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, reduced, value, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {reduced ? value : display}
    </span>
  )
}
