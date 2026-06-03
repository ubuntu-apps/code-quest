import type { LanguageBundle, Level, RootIndex } from '../types'
import { loadProgress } from '../progressStorage'
import { useProgressVersion } from '../hooks/useProgressVersion'
import { EditableText } from '../../editor'

interface ProgressTabProps {
  displayRootIndex: RootIndex
  bundles: Record<string, LanguageBundle>
  resolveBundle: (langId: string, fallback: LanguageBundle | undefined) => LanguageBundle | null
  onUpdateLevelTitle: (langId: string, sectionId: string, levelId: string, title: string) => void
}

export function ProgressTab({
  displayRootIndex,
  bundles,
  resolveBundle,
  onUpdateLevelTitle,
}: ProgressTabProps) {
  useProgressVersion()

  const rows: {
    langId: string
    lang: string
    sectionId: string
    section: string
    level: Level
  }[] = []

  for (const lang of displayRootIndex.languages) {
    const b = resolveBundle(lang.id, bundles[lang.id]) ?? bundles[lang.id]
    if (!b) continue
    for (const { sectionRef, file } of b.sections) {
      for (const lvl of file.levels) {
        rows.push({
          langId: lang.id,
          lang: lang.title,
          sectionId: sectionRef.id,
          section: sectionRef.title,
          level: lvl,
        })
      }
    }
  }

  return (
    <div className="cq-stack">
      <h1 className="cq-title">Progress</h1>
      <p className="cq-lead">Stored only on this device (`localStorage`).</p>
      <ul className="cq-progress-list">
        {rows.map((r) => {
          const prog = loadProgress(r.langId, r.level.id)
          const totalCh = r.level.challenges.length
          const chDone = prog.challengesCompleted.length
          const challengesOk = totalCh === 0 || chDone >= totalCh
          return (
            <li key={`${r.level.id}-${r.section}`} className="cq-progress-row">
              <div>
                <EditableText
                  className="cq-progress-title"
                  value={r.level.title}
                  onChange={(title) => onUpdateLevelTitle(r.langId, r.sectionId, r.level.id, title)}
                />
                <div className="cq-progress-meta">
                  {r.lang} · {r.section}
                </div>
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
