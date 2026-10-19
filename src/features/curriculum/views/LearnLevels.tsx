import type { LoadedSection, Level } from '../types'
import { loadProgress } from '../progressStorage'
import { completedChallengeIds } from '../helpers'
import { AddItemButton, EditableText } from '../../editor'
import { CatalogListItem, StatusMeta, type ProgressStatus } from '../components/CatalogListItem'
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
          const solved = completedChallengeIds(lvl, p.challengesCompleted).length
          const total = lvl.challenges.length
          const challengesDone = total === 0 || solved === total
          const challengeCount = total > 0 ? `${solved}/${total} challenges` : undefined

          // Not started → in progress → all challenges solved → quiz passed (each with its colour).
          const status: ProgressStatus = p.testPassed
            ? 'passed'
            : challengesDone && total > 0
              ? 'challenges-done'
              : solved > 0
                ? 'in-progress'
                : 'not-started'
          const statusLabel =
            status === 'passed'
              ? challengesDone
                ? 'Completed'
                : 'Quiz passed'
              : status === 'challenges-done'
                ? 'Challenges done'
                : status === 'in-progress'
                  ? 'In progress'
                  : 'Not started'
          const statusDetails =
            status === 'challenges-done' ? 'take the quiz' : status === 'passed' && challengesDone ? undefined : challengeCount

          const isProject = lvl.kind === 'project'
          const projectLabel =
            lvl.projectDifficulty === 'easy' || lvl.projectDifficulty === 'medium'
              ? 'Required project'
              : lvl.projectDifficulty === 'hard'
                ? 'Optional project'
                : 'Project'
          const lessonNumber = selectedSection.file.levels.slice(0, lvlIndex + 1).filter((l) => l.kind !== 'project').length
          const lessonCount = selectedSection.file.levels.filter((l) => l.kind !== 'project').length
          const eyebrow = isProject ? projectLabel : `Lesson ${lessonNumber} of ${lessonCount}`
          const meta = locked ? (
            <span className="cq-card-meta">
              {sectionLockedHint ? 'Locked' : 'Locked · pass the previous quiz to unlock'}
            </span>
          ) : (
            <StatusMeta status={status} label={statusLabel} details={statusDetails} />
          )

          return (
            <CatalogListItem
              key={lvl.id}
              title={lvl.title}
              onTitleChange={(title) => onUpdateLevelTitle(lvl.id, title)}
              onClick={() => {
                if (locked && !isEditMode) return
                onOpenLevel(lvl)
              }}
              eyebrow={eyebrow}
              meta={meta}
              status={locked ? undefined : status}
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
