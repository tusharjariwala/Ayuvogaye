import { Plus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppointmentForm, EnquiryForm } from "@/components/forms/request-form"

/** Dialog with appointment / enquiry request forms (provider chosen inside the form). */
export function NewRequestDialog({ defaultTab }: { defaultTab: "appointment" | "enquiry" }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> New request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New request</DialogTitle>
          <DialogDescription>
            Choose a hospital or doctor and send a simulated request. Nothing is sent to any provider.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue={defaultTab} className="gap-4">
          <TabsList className="w-full">
            <TabsTrigger value="appointment">Appointment</TabsTrigger>
            <TabsTrigger value="enquiry">Enquiry</TabsTrigger>
          </TabsList>
          <TabsContent value="appointment">
            <AppointmentForm />
          </TabsContent>
          <TabsContent value="enquiry">
            <EnquiryForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
