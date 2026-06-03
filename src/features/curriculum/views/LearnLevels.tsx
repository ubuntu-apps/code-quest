import type { LoadedSection, Level } from '../types'
import { loadProgress } from '../progressStorage'
import { AddItemButton, EditableText } from '../../editor'
import { CatalogListItem } from '../components/CatalogListItem'

interface LearnLevelsProps {
  selectedSection: LoadedSection
  languageId: string
  isEditMode: boolean
  isLevelUnlocked: (levels: Level[], index: number) => boolean
  onOpenLevel: (level: Level) => void
  onUpdateSectionTitle: (title: string) => void
  onUpdateLevelTitle: (levelId: string, title: string) => void
  onMoveLevel: (levelId: string, direction: -1 | 1) => void
  onRemoveLevel: (levelId: string) => void
  onAddLevel: () => void
}

export function LearnLevels({
  selectedSection,
  languageId,
  isEditMode,
  isLevelUnlocked,
  onOpenLevel,
  onUpdateSectionTitle,
  onUpdateLevelTitle,
  onMoveLevel,
  onRemoveLevel,
  onAddLevel,
}: LearnLevelsProps) {
  return (
    <div className="cq-stack">
      <EditableText
        as="h1"
        className="cq-title"
        value={selectedSection.sectionRef.title}
        onChange={onUpdateSectionTitle}
      />
      <ul className="cq-card-list">
        {selectedSection.file.levels.map((lvl, lvlIndex) => {
          const levelIndex = selectedSection.file.levels.findIndex((v) => v.id === lvl.id)
          const locked = !isEditMode && !isLevelUnlocked(selectedSection.file.levels, levelIndex)
          const p = loadProgress(languageId, lvl.id)
          const challengesDone =
            lvl.challenges.length === 0 ||
            lvl.challenges.every((c) => p.challengesCompleted.includes(c.id))
          const done = challengesDone && p.testPassed
          const partial = !done && (p.challengesCompleted.length > 0 || p.testPassed)

          const statusMeta = locked
            ? 'Locked · pass previous test to unlock'
            : done
              ? 'Completed'
              : partial
                ? 'In progress'
                : 'Not started'

          return (
            <CatalogListItem
              key={lvl.id}
              title={lvl.title}
              onTitleChange={(title) => onUpdateLevelTitle(lvl.id, title)}
              onClick={() => {
                if (locked && !isEditMode) return
                onOpenLevel(lvl)
              }}
              meta={<span className="cq-card-meta">{statusMeta}</span>}
              locked={locked}
              disabled={locked}
              listIndex={lvlIndex}
              listLength={selectedSection.file.levels.length}
              onMoveUp={() => onMoveLevel(lvl.id, -1)}
              onMoveDown={() => onMoveLevel(lvl.id, 1)}
              onRemove={() => onRemoveLevel(lvl.id)}
              confirmMessage={`Delete level "${lvl.title}"?`}
            />
          )
        })}
      </ul>
      <AddItemButton label="Add level" onClick={onAddLevel} />
    </div>
  )
}
