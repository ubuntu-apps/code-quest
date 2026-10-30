import { Compass, LockKeyhole, Map as MapIcon, Mountain, Trophy } from 'lucide-react'
import type { LanguageBundle } from '../types'
import { computeLevelXp, sectionUnlockHint } from '../helpers'
import { loadProgress } from '../progressStorage'
import { AddItemButton, EditableText } from '../../editor'
import { CatalogListItem, StatusMeta, type ProgressStatus } from '../components/CatalogListItem'
import { hasTestedOut } from '../testOut'
import { courseCompletion } from '../../certificate/courseCompletion'
import { CertificatePanel } from '../../certificate/CertificatePanel'
import { SupportNudge } from '../../support/SupportNudge'
import { courseRank } from '../../ranks/ranks'
import { CourseRankBadge } from '../../ranks/CourseRankBadge'

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
  baseUrl: string
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
  baseUrl,
}: LearnSectionsProps) {
  const completion = languageId && !isEditMode ? courseCompletion(languageId, bundle) : null
  const rank = languageId && !isEditMode ? courseRank(languageId, bundle) : null
  // Sections still being written are listed last, without lessons.
  const upcoming = bundle.index.upcoming ?? []
  const sectionCount = bundle.index.sections.length + upcoming.length
  return (
    <div className="cq-stack">
      <div className="cq-course-head">
        <EditableText
          as="h1"
          className="cq-title"
          value={bundle.index.title}
          onChange={onUpdateLanguageTitle}
        />
        {rank ? <CourseRankBadge rank={rank} courseTitle={bundle.index.title} /> : null}
      </div>
      <p className="cq-lead">Quests</p>
      {completion && languageId ? (
        <SupportNudge
          languageId={languageId}
          sectionsFinished={completion.sectionsFinished}
          finishedTitle={completion.lastFinishedTitle}
        />
      ) : null}
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
          // A section whose prerequisite isn't met can still be opened to look inside;
          // its levels stay locked.
          const testedOut = languageId ? hasTestedOut(languageId, sec.id) : false
          const previewOnly = !isEditMode && !isSectionUnlocked(secIndex) && !testedOut
          const previousRef = bundle.index.sections[secIndex - 1]
          const previousLevels =
            bundle.sections.find((s) => s.sectionRef.id === previousRef?.id)?.file.levels ?? []
          const finished = testedOut || (levels.length > 0 && completedCount === levels.length)
          const status: ProgressStatus = finished
            ? 'passed'
            : completedCount > 0 || sectionXp > 0
              ? 'in-progress'
              : 'not-started'
          const statusLabel = finished
            ? testedOut && completedCount < levels.length
              ? 'Skipped ahead'
              : 'Completed'
            : status === 'in-progress'
              ? 'In progress'
              : 'Not started'
          const meta = previewOnly ? (
            <span className="cq-card-meta">
              {sectionUnlockHint(previousLevels, previousRef?.title ?? 'the previous quest')}
            </span>
          ) : (
            <StatusMeta
              status={status}
              label={statusLabel}
              details={`${completedCount}/${levels.length} stages complete · ${sectionXp} XP`}
            />
          )

          return (
            <CatalogListItem
              key={sec.id}
              title={sec.title}
              titlePlaceholder="Quest title"
              onTitleChange={(title) => onUpdateSectionTitle(sec.id, title)}
              onTitleCommit={(title) => onUpdateSectionTitle(sec.id, title, { commit: true })}
              onClick={() => onSelectSection(sec.id)}
              eyebrow={`Quest ${secIndex + 1} of ${sectionCount}`}
              icon={
                previewOnly ? (
                  <LockKeyhole size={20} />
                ) : status === 'passed' ? (
                  <Trophy size={20} />
                ) : status === 'in-progress' ? (
                  <Compass size={20} />
                ) : (
                  <MapIcon size={20} />
                )
              }
              meta={meta}
              status={previewOnly ? undefined : status}
              progressPercent={pct}
              listIndex={secIndex}
              listLength={bundle.index.sections.length}
              onMoveUp={() => onMoveSection(sec.id, -1)}
              onMoveDown={() => onMoveSection(sec.id, 1)}
              onRemove={() => onRemoveSection(sec.id)}
              confirmMessage={`Delete quest "${sec.title}"?`}
            />
          )
        })}
        {upcoming.map((sec, i) => (
          <li key={sec.id} className="cq-card-list-item">
            <div className="cq-card-row">
              <div className="cq-card-btn cq-card-btn--with-icon cq-card-btn--locked cq-card-btn--soon" aria-disabled="true">
                <span className="cq-card-body">
                  <span className="cq-card-eyebrow">{`Quest ${bundle.index.sections.length + i + 1} of ${sectionCount}`}</span>
                  <span className="cq-card-title">{sec.title}</span>
                  <span className="cq-card-meta">Coming soon</span>
                </span>
                <span className="cq-card-icon" aria-hidden="true">
                  <Mountain size={20} />
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {languageId && <AddItemButton label="Add quest" onClick={onAddSection} />}
      {completion && languageId ? (
        <CertificatePanel
          languageId={languageId}
          bundle={bundle}
          completion={completion}
          baseUrl={baseUrl}
        />
      ) : null}
    </div>
  )
}
