import { useEffect, useState } from 'react'
import { lessonLoadErrorMessage, loadLanguageBundle } from '../content/loadCurriculum'
import type { LanguageBundle, RootIndex } from '../content/types'

/** Loads the courses in the catalog: only `onlyLanguageId` (the one being learned), or all of them. */
export function useLanguageBundles(rootIndex: RootIndex | null, baseUrl: string, onlyLanguageId?: string | null) {
  const [bundles, setBundles] = useState<Record<string, LanguageBundle>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!rootIndex) return

    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const languages = onlyLanguageId
          ? rootIndex.languages.filter((lang) => lang.id === onlyLanguageId)
          : rootIndex.languages
        const entries = await Promise.all(
          languages.map(async (lang) => [lang.id, await loadLanguageBundle(baseUrl, lang.path)] as const),
        )
        // Keep courses loaded earlier in the session (e.g. before switching course).
        if (!cancelled) setBundles((prev) => ({ ...prev, ...Object.fromEntries(entries) }))
      } catch (e: unknown) {
        if (!cancelled) {
          setBundles({})
          setError(lessonLoadErrorMessage(e, 'Failed to load curriculum'))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [rootIndex, baseUrl, onlyLanguageId])

  return {
    bundles: rootIndex ? bundles : {},
    loading: rootIndex ? loading : false,
    error: rootIndex ? error : null,
  }
}
