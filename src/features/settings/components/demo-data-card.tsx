import { Database, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/shared/overlays"
import { useDemoStore } from "@/hooks/use-demo-store"

export function DemoDataCard() {
  const { resetDemoData } = useDemoStore()
  return (
    <Card>
      <CardHeader>
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Database className="size-4 text-primary" aria-hidden="true" /> Demo data
        </h2>
        <CardDescription>
          All records are fictional and stored in this browser. Resetting restores the original sample data and clears your
          changes. Your theme preference is kept.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ConfirmDialog
          title="Reset all demo data?"
          description="This restores every sample hospital, doctor, request, review and log to its original state."
          confirmLabel="Reset data"
          destructive
          onConfirm={() => {
            resetDemoData()
            toast.success("Demo data reset", { description: "All sample records were restored." })
          }}
          trigger={
            <Button variant="outline">
              <RotateCcw /> Reset demo data
            </Button>
          }
        />
      </CardContent>
    </Card>
  )
}
