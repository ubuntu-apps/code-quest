import { Flame, Play, Zap } from 'lucide-react'
import type { RootIndex } from '../types'
import type { ContentSource } from '../../editor/curriculumDraftStorage'
import { AddItemButton } from '../../editor'
import { EditableText } from '../../editor'
import { CatalogListItem } from '../components/CatalogListItem'
import { ContentSourceToggle } from '../components/ContentSourceToggle'

export interface ContinueTarget {
  languageId: string
  languagePath: string
  sectionId: string
  levelId: string
}

interface LearnHomeProps {
  displayRootIndex: RootIndex
  continueTarget: ContinueTarget | null
  xpLevel: number
  xpCurrentLevel: number
  totalXp: number
  streakCount: number
  homeLead: string
  isEditMode: boolean
  contentSource: ContentSource
  onContentSourceChange: (source: ContentSource) => void
  onImportFromGitHub?: () => void
  onContinue: () => void
  onOpenLanguage: (path: string, id: string) => void
  onUpdateHomeLead: (text: string) => void
  onUpdateLanguage: (langId: string, patch: { title?: string; id?: string }) => void
  onMoveLanguage: (langId: string, direction: -1 | 1) => void
  onRemoveLanguage: (langId: string) => void
  onAddLanguage: () => void
}

export function LearnHome({
  displayRootIndex,
  continueTarget,
  xpLevel,
  xpCurrentLevel,
  totalXp,
  streakCount,
  homeLead,
  isEditMode,
  contentSource,
  onContentSourceChange,
  onImportFromGitHub,
  onContinue,
  onOpenLanguage,
  onUpdateHomeLead,
  onUpdateLanguage,
  onMoveLanguage,
  onRemoveLanguage,
  onAddLanguage,
}: LearnHomeProps) {
  return (
    <div className="cq-stack">
      <h1 className="cq-title">Home</h1>
      {isEditMode && (
        <ContentSourceToggle
          contentSource={contentSource}
          onChange={onContentSourceChange}
          onImportFromGitHub={onImportFromGitHub}
        />
      )}
      <div className="cq-panel cq-home-panel">
        <button
          type="button"
          className="cq-btn cq-btn--primary cq-continue-btn"
          onClick={onContinue}
          disabled={!continueTarget}
        >
          <Play size={16} />
          Continue your Quest
        </button>
        <div className="cq-home-kpis">
          <div className="cq-kpi">
            <div className="cq-kpi-label">
              <Zap size={14} />
              XP
            </div>
            <div className="cq-kpi-value">Level {xpLevel}</div>
            <div className="cq-progress-bar" aria-label="XP progress">
              <div className="cq-progress-bar-fill" style={{ width: `${xpCurrentLevel}%` }} />
            </div>
            <div className="cq-kpi-muted">
              {xpCurrentLevel}/100 · {totalXp} total XP
            </div>
          </div>
          <div className="cq-kpi">
            <div className="cq-kpi-label">
              <Flame size={14} />
              Daily streak
            </div>
            <div className="cq-kpi-value">
              {streakCount} day{streakCount === 1 ? '' : 's'}
            </div>
            <div className="cq-kpi-muted">Complete any challenge or test to keep streak alive.</div>
          </div>
        </div>
      </div>
      <EditableText as="p" className="cq-lead" value={homeLead} onChange={onUpdateHomeLead} />
      <ul className="cq-card-list">
        {displayRootIndex.languages.map((lang, langIndex) => (
          <CatalogListItem
            key={lang.id}
            title={lang.title}
            onTitleChange={(title) => onUpdateLanguage(lang.id, { title })}
            onClick={() => onOpenLanguage(lang.path, lang.id)}
            listIndex={langIndex}
            listLength={displayRootIndex.languages.length}
            onMoveUp={() => onMoveLanguage(lang.id, -1)}
            onMoveDown={() => onMoveLanguage(lang.id, 1)}
            onRemove={() => onRemoveLanguage(lang.id)}
            confirmMessage={`Delete language "${lang.title}"?`}
          />
        ))}
      </ul>
      <AddItemButton label="Add language" onClick={onAddLanguage} />
    </div>
  )
}
