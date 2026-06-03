import type { ReactNode } from 'react'
import { EditableText, ListEditorActions } from '../../editor'

interface CatalogListItemProps {
  title: string
  onTitleChange: (title: string) => void
  onClick: () => void
  meta?: ReactNode
  metaEditable?: {
    value: string
    onChange: (value: string) => void
  }
  progressPercent?: number
  progressAriaLabel?: string
  locked?: boolean
  disabled?: boolean
  listIndex: number
  listLength: number
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  confirmMessage: string
}

export function CatalogListItem({
  title,
  onTitleChange,
  onClick,
  meta,
  metaEditable,
  progressPercent,
  progressAriaLabel,
  locked = false,
  disabled = false,
  listIndex,
  listLength,
  onMoveUp,
  onMoveDown,
  onRemove,
  confirmMessage,
}: CatalogListItemProps) {
  return (
    <li className="cq-card-list-item">
      <div className="cq-card-row">
        <button
          type="button"
          className={`cq-card-btn${locked ? ' cq-card-btn--locked' : ''}`}
          disabled={disabled}
          onClick={onClick}
        >
          <EditableText
            className="cq-card-title"
            value={title}
            onChange={onTitleChange}
          />
          {metaEditable ? (
            <EditableText
              className="cq-card-meta"
              value={metaEditable.value}
              onChange={metaEditable.onChange}
            />
          ) : meta ? (
            meta
          ) : null}
          {progressPercent !== undefined && (
            <div className="cq-progress-bar" aria-label={progressAriaLabel}>
              <div className="cq-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          )}
        </button>
        <ListEditorActions
          canMoveUp={listIndex > 0}
          canMoveDown={listIndex < listLength - 1}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          confirmMessage={confirmMessage}
          onDelete={onRemove}
        />
      </div>
    </li>
  )
}
