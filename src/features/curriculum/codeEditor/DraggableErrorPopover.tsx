import { GripVertical, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { codeEditorPopoverTop } from './codeEditorLayout'

export type DraggableErrorPopoverProps = {
  /** Short label from friendly error (e.g. "Syntax error") */
  heading: string
  summaryText: string
  /** 1-based line index (positions popover below this line) */
  errorLine: number
  /** Optional 1-based column index in the same line */
  errorColumn?: number | null
  summaryId: string
  titleId: string
  onClose: () => void
}

export function DraggableErrorPopover({
  heading,
  summaryText,
  errorLine,
  errorColumn,
  summaryId,
  titleId,
  onClose,
}: DraggableErrorPopoverProps) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  const onDragHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: dragOffset.x,
      originY: dragOffset.y,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onDragHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current
    if (!d || e.pointerId !== d.pointerId) return
    setDragOffset({
      x: d.originX + (e.clientX - d.startX),
      y: d.originY + (e.clientY - d.startY),
    })
  }

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current
    if (!d || e.pointerId !== d.pointerId) return
    dragRef.current = null
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
  }

  const dragged = dragOffset.x !== 0 || dragOffset.y !== 0

  return (
    <div
      className={`cq-code-error-popover cq-code-error-tooltip--floating${
        dragged ? ' cq-code-error-popover--dragged' : ''
      }`}
      id={summaryId}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      style={{
        top: codeEditorPopoverTop(errorLine),
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
      }}
    >
      <div
        className="cq-code-error-popover-handle"
        onPointerDown={onDragHandlePointerDown}
        onPointerMove={onDragHandlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <span className="cq-code-error-popover-grip" aria-hidden>
          <GripVertical size={16} strokeWidth={2} />
        </span>
        <span id={titleId} className="cq-code-error-popover-title">
          {heading}
        </span>
        <button
          type="button"
          className="cq-code-error-popover-close cq-icon-btn"
          aria-label="Close error message"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>
      <div className="cq-code-error-popover-body">{summaryText}</div>
      <div className="cq-code-error-popover-meta">
        Line {errorLine}
        {errorColumn ? `, Col ${errorColumn}` : ''}
      </div>
    </div>
  )
}
