import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  open: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, message, onConfirm, onCancel }: ConfirmDialogProps) {
  const noRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    noRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="cq-modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="cq-modal cq-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="cq-confirm-msg">
        <div className="cq-modal-header">
          <div className="cq-modal-title">Confirm delete</div>
        </div>
        <p id="cq-confirm-msg" className="cq-confirm-message">
          {message}
        </p>
        <div className="cq-modal-actions cq-confirm-actions">
          <button ref={noRef} type="button" className="cq-btn cq-btn--primary" onClick={onCancel}>
            No
          </button>
          <button type="button" className="cq-btn cq-btn--danger" onClick={onConfirm}>
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  )
}
