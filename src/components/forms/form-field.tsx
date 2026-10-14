import { useId, type ReactNode } from "react"
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FieldRenderArgs<T extends FieldValues, N extends FieldPath<T>> {
  field: ControllerRenderProps<T, N>
  id: string
  invalid: boolean
  describedBy?: string
}

interface FormFieldProps<T extends FieldValues, N extends FieldPath<T>> {
  control: Control<T>
  name: N
  label: string
  description?: string
  required?: boolean
  className?: string
  /** Render the input. Spread `id`, `aria-invalid` and `aria-describedby` onto it. */
  render: (args: FieldRenderArgs<T, N>) => ReactNode
}

/**
 * Accessible React Hook Form field: label, control, description and error
 * message are linked with ids and aria attributes.
 */
export function FormField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  required,
  className,
  render,
}: FormFieldProps<T, N>) {
  const id = useId()
  const descId = `${id}-desc`
  const errId = `${id}-err`
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const invalid = !!fieldState.error
        const describedBy = [description ? descId : null, invalid ? errId : null].filter(Boolean).join(" ") || undefined
        return (
          <div className={cn("space-y-2", className)}>
            <Label htmlFor={id}>
              {label}
              {required && (
                <span className="text-destructive-text" aria-hidden="true">
                  *
                </span>
              )}
            </Label>
            {render({ field, id, invalid, describedBy })}
            {description && (
              <p id={descId} className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
            {invalid && (
              <p id={errId} role="alert" className="text-xs font-medium text-destructive-text">
                {fieldState.error?.message}
              </p>
            )}
          </div>
        )
      }}
    />
  )
}

/** Plain (non-RHF) labelled field wrapper for simple local forms. */
export function Field({
  label,
  htmlFor,
  description,
  children,
  className,
}: {
  label: string
  htmlFor: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}
