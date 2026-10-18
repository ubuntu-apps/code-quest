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
  /** Solved challenges out of all of them, shown on the Challenges tab. */
  challengeCount?: { done: number; total: number }
  /** The quiz was passed, shown as a tick on the Test tab. */
  testPassed?: boolean
}

export function LevelStepNav({
  levelStep,
  showNext,
  nextLevelTitle,
  onLevelStepChange,
  onGoToNextLevel,
  placement = 'top',
  challengeCount,
  testPassed = false,
}: LevelStepNavProps) {
  const badge = (id: LevelStep): string | null => {
    if (id === 'challenges' && challengeCount && challengeCount.total > 0) {
      return `${challengeCount.done}/${challengeCount.total}`
    }
    if (id === 'test' && testPassed) return '✓'
    return null
  }

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
            {badge(t.id) ? (
              <span
                className={`cq-step-tab-badge${
                  (t.id === 'challenges' && challengeCount?.done === challengeCount?.total) || t.id === 'test'
                    ? ' cq-step-tab-badge--done'
                    : ''
                }`}
              >
                {badge(t.id)}
              </span>
            ) : null}
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
