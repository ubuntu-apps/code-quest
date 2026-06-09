import { useEffect, useState } from 'react'
import { loadLanguageBundle } from '../loadCurriculum'
import type { LanguageBundle, RootIndex } from '../types'

export function useLanguageBundles(
  rootIndex: RootIndex | null,
  baseUrl: string,
  syncBundle: (langId: string, bundle: LanguageBundle) => void,
  getBundle?: (langId: string) => LanguageBundle | null,
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
        const entries = await Promise.all(
          rootIndex.languages.map(async (lang) => {
            const b = await loadLanguageBundle(baseUrl, lang.path, {
              fallbackBundle: getBundle?.(lang.id) ?? null,
            })
            return [lang.id, b] as const
          }),
        )
        if (!cancelled) {
          const map = Object.fromEntries(entries)
          setBundles(map)
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
  }, [rootIndex, baseUrl, syncBundle, getBundle])

  return {
    bundles: rootIndex ? bundles : {},
    loading: rootIndex ? loading : false,
    error: rootIndex ? error : null,
  }
}
