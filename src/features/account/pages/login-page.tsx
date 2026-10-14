import { FlaskConical } from "lucide-react"
import { Link } from "react-router"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BrandLogo } from "@/components/shared/visuals"
import { DemoRoleSelector } from "../components/demo-role-selector"
import { EmailSignInForm } from "../components/email-sign-in-form"
import { usePostSignIn } from "../components/use-post-sign-in"

export default function LoginPage() {
  const { redirect, go } = usePostSignIn()

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-3 text-center">
          <BrandLogo className="justify-center" />
          <h1 className="text-2xl font-semibold sm:text-[1.75rem]">Sign in to the demo</h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
            Explore each role with a sample account.
            {redirect && " After signing in you'll return to the page you were trying to open."}
          </p>
        </div>

        <Alert className="border-warning/30 bg-warning-soft text-warning-text">
          <FlaskConical aria-hidden="true" />
          <AlertTitle>Demo sign-in — no real authentication</AlertTitle>
          <AlertDescription className="text-warning-text/90">
            Accounts are fictional and the session lives only in this browser. Production apps must authenticate users on a
            secure backend.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Choose a demo role</h2>
              <CardDescription>One click signs you in as a sample account.</CardDescription>
            </CardHeader>
            <CardContent>
              <DemoRoleSelector onSignedIn={go} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Sign in with email</h2>
              <CardDescription>Use the email of any sample user, for example aarav.s@example.com.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <EmailSignInForm onSignedIn={go} />
              <Separator />
              <p className="text-center text-sm text-muted-foreground">
                New here?{" "}
                <Link to="/account/register" className="font-medium text-primary underline-offset-4 hover:underline">
                  Create a demo account
                </Link>
                <span aria-hidden="true"> · </span>
                <Link
                  to="/account/register?type=provider"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  List your practice
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
