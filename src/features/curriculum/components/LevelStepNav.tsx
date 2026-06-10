import type { LevelStep } from '../constants'

const STEP_TABS: { id: LevelStep; label: string }[] = [
  { id: 'intro', label: 'Intro' },
  { id: 'challenges', label: 'Challenges' },
  { id: 'test', label: 'Test' },
]

interface LevelStepNavProps {
  levelStep: LevelStep
  showNext: boolean
  nextLevelTitle: string | null
  onLevelStepChange: (step: LevelStep) => void
  onGoToNextLevel: () => void
  placement?: 'top' | 'bottom'
}

export function LevelStepNav({
  levelStep,
  showNext,
  nextLevelTitle,
  onLevelStepChange,
  onGoToNextLevel,
  placement = 'top',
}: LevelStepNavProps) {
  return (
    <div
      className={`cq-step-tabs-row${placement === 'bottom' ? ' cq-step-tabs-row--bottom' : ''}`}
    >
      <div className="cq-step-tabs" role="tablist" aria-label="Level sections">
        {STEP_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={levelStep === t.id}
            className={`cq-step-tab${levelStep === t.id ? ' cq-step-tab--active' : ''}`}
            onClick={() => onLevelStepChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {showNext && (
        <button
          type="button"
          className="cq-step-tab cq-step-tab--next"
          onClick={onGoToNextLevel}
          title={nextLevelTitle ? `Continue to ${nextLevelTitle}` : undefined}
        >
          Next
        </button>
      )}
    </div>
  )
}
