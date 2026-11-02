import type { ReactNode } from 'react'
import { DoorClosed, DoorClosedLocked, DoorOpen, Footprints, KeyRound, Swords } from 'lucide-react'
import type { LoadedSection, Level } from '../content/types'
import { loadProgress } from '../progress/progressStorage'
import { completedChallengeIds } from '../helpers'
import { CatalogListItem, StatusMeta, type ProgressStatus } from '../components/CatalogListItem'
import { TestOutPanel } from '../components/TestOutPanel'
import { hasTestedOut } from '../progress/testOut'

interface LearnLevelsProps {
  selectedSection: LoadedSection
  languageId: string
  isLevelUnlocked: (levels: Level[], index: number) => boolean
  /** Set when the section's prerequisite isn't met yet: why its levels are locked. */
  sectionLockedHint: string | null
  /** The section after this one (a test-out unlocks it), or null for the last section. */
  nextSectionTitle: string | null
  /** "Section complete" and its certificate (shows nothing until the section is finished). */
  certificate?: ReactNode
  onOpenLevel: (level: Level) => void
}

export function LearnLevels({
  selectedSection,
  languageId,
  isLevelUnlocked,
  sectionLockedHint,
  nextSectionTitle,
  certificate,
  onOpenLevel,
}: LearnLevelsProps) {
  return (
    <div className="cq-stack">
      <h1 className="cq-title">{selectedSection.sectionRef.title}</h1>
      {sectionLockedHint ? <p className="cq-muted cq-section-preview-note">{sectionLockedHint}</p> : null}
      {certificate}
      {/* Offered until every lesson quiz here is passed; after a test-out it says so. */}
      {(hasTestedOut(languageId, selectedSection.sectionRef.id) ||
        !selectedSection.file.levels
          .filter((lvl) => lvl.kind !== 'project')
          .every((lvl) => loadProgress(languageId, lvl.id).testPassed)) ? (
        <TestOutPanel languageId={languageId} section={selectedSection} nextSectionTitle={nextSectionTitle} />
      ) : null}
      <ul className="cq-card-list">
        {selectedSection.file.levels.map((lvl, lvlIndex) => {
          const levelIndex = selectedSection.file.levels.findIndex((v) => v.id === lvl.id)
          const locked = !isLevelUnlocked(selectedSection.file.levels, levelIndex)
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
                : 'Gate cleared'
              : status === 'challenges-done'
                ? 'Key found'
                : status === 'in-progress'
                  ? 'In progress'
                  : 'Not started'
          const statusDetails =
            status === 'challenges-done' ? 'clear the gate' : status === 'passed' && challengesDone ? undefined : challengeCount

          const isProject = lvl.kind === 'project'
          const projectLabel =
            lvl.projectDifficulty === 'easy' || lvl.projectDifficulty === 'medium'
              ? 'Required side quest'
              : lvl.projectDifficulty === 'hard'
                ? 'Optional side quest'
                : 'Side quest'
          const lessonNumber = selectedSection.file.levels.slice(0, lvlIndex + 1).filter((l) => l.kind !== 'project').length
          const lessonCount = selectedSection.file.levels.filter((l) => l.kind !== 'project').length
          const eyebrow = isProject ? (
            <>
              <Swords size={12} aria-hidden className="cq-eyebrow-icon" /> {projectLabel}
            </>
          ) : (
            `Stage ${lessonNumber} of ${lessonCount}`
          )
          // The stage's door: shut, on the way, key found (challenges done), open (gate cleared).
          const icon = locked ? (
            <DoorClosedLocked size={20} />
          ) : status === 'passed' ? (
            <DoorOpen size={20} />
          ) : status === 'challenges-done' ? (
            <KeyRound size={20} />
          ) : status === 'in-progress' ? (
            <Footprints size={20} />
          ) : (
            <DoorClosed size={20} />
          )
          const meta = locked ? (
            <span className="cq-card-meta">
              {sectionLockedHint ? 'Locked' : 'Locked · clear the previous gate to unlock'}
            </span>
          ) : (
            <StatusMeta status={status} label={statusLabel} details={statusDetails} />
          )

          return (
            <CatalogListItem
              key={lvl.id}
              title={lvl.title}
              onClick={() => {
                if (locked) return
                onOpenLevel(lvl)
              }}
              eyebrow={eyebrow}
              icon={icon}
              meta={meta}
              status={locked ? undefined : status}
              locked={locked}
              disabled={locked}
            />
          )
        })}
      </ul>
    </div>
  )
}
