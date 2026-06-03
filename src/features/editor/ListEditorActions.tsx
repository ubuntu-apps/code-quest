import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { useEditorConfirm, useEditorMode } from './editorHooks'

interface ListEditorActionsProps {
  canMoveUp?: boolean
  canMoveDown?: boolean
  onMoveUp?: () => void
  onMoveDown?: () => void
  confirmMessage?: string
  onDelete?: () => void
}

export function ListEditorActions({
  canMoveUp = true,
  canMoveDown = true,
  onMoveUp,
  onMoveDown,
  confirmMessage = 'Delete this item?',
  onDelete,
}: ListEditorActionsProps) {
  const { isEditMode } = useEditorMode()
  const { requestConfirm } = useEditorConfirm()
  if (!isEditMode) return null

  const stop = (e: React.MouseEvent) => e.stopPropagation()

  const handleDelete = async (e: React.MouseEvent) => {
    stop(e)
    if (!onDelete) return
    const ok = await requestConfirm(confirmMessage)
    if (ok) onDelete()
  }

  return (
    <div className="cq-list-editor-actions" onClick={stop}>
      {onMoveUp && (
        <button
          type="button"
          className="cq-list-editor-btn"
          aria-label="Move up"
          disabled={!canMoveUp}
          onClick={(e) => {
            stop(e)
            onMoveUp()
          }}
        >
          <ChevronUp size={16} />
        </button>
      )}
      {onMoveDown && (
        <button
          type="button"
          className="cq-list-editor-btn"
          aria-label="Move down"
          disabled={!canMoveDown}
          onClick={(e) => {
            stop(e)
            onMoveDown()
          }}
        >
          <ChevronDown size={16} />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          className="cq-list-editor-btn cq-list-editor-btn--danger"
          aria-label="Delete"
          onClick={handleDelete}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  )
}

interface AddItemButtonProps {
  label: string
  onClick: () => void
}

export function AddItemButton({ label, onClick }: AddItemButtonProps) {
  const { isEditMode } = useEditorMode()
  if (!isEditMode) return null

  return (
    <button type="button" className="cq-btn cq-add-item-btn" onClick={onClick}>
      <Plus size={16} />
      {label}
    </button>
  )
}
