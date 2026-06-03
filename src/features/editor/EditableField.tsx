import type { ReactNode } from 'react'
import { SimpleMarkdown } from '../curriculum/SimpleMarkdown'
import { useEditorMode } from './editorHooks'

interface EditableTextProps {
  value: string
  onChange: (value: string) => void
  className?: string
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p'
  placeholder?: string
}

export function EditableText({
  value,
  onChange,
  className,
  as: Tag = 'span',
  placeholder,
}: EditableTextProps) {
  const { canEdit, isEditingLocal } = useEditorMode()
  if (!canEdit || !isEditingLocal) {
    return <Tag className={className}>{value}</Tag>
  }
  return (
    <input
      type="text"
      className={`cq-editable-input${className ? ` ${className}` : ''}`}
      value={value}
      placeholder={placeholder}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

interface EditableTextareaProps {
  value: string
  onChange: (value: string) => void
  className?: string
  rows?: number
  label?: string
  placeholder?: string
}

export function EditableTextarea({
  value,
  onChange,
  className,
  rows = 4,
  label,
  placeholder,
}: EditableTextareaProps) {
  const { canEdit, isEditingLocal } = useEditorMode()
  if (!canEdit || !isEditingLocal) {
    return label ? (
      <div>
        {label && <div className="cq-label">{label}</div>}
        <pre className={className}>{value}</pre>
      </div>
    ) : (
      <pre className={className}>{value}</pre>
    )
  }
  return (
    <label className="cq-editable-field">
      {label && <span className="cq-label">{label}</span>}
      <textarea
        className={`cq-editable-textarea${className ? ` ${className}` : ''}`}
        rows={rows}
        value={value}
        placeholder={placeholder}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

interface EditableMarkdownProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function EditableMarkdown({ value, onChange, label }: EditableMarkdownProps) {
  const { canEdit, isEditingLocal } = useEditorMode()
  if (!canEdit || !isEditingLocal) {
    return <SimpleMarkdown text={value} />
  }
  return (
    <div className="cq-editable-markdown">
      {label && <div className="cq-label">{label}</div>}
      <textarea
        className="cq-editable-textarea cq-editable-textarea--markdown"
        rows={8}
        value={value}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
      />
      <details className="cq-editable-preview">
        <summary>Preview</summary>
        <SimpleMarkdown text={value} />
      </details>
    </div>
  )
}

interface EditableBlockProps {
  label: string
  children: ReactNode
}

export function EditableBlock({ label, children }: EditableBlockProps) {
  const { canEdit, isEditingLocal } = useEditorMode()
  if (!canEdit || !isEditingLocal) return null
  return (
    <div className="cq-editable-block">
      <div className="cq-editable-block-label">{label}</div>
      {children}
    </div>
  )
}
