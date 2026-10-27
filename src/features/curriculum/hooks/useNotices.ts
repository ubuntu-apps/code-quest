import { useCallback, useEffect, useRef, useState } from 'react'
import { shareApp, type ShareVariant } from '../../../lib/shareApp'
import { playSound } from '../../sound/sound'

/** "+10 XP" pop-up when a challenge or quiz earns XP for the first time. */
export function useXpToast(totalXp: number) {
  const [xpToast, setXpToast] = useState<{ text: string; key: number } | null>(null)
  const totalXpRef = useRef(0)

  useEffect(() => {
    totalXpRef.current = totalXp
  }, [totalXp])

  const showXp = useCallback((xp: number) => {
    const before = Math.floor(totalXpRef.current / 100)
    const after = Math.floor((totalXpRef.current + xp) / 100)
    const levelUp = after > before ? ` · Level ${after + 1} reached!` : ''
    // After the check or quiz sound that comes with the XP.
    if (after > before) playSound('levelUp', 0.45)
    setXpToast({ text: `+${xp} XP${levelUp}`, key: Date.now() })
  }, [])

  useEffect(() => {
    if (!xpToast) return
    const timer = window.setTimeout(() => setXpToast(null), 2500)
    return () => window.clearTimeout(timer)
  }, [xpToast])

  return { xpToast, showXp }
}

/** "Badge earned" pop-up, a little longer than the XP one so it can be read. */
export function useBadgeToast() {
  const [badgeToast, setBadgeToast] = useState<{ text: string; key: number } | null>(null)

  /** With `newRank` (such as "SQL Engineer"), the pop-up leads with the new rank. */
  const showBadges = useCallback((titles: string[], newRank?: string) => {
    if (titles.length === 0) return
    const others = newRank ? titles.filter((t) => t !== newRank) : titles
    const list =
      others.length <= 1 ? (others[0] ?? '') : `${others.slice(0, -1).join(', ')} and ${others[others.length - 1]}`
    const text = newRank
      ? `New rank: ${newRank}!${others.length > 0 ? ` Also earned: ${list}` : ''}`
      : others.length === 1
        ? `Badge earned: ${list}`
        : `${others.length} badges earned: ${list}`
    setBadgeToast({ text, key: Date.now() })
  }, [])

  useEffect(() => {
    if (!badgeToast) return
    const timer = window.setTimeout(() => setBadgeToast(null), 4000)
    return () => window.clearTimeout(timer)
  }, [badgeToast])

  return { badgeToast, showBadges }
}

/** The Share sheet, and the short notice after sharing (e.g. "link copied"). */
export function useShareSheet() {
  const [shareNotice, setShareNotice] = useState<string | null>(null)
  const [shareSheetOpen, setShareSheetOpen] = useState(false)

  const handleShareSelect = useCallback(async (variant: ShareVariant) => {
    setShareSheetOpen(false)
    const result = await shareApp(variant)
    if (result === 'copied') {
      setShareNotice('Install link copied to clipboard.')
    } else if (result === 'unsupported') {
      setShareNotice('Sharing is not available in this browser.')
    }
  }, [])

  useEffect(() => {
    if (!shareNotice) return
    const timer = window.setTimeout(() => setShareNotice(null), 3000)
    return () => window.clearTimeout(timer)
  }, [shareNotice])

  const openShareSheet = useCallback(() => setShareSheetOpen(true), [])
  const closeShareSheet = useCallback(() => setShareSheetOpen(false), [])

  return { shareNotice, shareSheetOpen, openShareSheet, closeShareSheet, handleShareSelect }
}
