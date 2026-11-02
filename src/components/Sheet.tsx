import { useEffect, useRef, type ReactNode, type RefObject } from 'react'

interface SheetProps {
  /** The dialog box's class (`cq-modal`, `cq-share-sheet`…), which sets its look. */
  className: string
  onClose: () => void
  /** The id of the dialog's heading… */
  labelledBy?: string
  /** …or its name, when it has no heading. */
  label?: string
  /** "alertdialog" for a question that needs an answer (Confirm). */
  role?: 'dialog' | 'alertdialog'
  /** What gets keyboard focus when it opens (default: the dialog's first control). */
  initialFocus?: RefObject<HTMLElement | null>
  children: ReactNode
}

/** What can take keyboard focus inside the pop-up. */
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * A pop-up over the page: share, reminders, certificates, "Read more", confirmations. A tap
 * outside it or Escape closes it. Keyboard focus moves into it when it opens, Tab stays
 * inside it, and focus goes back to where it was when it closes. The page behind doesn't
 * scroll while it is open.
 */
export function Sheet({ className, onClose, labelledBy, label, role = 'dialog', initialFocus, children }: SheetProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE)
    ;(initialFocus?.current ?? first)?.focus()
    return () => previous?.focus()
  }, [initialFocus])

  // The page behind stays put (restored as it was, in case another pop-up had locked it).
  useEffect(() => {
    const { style } = document.body
    const previous = style.overflow
    style.overflow = 'hidden'
    return () => {
      style.overflow = previous
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      // Tab from the last control goes back to the first, and Shift+Tab the other way.
      const items = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null)
      if (items.length === 0) {
        event.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      const inside = active instanceof Node && dialogRef.current.contains(active)
      if (event.shiftKey && (active === first || !inside)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !inside)) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="cq-modal-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div ref={dialogRef} className={className} role={role} aria-modal="true" aria-labelledby={labelledBy} aria-label={label}>
        {children}
      </div>
    </div>
  )
}
