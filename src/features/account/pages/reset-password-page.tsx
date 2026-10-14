import { CheckCircle2, MailCheck } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DemoNotice } from "@/components/shared/demo-notice"
import { AuthCard } from "../components/auth-card"
import { NewPasswordForm, ResetRequestForm } from "../components/reset-password-forms"

type Step = "request" | "sent" | "new-password" | "done"

const backToSignIn = (
  <p>
    Remembered it?{" "}
    <Link to="/account/login" className="font-medium text-primary underline-offset-4 hover:underline">
      Back to sign in
    </Link>
  </p>
)

export default function ResetPasswordPage() {
  const [step, setStep] = useState<Step>("request")
  const [email, setEmail] = useState("")

  if (step === "sent") {
    return (
      <AuthCard title="Check your inbox" footer={backToSignIn}>
        <div className="flex flex-col items-center gap-3 text-center" role="status">
          <span className="flex size-12 items-center justify-center rounded-full bg-info-soft text-info-text">
            <MailCheck className="size-6" aria-hidden="true" />
          </span>
          <p className="text-sm text-muted-foreground">
            If an account exists for <strong className="text-foreground">{email}</strong>, a reset link would be sent.
          </p>
        </div>
        <DemoNotice>Demo: nothing is sent. Continue below to preview the "set a new password" step.</DemoNotice>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" onClick={() => setStep("new-password")}>
            Preview next step
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setStep("request")}>
            Use another email
          </Button>
        </div>
      </AuthCard>
    )
  }

  if (step === "new-password") {
    return (
      <AuthCard title="Set a new password" description="Step 2 of 2 — purely visual in this demo." footer={backToSignIn}>
        <NewPasswordForm
          onDone={() => {
            toast.success("Password updated (demo)", { description: "Nothing was stored — demo passwords are never checked." })
            setStep("done")
          }}
        />
      </AuthCard>
    )
  }

  if (step === "done") {
    return (
      <AuthCard title="All set">
        <div className="flex flex-col items-center gap-3 text-center" role="status">
          <span className="flex size-12 items-center justify-center rounded-full bg-success-soft text-success-text">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </span>
          <p className="text-sm text-muted-foreground">
            In a real app your password would now be changed. In this demo, sign in with any sample account.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link to="/account/login">Go to sign in</Link>
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Enter the email you registered with and we'll send a reset link."
      footer={backToSignIn}
    >
      <ResetRequestForm
        onSent={(value) => {
          setEmail(value)
          setStep("sent")
        }}
      />
      <p className="text-xs text-muted-foreground">Demo: no email is sent and no account lookup is revealed.</p>
    </AuthCard>
  )
}
