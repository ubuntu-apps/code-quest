import { useCallback, useEffect, useRef, useState } from 'react'
import { shareApp, type ShareVariant } from '../../../lib/shareApp'

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
    setXpToast({ text: `+${xp} XP${levelUp}`, key: Date.now() })
  }, [])

  useEffect(() => {
    if (!xpToast) return
    const timer = window.setTimeout(() => setXpToast(null), 2500)
    return () => window.clearTimeout(timer)
  }, [xpToast])

  return { xpToast, showXp }
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
