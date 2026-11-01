import { useCallback, useEffect, useRef } from 'react'
import { useLocation, type NavigateFunction } from 'react-router-dom'
import type { TabId } from '../constants'
import { tabPath } from '../learnPaths'
import { scrollWhenReady } from '../scrollWhenReady'

/**
 * Learn and About keep their place: switching back to Learn returns to the page the
 * learner was on (not the course page), scrolled to where they left it. Tapping the tab
 * you're already on works as before.
 */
export function useTabMemory({
  tab,
  activeLanguageId,
  goToTab,
  navigate,
}: {
  tab: TabId
  activeLanguageId: string | null
  goToTab: (tab: TabId) => void
  navigate: NavigateFunction
}) {
  const location = useLocation()
  const lastPathByTab = useRef(new Map<TabId, string>())
  const scrollByPath = useRef(new Map<string, number>())
  const pendingScroll = useRef<number | null>(null)

  useEffect(() => {
    lastPathByTab.current.set(tab, location.pathname)
  }, [tab, location.pathname])

  const switchTab = useCallback(
    (next: TabId) => {
      scrollByPath.current.set(location.pathname, window.scrollY)
      if (next === tab) {
        goToTab(next)
        return
      }
      const target = lastPathByTab.current.get(next) ?? tabPath(next, activeLanguageId)
      pendingScroll.current = scrollByPath.current.get(target) ?? 0
      navigate(target)
    },
    [tab, location.pathname, activeLanguageId, goToTab, navigate],
  )

  // After a tab switch, scroll to the saved place once the page is tall enough.
  useEffect(() => {
    const y = pendingScroll.current
    if (y === null) return
    pendingScroll.current = null
    let cancel = () => {}
    const timer = window.setTimeout(() => {
      cancel = scrollWhenReady(y)
    }, 0)
    return () => {
      window.clearTimeout(timer)
      cancel()
    }
  }, [location.pathname])

  return switchTab
}
