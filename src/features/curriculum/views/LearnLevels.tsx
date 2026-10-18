import type { LoadedSection, Level } from '../types'
import { loadProgress } from '../progressStorage'
import { completedChallengeIds } from '../helpers'
import { AddItemButton, EditableText } from '../../editor'
import { CatalogListItem } from '../components/CatalogListItem'
import { TestOutPanel } from '../components/TestOutPanel'
import { hasTestedOut } from '../testOut'

interface LearnLevelsProps {
  selectedSection: LoadedSection
  languageId: string
  isEditMode: boolean
  isLevelUnlocked: (levels: Level[], index: number) => boolean
  /** Set when the section's prerequisite isn't met yet: why its levels are locked. */
  sectionLockedHint: string | null
  /** The section after this one (a test-out unlocks it), or null for the last section. */
  nextSectionTitle: string | null
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
  sectionLockedHint,
  nextSectionTitle,
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
      {sectionLockedHint && !isEditMode ? <p className="cq-muted cq-section-preview-note">{sectionLockedHint}</p> : null}
      {/* Offered until every lesson quiz here is passed; after a test-out it says so. */}
      {!isEditMode &&
      (hasTestedOut(languageId, selectedSection.sectionRef.id) ||
        !selectedSection.file.levels
          .filter((lvl) => lvl.kind !== 'project')
          .every((lvl) => loadProgress(languageId, lvl.id).testPassed)) ? (
        <TestOutPanel languageId={languageId} section={selectedSection} nextSectionTitle={nextSectionTitle} />
      ) : null}
      <ul className="cq-card-list">
        {selectedSection.file.levels.map((lvl, lvlIndex) => {
          const levelIndex = selectedSection.file.levels.findIndex((v) => v.id === lvl.id)
          const locked = !isEditMode && !isLevelUnlocked(selectedSection.file.levels, levelIndex)
          const p = loadProgress(languageId, lvl.id)
          const challengesDone =
            lvl.challenges.length === 0 ||
            lvl.challenges.every((c) => p.challengesCompleted.includes(c.id))
          const done = challengesDone && p.testPassed
          const partial = !done && (completedChallengeIds(lvl, p.challengesCompleted).length > 0 || p.testPassed)

          const isProject = lvl.kind === 'project'
          const projectLabel =
            lvl.projectDifficulty === 'easy' || lvl.projectDifficulty === 'medium'
              ? 'Required project'
              : lvl.projectDifficulty === 'hard'
                ? 'Optional project'
                : 'Project'
          const statusMeta = locked
            ? sectionLockedHint
              ? 'Locked'
              : 'Locked · pass previous test to unlock'
            : done
              ? isProject
                ? `${projectLabel} · completed`
                : 'Completed'
              : partial
                ? isProject
                  ? `${projectLabel} · in progress`
                  : 'In progress'
                : isProject
                  ? `${projectLabel} · not started`
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
