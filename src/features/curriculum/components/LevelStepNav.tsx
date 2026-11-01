import { useRef, type KeyboardEvent, type Ref } from 'react'
import { DoorClosed, DoorOpen, ScrollText, Swords } from 'lucide-react'
import { LEVEL_STEPS as STEP_TABS, STEP_PANEL_ID, stepTabId, type LevelStep } from '../constants'

interface LevelStepNavProps {
  levelStep: LevelStep
  showNext: boolean
  nextLevelTitle: string | null
  onLevelStepChange: (step: LevelStep) => void
  onGoToNextLevel: () => void
  placement?: 'top' | 'bottom'
  /** Solved challenges out of all of them, shown on the Challenges tab. */
  challengeCount?: { done: number; total: number }
  /** The quiz was passed, shown as a tick on the Quiz tab. */
  testPassed?: boolean
  /** The row, so the page can tell when it has scrolled out of view. */
  ref?: Ref<HTMLDivElement>
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
  ref,
}: LevelStepNavProps) {
  const badge = (id: LevelStep): string | null => {
    if (id === 'challenges' && challengeCount && challengeCount.total > 0) {
      return `${challengeCount.done}/${challengeCount.total}`
    }
    if (id === 'quiz' && testPassed) return '✓'
    return null
  }
  /** What the badge says to a screen reader. */
  const badgeSpoken = (id: LevelStep): string =>
    id === 'quiz' ? ', cleared' : `, ${challengeCount?.done ?? 0} of ${challengeCount?.total ?? 0} solved`

  // The top row is a tab list (arrow keys move between tabs, Tab moves on to the
  // content). The bottom row repeats it as plain buttons for after a long page.
  const isTabs = placement === 'top'
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = STEP_TABS.length - 1
    const target =
      e.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : e.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null
    if (target === null) return
    e.preventDefault()
    tabRefs.current[target]?.focus()
    onLevelStepChange(STEP_TABS[target].id)
  }

  return (
    <div
      ref={ref}
      className={`cq-step-tabs-row${placement === 'bottom' ? ' cq-step-tabs-row--bottom' : ''}`}
    >
      <div
        className="cq-step-tabs"
        role={isTabs ? 'tablist' : 'group'}
        aria-label={isTabs ? 'Stage steps' : 'Go to stage step'}
      >
        {STEP_TABS.map((t, index) => {
          const active = levelStep === t.id
          const badgeText = badge(t.id)
          return (
            <button
              key={t.id}
              ref={isTabs ? (el) => { tabRefs.current[index] = el } : undefined}
              type="button"
              role={isTabs ? 'tab' : undefined}
              id={isTabs ? stepTabId(t.id) : undefined}
              aria-selected={isTabs ? active : undefined}
              aria-controls={isTabs ? STEP_PANEL_ID : undefined}
              aria-current={!isTabs && active ? 'page' : undefined}
              tabIndex={isTabs && !active ? -1 : undefined}
              onKeyDown={isTabs ? (e) => onTabKeyDown(e, index) : undefined}
              className={`cq-step-tab${active ? ' cq-step-tab--active' : ''}`}
              onClick={() => onLevelStepChange(t.id)}
            >
              {t.id === 'intro' ? (
                <ScrollText size={15} aria-hidden className="cq-step-tab-icon" />
              ) : t.id === 'challenges' ? (
                <Swords size={15} aria-hidden className="cq-step-tab-icon" />
              ) : testPassed ? (
                <DoorOpen size={15} aria-hidden className="cq-step-tab-icon" />
              ) : (
                <DoorClosed size={15} aria-hidden className="cq-step-tab-icon" />
              )}
              {t.label}
              {badgeText ? (
                <span
                  className={`cq-step-tab-badge${
                    (t.id === 'challenges' && challengeCount?.done === challengeCount?.total) || t.id === 'quiz'
                      ? ' cq-step-tab-badge--done'
                      : ''
                  }`}
                >
                  <span aria-hidden="true">{badgeText}</span>
                  <span className="cq-sr-only">{badgeSpoken(t.id)}</span>
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
      {showNext && (
        <button
          type="button"
          className="cq-step-tab cq-step-tab--next"
          onClick={onGoToNextLevel}
          title={nextLevelTitle ? `Continue to ${nextLevelTitle}` : undefined}
          aria-label={nextLevelTitle ? `Next stage: ${nextLevelTitle}` : 'Next stage'}
        >
          Next
        </button>
      )}
    </div>
  )
}
