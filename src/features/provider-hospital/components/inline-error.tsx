/** Small accessible error message linked via `aria-describedby`. */
export function InlineError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="text-xs font-medium text-destructive-text">
      {message}
    </p>
  )
}
