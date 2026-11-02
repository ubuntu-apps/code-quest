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

/**
 * A pop-up over the page: share, reminders, certificates, "Read more", confirmations. A tap
 * outside it or Escape closes it; keyboard focus moves into it when it opens and goes back
 * to where it was when it closes.
 */
export function Sheet({ className, onClose, labelledBy, label, role = 'dialog', initialFocus, children }: SheetProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const first = dialogRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ;(initialFocus?.current ?? first)?.focus()
    return () => previous?.focus()
  }, [initialFocus])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
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
