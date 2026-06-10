import type { LanguageBundle, Level, RootIndex } from '../types'
import { loadProgress } from '../progressStorage'
import { useProgressVersion } from '../hooks/useProgressVersion'
import {
  computeSectionXp,
  getSectionProgressStatus,
  type SectionProgressStatus,
} from '../helpers'
import { EditableText } from '../../editor'

interface ProgressTabProps {
  displayRootIndex: RootIndex
  bundles: Record<string, LanguageBundle>
  resolveBundle: (langId: string, fallback: LanguageBundle | undefined) => LanguageBundle | null
  languageId?: string | null
  onUpdateSectionTitle: (langId: string, sectionId: string, title: string) => void
  onUpdateLevelTitle: (langId: string, sectionId: string, levelId: string, title: string) => void
}

type ProgressListItem =
  | {
      kind: 'section'
      key: string
      langId: string
      lang: string
      sectionId: string
      section: string
      levelCount: number
      status: SectionProgressStatus
      completedCount: number
      sectionXp: number
    }
  | {
      kind: 'section-header'
      key: string
      langId: string
      lang: string
      sectionId: string
      section: string
      levelCount: number
      completedCount: number
      sectionXp: number
    }
  | {
      kind: 'topic'
      key: string
      langId: string
      sectionId: string
      level: Level
    }

export function ProgressTab({
  displayRootIndex,
  bundles,
  resolveBundle,
  languageId,
  onUpdateSectionTitle,
  onUpdateLevelTitle,
}: ProgressTabProps) {
  useProgressVersion()

  const languages = languageId
    ? displayRootIndex.languages.filter((lang) => lang.id === languageId)
    : displayRootIndex.languages
  const languageTitle = languageId
    ? displayRootIndex.languages.find((lang) => lang.id === languageId)?.title
    : null

  const items: ProgressListItem[] = []

  for (const lang of languages) {
    const b = resolveBundle(lang.id, bundles[lang.id]) ?? bundles[lang.id]
    if (!b) continue
    for (const { sectionRef, file } of b.sections) {
      const levels = file.levels
      const status = getSectionProgressStatus(lang.id, levels)

      if (status === 'in_progress') {
        const completedCount = levels.filter(
          (level) => loadProgress(lang.id, level.id).testPassed,
        ).length

        items.push({
          kind: 'section-header',
          key: `${lang.id}-${sectionRef.id}-header`,
          langId: lang.id,
          lang: lang.title,
          sectionId: sectionRef.id,
          section: sectionRef.title,
          levelCount: levels.length,
          completedCount,
          sectionXp: computeSectionXp(lang.id, levels),
        })

        for (const level of levels) {
          items.push({
            kind: 'topic',
            key: `${lang.id}-${sectionRef.id}-${level.id}`,
            langId: lang.id,
            sectionId: sectionRef.id,
            level,
          })
        }
        continue
      }

      const completedCount = levels.filter(
        (level) => loadProgress(lang.id, level.id).testPassed,
      ).length

      items.push({
        kind: 'section',
        key: `${lang.id}-${sectionRef.id}`,
        langId: lang.id,
        lang: lang.title,
        sectionId: sectionRef.id,
        section: sectionRef.title,
        levelCount: levels.length,
        status,
        completedCount,
        sectionXp: computeSectionXp(lang.id, levels),
      })
    }
  }

  return (
    <div className="cq-stack">
      <h1 className="cq-title">Progress</h1>
      <p className="cq-lead">
        {languageTitle
          ? `${languageTitle} only · stored on this device (localStorage).`
          : 'Stored only on this device (`localStorage`).'}
      </p>
      {languageId && languages.length === 0 && (
        <p className="cq-panel cq-muted">Language not found in catalog.</p>
      )}
      <ul className="cq-progress-list">
        {items.map((item) => {
          if (item.kind === 'section' || item.kind === 'section-header') {
            const statusLabel =
              item.kind === 'section-header'
                ? 'In progress'
                : item.status === 'complete'
                  ? 'Complete'
                  : item.levelCount === 0
                    ? 'Empty'
                    : 'Not started'

            return (
              <li
                key={item.key}
                className={`cq-progress-row cq-progress-row--section${
                  item.kind === 'section-header' ? ' cq-progress-row--section-header' : ''
                }`}
              >
                <div>
                  <EditableText
                    className="cq-progress-title"
                    value={item.section}
                    onChange={(title) =>
                      onUpdateSectionTitle(item.langId, item.sectionId, title)
                    }
                  />
                  {!languageId && <div className="cq-progress-meta">{item.lang}</div>}
                </div>
                <div className="cq-progress-tags">
                  <span
                    className={
                      item.kind === 'section' && item.status === 'complete'
                        ? 'cq-tag cq-tag--ok'
                        : 'cq-tag'
                    }
                  >
                    {statusLabel}
                  </span>
                  {item.levelCount > 0 && (
                    <span className="cq-tag">
                      {item.completedCount}/{item.levelCount} topics
                    </span>
                  )}
                  {item.sectionXp > 0 && (
                    <span className="cq-tag cq-tag--ok">{item.sectionXp} XP</span>
                  )}
                </div>
              </li>
            )
          }

          const prog = loadProgress(item.langId, item.level.id)
          const totalCh = item.level.challenges.length
          const chDone = prog.challengesCompleted.length
          const challengesOk = totalCh === 0 || chDone >= totalCh

          return (
            <li key={item.key} className="cq-progress-row cq-progress-row--topic">
              <div>
                <EditableText
                  className="cq-progress-title"
                  value={item.level.title}
                  onChange={(title) =>
                    onUpdateLevelTitle(item.langId, item.sectionId, item.level.id, title)
                  }
                />
              </div>
              <div className="cq-progress-tags">
                <span className={challengesOk ? 'cq-tag cq-tag--ok' : 'cq-tag'}>
                  Challenges {Math.min(chDone, totalCh)}/{totalCh}
                </span>
                <span className={prog.testPassed ? 'cq-tag cq-tag--ok' : 'cq-tag'}>
                  Test {prog.testPassed ? 'passed' : 'open'}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
