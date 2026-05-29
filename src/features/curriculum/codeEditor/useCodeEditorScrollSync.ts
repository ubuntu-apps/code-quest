import { useCallback } from 'react'
import type { RefObject } from 'react'

/** Keeps highlight backdrop and tooltip layer scroll positions in sync with the textarea. */
export function useCodeEditorScrollSync(
  taRef: RefObject<HTMLTextAreaElement | null>,
  backdropRef: RefObject<HTMLDivElement | null>,
  tooltipLayerRef: RefObject<HTMLDivElement | null>,
) {
  return useCallback(() => {
    const ta = taRef.current
    if (!ta) return
    const st = ta.scrollTop
    const bd = backdropRef.current
    if (bd) bd.scrollTop = st
    const tl = tooltipLayerRef.current
    if (tl) tl.scrollTop = st
  }, [taRef, backdropRef, tooltipLayerRef])
}
