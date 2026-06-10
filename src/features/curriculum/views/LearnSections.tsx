import type { LanguageBundle } from '../types'
import { computeLevelXp } from '../helpers'
import { loadProgress } from '../progressStorage'
import { AddItemButton, EditableText } from '../../editor'
import { CatalogListItem } from '../components/CatalogListItem'

interface LearnSectionsProps {
  bundle: LanguageBundle
  languageId: string | null
  isEditMode: boolean
  isSectionUnlocked: (sectionIndex: number) => boolean
  onSelectSection: (sectionId: string) => void
  onUpdateLanguageTitle: (title: string) => void
  onUpdateSectionTitle: (sectionId: string, title: string, options?: { commit?: boolean }) => void
  onMoveSection: (sectionId: string, direction: -1 | 1) => void
  onRemoveSection: (sectionId: string) => void
  onAddSection: () => void
}

export function LearnSections({
  bundle,
  languageId,
  isEditMode,
  isSectionUnlocked,
  onSelectSection,
  onUpdateLanguageTitle,
  onUpdateSectionTitle,
  onMoveSection,
  onRemoveSection,
  onAddSection,
}: LearnSectionsProps) {
  return (
    <div className="cq-stack">
      <EditableText
        as="h1"
        className="cq-title"
        value={bundle.index.title}
        onChange={onUpdateLanguageTitle}
      />
      <p className="cq-lead">Sections</p>
      <ul className="cq-card-list">
        {bundle.index.sections.map((sec, secIndex) => {
          const loaded = bundle.sections.find((s) => s.sectionRef.id === sec.id)
          const levels = loaded?.file.levels ?? []
          const completedCount =
            languageId && levels.length > 0
              ? levels.filter((lvl) => loadProgress(languageId, lvl.id).testPassed).length
              : 0
          const pct = levels.length > 0 ? Math.round((completedCount / levels.length) * 100) : 0
          const sectionXp =
            languageId && levels.length > 0
              ? levels.reduce((sum, lvl) => sum + computeLevelXp(languageId, lvl), 0)
              : 0
          const locked = !isEditMode && !isSectionUnlocked(secIndex)
          const statusMeta = locked
            ? 'Locked · complete easy and medium projects in the previous section'
            : `${completedCount}/${levels.length} levels complete · ${sectionXp} XP`

          return (
            <CatalogListItem
              key={sec.id}
              title={sec.title}
              titlePlaceholder="Section title"
              onTitleChange={(title) => onUpdateSectionTitle(sec.id, title)}
              onTitleCommit={(title) => onUpdateSectionTitle(sec.id, title, { commit: true })}
              onClick={() => {
                if (locked) return
                onSelectSection(sec.id)
              }}
              meta={<span className="cq-card-meta">{statusMeta}</span>}
              locked={locked}
              disabled={locked}
              progressPercent={pct}
              progressAriaLabel={`${sec.title} progress`}
              listIndex={secIndex}
              listLength={bundle.index.sections.length}
              onMoveUp={() => onMoveSection(sec.id, -1)}
              onMoveDown={() => onMoveSection(sec.id, 1)}
              onRemove={() => onRemoveSection(sec.id)}
              confirmMessage={`Delete section "${sec.title}"?`}
            />
          )
        })}
      </ul>
      {languageId && <AddItemButton label="Add section" onClick={onAddSection} />}
    </div>
  )
}
