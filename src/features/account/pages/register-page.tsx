import { CheckCircle2, Info } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { DemoNotice } from "@/components/shared/demo-notice"
import { getDoctorBySlug, getHospitalBySlug } from "@/data/selectors"
import { useDemoStore } from "@/hooks/use-demo-store"
import { ROLE_HOME } from "@/lib/constants"
import { createId, nowISO } from "@/lib/mock-storage"
import type { User } from "@/types"
import { AuthCard } from "../components/auth-card"
import { RegisterForm, type RegisterValues } from "../components/register-form"

export default function RegisterPage() {
  const { data, create, signIn, logAudit, notify } = useDemoStore()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [pendingProvider, setPendingProvider] = useState<User | null>(null)

  const claimSlug = params.get("claim") ?? undefined
  const claimDoctor = getDoctorBySlug(data, claimSlug)
  const claimHospital = claimDoctor ? undefined : getHospitalBySlug(data, claimSlug)
  const claimName = claimDoctor?.name ?? claimHospital?.name
  const defaultType = params.get("type") === "provider" || claimName ? "provider" : "patient"

  const handleSubmit = (values: RegisterValues): string | void => {
    const email = values.email.toLowerCase()
    if (data.users.some((u) => u.email.toLowerCase() === email)) {
      return "An account with this email already exists. Sign in instead."
    }
    const isProvider = values.accountType === "provider"
    const user: User = {
      id: createId("u"),
      name: values.name,
      email,
      phone: values.mobile || undefined,
      role: isProvider ? (claimDoctor ? "doctor" : "hospital_admin") : "patient",
      status: isProvider ? "invited" : "active",
      city: values.city,
      createdAt: nowISO(),
      lastActiveAt: isProvider ? undefined : nowISO(),
    }
    create("users", user)

    if (!isProvider) {
      logAudit({ action: "user.registered", entityType: "user", entityId: user.id, summary: `${user.name} registered a patient account (demo)` })
      signIn(user.id)
      toast.success("Demo account created", { description: "You're signed in. No email or OTP was sent." })
      void navigate(ROLE_HOME.patient, { replace: true })
      return
    }

    const claimTarget = claimDoctor
      ? { entityType: "doctor" as const, entityId: claimDoctor.id }
      : claimHospital
        ? { entityType: "hospital" as const, entityId: claimHospital.id }
        : null
    if (claimTarget) {
      create("changeRequests", {
        id: createId("cr"),
        ...claimTarget,
        summary: `Profile claim request from ${user.name} (${email})`,
        fields: ["ownership"],
        status: "pending",
        submittedBy: user.name,
        submittedAt: nowISO(),
      })
    }
    logAudit({
      action: "provider.registration_submitted",
      entityType: "user",
      entityId: user.id,
      summary: claimName
        ? `${user.name} requested to claim ${claimName} (demo)`
        : `${user.name} registered a provider account pending review (demo)`,
    })
    notify({
      type: "profile_approval",
      title: claimName ? "New profile claim (demo)" : "New provider registration (demo)",
      message: claimName
        ? `${user.name} wants to claim ${claimName}. Review the request.`
        : `${user.name} (${values.city}) registered a provider account.`,
      audience: "platform_admin",
      link: "/admin/users",
    })
    toast.success("Provider registration submitted", { description: "Simulated — the platform team would review it." })
    setPendingProvider(user)
  }

  if (pendingProvider) {
    return (
      <AuthCard title="Registration received" description="Provider accounts are reviewed before they can sign in.">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-success-soft text-success-text">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </span>
          <p className="text-sm text-muted-foreground">
            Thanks, <strong className="text-foreground">{pendingProvider.name}</strong>.{" "}
            {claimName ? `Your claim for ${claimName} will be reviewed (simulated).` : "Your provider account will be reviewed (simulated)."}{" "}
            The account is marked as <em>invited</em> until a platform admin approves it.
          </p>
        </div>
        <DemoNotice>No email, OTP or document request has been sent. Sign in as Platform Admin to see the notification.</DemoNotice>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="flex-1">
            <Link to="/account/login">Go to sign in</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      className="max-w-xl"
      title="Create your account"
      description="Demo registration — the account is stored only in this browser."
      footer={
        <p>
          Already have an account?{" "}
          <Link to="/account/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      {claimName && (
        <Alert className="border-info/25 bg-info-soft text-info-text">
          <Info aria-hidden="true" />
          <AlertTitle>Claim profile for {claimName}</AlertTitle>
          <AlertDescription className="text-info-text/90">
            Register as a provider to request ownership. Claims are reviewed by the platform team before any changes go live.
          </AlertDescription>
        </Alert>
      )}
      <RegisterForm defaultType={defaultType} onSubmit={handleSubmit} />
      <p className="text-xs text-muted-foreground">
        No OTP, verification email or SMS is sent. Patient accounts are signed in immediately; provider accounts stay pending
        review.
      </p>
    </AuthCard>
  )
}
