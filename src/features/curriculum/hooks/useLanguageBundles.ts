import { useEffect, useState } from 'react'
import { loadLanguageBundle } from '../content/loadCurriculum'
import type { LanguageBundle, RootIndex } from '../content/types'

/**
 * Loads the courses in the catalog: only `onlyLanguageId` (the one being learned), or all of
 * them. A course that fails to load is left out, and courses loaded earlier stay; the open
 * course's own error is shown by useCurriculum, which loads it too.
 */
export function useLanguageBundles(rootIndex: RootIndex | null, baseUrl: string, onlyLanguageId?: string | null) {
  const [bundles, setBundles] = useState<Record<string, LanguageBundle>>({})

  useEffect(() => {
    if (!rootIndex) return
    let cancelled = false
    const languages = onlyLanguageId
      ? rootIndex.languages.filter((lang) => lang.id === onlyLanguageId)
      : rootIndex.languages
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
  }, [rootIndex, baseUrl, onlyLanguageId])

  return rootIndex ? bundles : {}
}
