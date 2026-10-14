import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { BrandLogo } from "@/components/shared/visuals"
import { cn } from "@/lib/utils"

interface AuthCardProps {
  title: string
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}

/** Centred card used by sign-in, registration and password reset pages. */
export function AuthCard({ title, description, children, footer, className }: AuthCardProps) {
  return (
    <div className="container-page py-10">
      <Card className={cn("mx-auto w-full max-w-md", className)}>
        <CardHeader className="space-y-3">
          <BrandLogo />
          <div className="space-y-1">
            <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">{children}</CardContent>
        {footer && <CardFooter className="flex-col items-stretch gap-2 text-center text-sm text-muted-foreground">{footer}</CardFooter>}
      </Card>
    </div>
  )
}
