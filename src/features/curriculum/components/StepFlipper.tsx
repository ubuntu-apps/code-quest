import { useEffect, useState, type RefObject } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { LEVEL_STEPS, type LevelStep } from '../constants'

/** Whether a box you type into has focus (on a phone, the keyboard is probably open). */
function isTyping(): boolean {
  const el = document.activeElement
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el instanceof HTMLElement && el.isContentEditable)
}

/** Whether part of `el` is inside the window. */
function onScreen(el: HTMLElement | null): boolean {
  if (!el) return false
  const box = el.getBoundingClientRect()
  return box.bottom > 0 && box.top < window.innerHeight
}

/**
 * Whether either element is on screen, checked as the page scrolls or resizes. (Two box
 * measurements per scroll event, which is cheap, and it works even where the page isn't
 * being drawn, unlike IntersectionObserver.)
 */
function useEitherInView(a: RefObject<HTMLElement | null>, b: RefObject<HTMLElement | null>, step: LevelStep): boolean {
  const [inView, setInView] = useState(true)
  // Checked again for a new `step` too: it changes the page under the tabs without always scrolling it.
  useEffect(() => {
    const update = () => setInView(onScreen(a.current) || onScreen(b.current))
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [a, b, step])
  return inView
}

/**
 * Small "‹ Intro" and "Gate ›" buttons at the bottom corners of a stage, so a learner deep in
 * the challenges can look at the intro and come straight back (each step keeps its place, see
 * useStepScrollMemory). They show only while neither row of step tabs is on screen, and hide
 * while the learner is typing.
 */
export function StepFlipper({
  levelStep,
  onLevelStepChange,
  topTabs,
  bottomTabs,
}: {
  levelStep: LevelStep
  onLevelStepChange: (step: LevelStep) => void
  /** The rows of step tabs at the top and bottom of the stage. */
  topTabs: RefObject<HTMLElement | null>
  bottomTabs: RefObject<HTMLElement | null>
}) {
  const tabsInView = useEitherInView(topTabs, bottomTabs, levelStep)
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    // After focus has moved, so going from one box to the next doesn't flash the buttons.
    const update = () => window.setTimeout(() => setTyping(isTyping()), 0)
    document.addEventListener('focusin', update)
    document.addEventListener('focusout', update)
    return () => {
      document.removeEventListener('focusin', update)
      document.removeEventListener('focusout', update)
    }
  }, [])

  if (tabsInView || typing) return null
  const index = LEVEL_STEPS.findIndex((step) => step.id === levelStep)
  const prev = LEVEL_STEPS[index - 1]
  const next = LEVEL_STEPS[index + 1]

  return (
    <nav className="cq-step-flipper" aria-label="Previous and next step">
      {prev ? (
        <button type="button" className="cq-step-flip cq-step-flip--prev" aria-label={`Back to ${prev.label}`} onClick={() => onLevelStepChange(prev.id)}>
          <ChevronLeft size={18} aria-hidden />
          {prev.label}
        </button>
      ) : null}
      {next ? (
        <button type="button" className="cq-step-flip cq-step-flip--next" aria-label={`On to ${next.label}`} onClick={() => onLevelStepChange(next.id)}>
          {next.label}
          <ChevronRight size={18} aria-hidden />
        </button>
      ) : null}
    </nav>
  )
}
