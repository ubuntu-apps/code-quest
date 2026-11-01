import { useEffect, useLayoutEffect, useRef } from 'react'
import type { LevelStep } from '../constants'
import { scrollWhenReady } from '../scrollWhenReady'

/**
 * Where a step was left: how far down, and which marked item (a challenge card or a gate
 * question, `data-scroll-anchor`) was at the top and how far from it. The item is what counts:
 * code editors load a moment after a step opens and change its height.
 */
interface Place {
  y: number
  anchor: string | null
  offset: number
}

/** How far down the window an item counts as "at the top" (below the sticky header). */
const TOP_LINE = 80

/** Where the page is now. */
function placeNow(): Place {
  let anchor: Element | null = null
  for (const el of document.querySelectorAll('[data-scroll-anchor]')) {
    if (el.getBoundingClientRect().top > TOP_LINE) break
    anchor = el
  }
  return {
    y: window.scrollY,
    anchor: anchor?.getAttribute('data-scroll-anchor') ?? null,
    offset: anchor ? anchor.getBoundingClientRect().top : 0,
  }
}

/**
 * Goes back to a place: to its height first, then lines its item up again a few times over the
 * next second, as editors load. Stops as soon as the learner touches, scrolls or types.
 */
function goBackTo(place: Place): () => void {
  const cancelScroll = scrollWhenReady(place.y)
  if (!place.anchor) return cancelScroll
  let stopped = false
  const stop = () => {
    stopped = true
  }
  const selector = `[data-scroll-anchor="${CSS.escape(place.anchor)}"]`
  const align = () => {
    const el = stopped ? null : document.querySelector(selector)
    if (el) window.scrollBy(0, el.getBoundingClientRect().top - place.offset)
  }
  const timers = [100, 300, 700, 1200].map((ms) => window.setTimeout(align, ms))
  const interactions = ['touchstart', 'wheel', 'keydown', 'pointerdown'] as const
  for (const type of interactions) window.addEventListener(type, stop, { passive: true, once: true })
  return () => {
    cancelScroll()
    for (const timer of timers) window.clearTimeout(timer)
    for (const type of interactions) window.removeEventListener(type, stop)
  }
}

/**
 * Each step of a stage (Intro, Challenges, Gate) keeps its own place, so a learner can look
 * something up in the intro and come back to the challenge they were on. This works however
 * the step changes: the tabs, the chevrons, or the browser's Back button. A step the learner
 * hasn't been to yet starts at the top.
 */
export function useStepScrollMemory(levelId: string, step: LevelStep): void {
  const saved = useRef(new Map<string, Place>())
  /** The step the page shows now, as `level/step`; null before the first render. */
  const showing = useRef<string | null>(null)

  useEffect(() => {
    const remember = () => {
      if (showing.current) saved.current.set(showing.current, placeNow())
    }
    window.addEventListener('scroll', remember, { passive: true })
    return () => window.removeEventListener('scroll', remember)
  }, [])

  // Before paint, so the old step's place is never overwritten by the new step's first frame.
  useLayoutEffect(() => {
    const key = `${levelId}/${step}`
    const firstRender = showing.current === null
    showing.current = key
    // On first render the page is wherever the route put it (a fresh visit, or Learn's own
    // memory when coming back from another tab), so leave it there.
    if (firstRender) return
    const place = saved.current.get(key)
    return place ? goBackTo(place) : scrollWhenReady(0)
  }, [levelId, step])
}
