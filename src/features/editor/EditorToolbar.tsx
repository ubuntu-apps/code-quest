import { Download, Pencil, X } from 'lucide-react'
import { useEditor } from './EditorContext'

interface EditorToolbarProps {
  languageId?: string | null
  sectionId?: string | null
}

export function EditorHeaderButton() {
  const { canEdit, isEditMode, toggleEditMode } = useEditor()
  if (!canEdit) return <span className="cq-header-spacer" aria-hidden />

  return (
    <button
      type="button"
      className={`cq-edit-toggle${isEditMode ? ' cq-edit-toggle--active' : ''}`}
      onClick={toggleEditMode}
      aria-label={isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
      aria-pressed={isEditMode}
    >
      {isEditMode ? <X size={20} /> : <Pencil size={20} />}
    </button>
  )
}

export function EditorToolbar({ languageId, sectionId }: EditorToolbarProps) {
  const { isEditMode, exportRootIndex, exportLanguageIndex, exportSection } = useEditor()
  if (!isEditMode) return null

  return (
    <div className="cq-edit-banner" role="status">
      <span className="cq-edit-banner-label">Edit mode</span>
      <div className="cq-edit-banner-actions">
        <button type="button" className="cq-btn cq-btn--sm" onClick={exportRootIndex}>
          <Download size={14} />
          index.json
        </button>
        {languageId && (
          <button
            type="button"
            className="cq-btn cq-btn--sm"
            onClick={() => exportLanguageIndex(languageId)}
          >
            <Download size={14} />
            {languageId}/index.json
          </button>
        )}
        {languageId && sectionId && (
          <button
            type="button"
            className="cq-btn cq-btn--sm"
            onClick={() => exportSection(languageId, sectionId)}
          >
            <Download size={14} />
            section JSON
          </button>
        )}
      </div>
    </div>
  )
}
