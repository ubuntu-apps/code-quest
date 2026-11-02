import { useEffect, useState } from 'react'
import { loadLanguageBundle } from '../content/loadCurriculum'
import type { LanguageBundle, RootIndex } from '../content/types'

/**
 * Loads the catalog's courses named in `languageIds`. A course that fails to load is left
 * out, and courses loaded earlier stay; the open course's own error is shown by
 * useCurriculum, which loads it too.
 */
export function useLanguageBundles(rootIndex: RootIndex | null, baseUrl: string, languageIds: string[]) {
  const [bundles, setBundles] = useState<Record<string, LanguageBundle>>({})
  // A string, so a new array with the same ids doesn't load them again.
  const wanted = languageIds.join(',')

  useEffect(() => {
    if (!rootIndex || !wanted) return
    let cancelled = false
    const ids = new Set(wanted.split(','))
    const languages = rootIndex.languages.filter((lang) => ids.has(lang.id))
    void Promise.allSettled(
      languages.map(async (lang) => [lang.id, await loadLanguageBundle(baseUrl, lang.path)] as const),
    ).then((results) => {
      if (cancelled) return
      const loaded = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
      if (loaded.length > 0) setBundles((prev) => ({ ...prev, ...Object.fromEntries(loaded) }))
    })
    return () => {
      cancelled = true
    }
  }, [rootIndex, baseUrl, wanted])

  return rootIndex ? bundles : {}
}
