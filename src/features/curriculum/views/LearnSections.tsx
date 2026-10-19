import type { LanguageBundle } from '../types'
import { computeLevelXp, sectionUnlockHint } from '../helpers'
import { loadProgress } from '../progressStorage'
import { AddItemButton, EditableText } from '../../editor'
import { CatalogListItem, StatusMeta, type ProgressStatus } from '../components/CatalogListItem'
import { hasTestedOut } from '../testOut'
import { courseCompletion } from '../../certificate/courseCompletion'
import { CertificatePanel } from '../../certificate/CertificatePanel'
import { SupportNudge } from '../../support/SupportNudge'

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
  return (
    <div className="cq-stack">
      <EditableText
        as="h1"
        className="cq-title"
        value={bundle.index.title}
        onChange={onUpdateLanguageTitle}
      />
      <p className="cq-lead">Sections</p>
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
              ? 'Tested out'
              : 'Completed'
            : status === 'in-progress'
              ? 'In progress'
              : 'Not started'
          const meta = previewOnly ? (
            <span className="cq-card-meta">
              {sectionUnlockHint(previousLevels, previousRef?.title ?? 'the previous section')}
            </span>
          ) : (
            <StatusMeta
              status={status}
              label={statusLabel}
              details={`${completedCount}/${levels.length} levels complete · ${sectionXp} XP`}
            />
          )

          return (
            <CatalogListItem
              key={sec.id}
              title={sec.title}
              titlePlaceholder="Section title"
              onTitleChange={(title) => onUpdateSectionTitle(sec.id, title)}
              onTitleCommit={(title) => onUpdateSectionTitle(sec.id, title, { commit: true })}
              onClick={() => onSelectSection(sec.id)}
              eyebrow={`Section ${secIndex + 1} of ${bundle.index.sections.length}`}
              meta={meta}
              status={previewOnly ? undefined : status}
              progressPercent={pct}
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
      {completion && languageId ? (
        <CertificatePanel
          languageId={languageId}
          courseTitle={bundle.index.title}
          completion={completion}
          baseUrl={baseUrl}
        />
      ) : null}
    </div>
  )
}
