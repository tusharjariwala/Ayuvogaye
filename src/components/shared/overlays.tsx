import { Loader2, Trash2 } from "lucide-react"
import { useState, type FormEvent, type ReactNode } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  title: string
  description: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: (note?: string) => void
  /** Render a trigger (uncontrolled) … */
  trigger?: ReactNode
  /** … or control the dialog. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Collect an optional note (e.g. rejection reason). */
  withNote?: boolean
  noteLabel?: string
  noteRequired?: boolean
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  onConfirm,
  trigger,
  open,
  onOpenChange,
  withNote,
  noteLabel = "Note",
  noteRequired,
}: ConfirmDialogProps) {
  const [note, setNote] = useState("")
  const disabled = withNote && noteRequired && note.trim().length < 3
  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setNote("")
        onOpenChange?.(o)
      }}
    >
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {withNote && (
          <div className="space-y-2">
            <Label htmlFor="confirm-note">
              {noteLabel}
              {noteRequired ? " (required)" : " (optional)"}
            </Label>
            <Textarea id="confirm-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            disabled={disabled}
            className={cn(destructive && buttonVariants({ variant: "destructive" }))}
            onClick={() => onConfirm(note.trim() || undefined)}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface DeleteConfirmationDialogProps {
  itemName: string
  onConfirm: () => void
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DeleteConfirmationDialog({ itemName, onConfirm, trigger, open, onOpenChange }: DeleteConfirmationDialogProps) {
  return (
    <ConfirmDialog
      title={`Delete ${itemName}?`}
      description="This removes the record from your local demo data. You can restore all sample data with “Reset demo data”."
      confirmLabel="Delete"
      destructive
      onConfirm={onConfirm}
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        trigger === undefined ? (
          <Button variant="ghost" size="icon-sm" aria-label={`Delete ${itemName}`}>
            <Trash2 />
          </Button>
        ) : (
          trigger
        )
      }
    />
  )
}

interface EntityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  submitLabel?: string
  children: ReactNode
  /** Called on submit; return false to keep the dialog open. */
  onSubmit: () => void | boolean | Promise<void | boolean>
  submitting?: boolean
  className?: string
}

/** Dialog shell for create/edit forms. Pass form fields as children. */
export function EntityFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel = "Save",
  children,
  onSubmit,
  submitting,
  className,
}: EntityFormDialogProps) {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const result = await onSubmit()
    if (result !== false) onOpenChange(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-h-[92svh] overflow-y-auto sm:max-w-lg", className)}>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="space-y-4">{children}</div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface DetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function DetailsSheet({ open, onOpenChange, title, description, children, footer }: DetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b p-5">
          <SheetTitle className="pr-8">{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t p-4">{footer}</div>}
      </SheetContent>
    </Sheet>
  )
}

/** Simple definition list used in detail sheets. */
export function DetailList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-x-4 gap-y-3 sm:grid-cols-[10rem_1fr]">
      {items.map((i) => (
        <div key={i.label} className="contents">
          <dt className="text-sm text-muted-foreground">{i.label}</dt>
          <dd className="text-sm font-medium break-words">{i.value}</dd>
        </div>
      ))}
    </dl>
  )
}
