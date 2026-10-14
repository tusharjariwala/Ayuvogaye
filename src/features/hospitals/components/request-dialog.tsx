import { useState, type ReactNode } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppointmentForm, EnquiryForm } from "@/components/forms/request-form"

interface RequestDialogProps {
  providerName: string
  hospitalId?: string
  doctorId?: string
  defaultTab?: "appointment" | "enquiry"
  trigger: ReactNode
}

/** Dialog with appointment / enquiry tabs, prefilled with the provider. */
export function RequestDialog({ providerName, hospitalId, doctorId, defaultTab = "appointment", trigger }: RequestDialogProps) {
  const [tab, setTab] = useState<string>(defaultTab)
  return (
    <Dialog onOpenChange={(open) => open && setTab(defaultTab)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Contact {providerName}</DialogTitle>
          <DialogDescription>
            Requests are simulated in this demo — no real appointment is booked and no message is sent.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="appointment">Request appointment</TabsTrigger>
            <TabsTrigger value="enquiry">Send enquiry</TabsTrigger>
          </TabsList>
          <TabsContent value="appointment" className="pt-4">
            <AppointmentForm hospitalId={hospitalId} doctorId={doctorId} />
          </TabsContent>
          <TabsContent value="enquiry" className="pt-4">
            <EnquiryForm hospitalId={hospitalId} doctorId={doctorId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
