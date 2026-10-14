import { useEffect } from "react"

/** Sets `document.title` while the component is mounted (mock SEO). */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    if (!title) return
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}
