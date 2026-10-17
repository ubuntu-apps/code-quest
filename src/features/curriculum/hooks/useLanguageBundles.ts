import { useEffect, useState } from 'react'
import { loadLanguageBundle } from '../loadCurriculum'
import type { LanguageBundle, RootIndex } from '../types'

export function useLanguageBundles(
  rootIndex: RootIndex | null,
  baseUrl: string,
  syncBundle: (langId: string, bundle: LanguageBundle) => void,
  getBundle?: (langId: string) => LanguageBundle | null,
  /** Load only this course (the one being learned). Null loads every course. */
  onlyLanguageId?: string | null,
) {
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
          languages.map(async (lang) => {
            const b = await loadLanguageBundle(baseUrl, lang.path, {
              fallbackBundle: getBundle?.(lang.id) ?? null,
            })
            return [lang.id, b] as const
          }),
        )
        if (!cancelled) {
          // Keep courses loaded earlier in the session (e.g. before switching course).
          setBundles((prev) => ({ ...prev, ...Object.fromEntries(entries) }))
          for (const [langId, b] of entries) syncBundle(langId, b)
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setBundles({})
          setError(e instanceof Error ? e.message : 'Failed to load curriculum')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [rootIndex, baseUrl, syncBundle, getBundle, onlyLanguageId])

  return {
    bundles: rootIndex ? bundles : {},
    loading: rootIndex ? loading : false,
    error: rootIndex ? error : null,
  }
}
