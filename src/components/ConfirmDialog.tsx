import { useRef } from 'react'
import { Sheet } from './Sheet'

/** What the dialog's heading and Yes button say. */
export interface ConfirmOptions {
  title?: string
  confirmLabel?: string
}

interface ConfirmDialogProps extends ConfirmOptions {
  open: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  message,
  title = 'Are you sure?',
  confirmLabel = 'Yes',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const noRef = useRef<HTMLButtonElement>(null)
  if (!open) return null
  return (
    <Sheet className="cq-modal cq-confirm-dialog" role="alertdialog" labelledBy="cq-confirm-msg" initialFocus={noRef} onClose={onCancel}>
      <div className="cq-modal-header">
        <div className="cq-modal-title">{title}</div>
      </div>
      <p id="cq-confirm-msg" className="cq-confirm-message">
        {message}
      </p>
      <div className="cq-modal-actions cq-confirm-actions">
        <button ref={noRef} type="button" className="cq-btn cq-btn--primary" onClick={onCancel}>
          No
        </button>
        <button type="button" className="cq-btn cq-btn--danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Sheet>
  )
}
