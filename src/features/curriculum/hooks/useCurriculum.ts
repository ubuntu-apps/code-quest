import { useCallback, useEffect, useMemo, useState } from 'react'
import type { LanguageBundle, RootIndex } from '../types'
import { lessonLoadErrorMessage, loadLanguageBundle, loadRootIndex } from '../loadCurriculum'
import { notifyProgressChanged } from '../progressStorage'
import { reconcileLanguageProgress } from '../progressFingerprint'
import { languagePack } from '../../languages'
import { useEditorDraft, useEditorMode } from '../../editor'
import { useLanguageBundles } from './useLanguageBundles'

interface UseCurriculumOptions {
  baseUrl: string
  /** The course in the address, if any. */
  languageId: string | null
  /** The course in the address, or the one picked last. */
  activeLanguageId: string | null
  /** Edit or admin mode: "coming soon" courses can be opened too. */
  unlockAll: boolean
  progressVersion: number
  goToLanguage: (langId: string) => void
}

/**
 * Loads the catalog and the open course, and picks what to show: the published content,
 * or the local drafts while editing them. Also drops saved progress that belongs to an
 * older version of a lesson.
 */
export function useCurriculum({
  baseUrl,
  languageId,
  activeLanguageId,
  unlockAll,
  progressVersion,
  goToLanguage,
}: UseCurriculumOptions) {
  const { isEditMode, contentSource, editSessionEpoch, registerCatalogReload, applyCatalogFromDisk } =
    useEditorMode()
  const { rootIndex: editableRootIndex, syncRootIndex, syncBundle, getBundle } = useEditorDraft()

  const [rootIndex, setRootIndex] = useState<RootIndex | null>(null)
  const [rootError, setRootError] = useState<string | null>(null)

  const [bundle, setBundle] = useState<LanguageBundle | null>(null)
  const [bundleError, setBundleError] = useState<string | null>(null)
  const [loadedLanguageId, setLoadedLanguageId] = useState<string | null>(null)

  /** The course picked last, unless it can't be opened now (e.g. it became "coming soon"). */
  const activeOpenableId =
    activeLanguageId &&
    (unlockAll || !rootIndex?.languages.some((lang) => lang.id === activeLanguageId && lang.comingSoon))
      ? activeLanguageId
      : null

  const { bundles: languageBundles } = useLanguageBundles(
    rootIndex,
    baseUrl,
    syncBundle,
    getBundle,
    activeOpenableId,
  )

  useEffect(() => {
    loadRootIndex(baseUrl)
      .then((data) => {
        setRootIndex(data)
        syncRootIndex(data)
      })
      .catch((e: unknown) => setRootError(lessonLoadErrorMessage(e, 'Failed to load catalog')))
  }, [baseUrl, syncRootIndex])

  useEffect(() => {
    if (!languageId || !rootIndex) return

    const lang = rootIndex.languages.find((l) => l.id === languageId)
    if (!lang) return
    if (loadedLanguageId === languageId) return

    let cancelled = false
    const useLocalContent = isEditMode && contentSource === 'local'
    const draftBundle = useLocalContent ? getBundle(languageId) : null
    if (useLocalContent && draftBundle) {
      void Promise.resolve().then(() => {
        if (cancelled) return
        setBundle(draftBundle)
        setLoadedLanguageId(languageId)
        setBundleError(null)
      })
      return () => {
        cancelled = true
      }
    }

    void loadLanguageBundle(baseUrl, lang.path, { fallbackBundle: draftBundle ?? getBundle(languageId) })
      .then((b) => {
        if (cancelled) return
        setLoadedLanguageId(languageId)
        setBundle(b)
        setBundleError(null)
        syncBundle(languageId, b)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setLoadedLanguageId(null)
        setBundle(null)
        setBundleError(lessonLoadErrorMessage(e, 'Failed to load language'))
      })

    return () => {
      cancelled = true
    }
  }, [
    languageId,
    rootIndex,
    baseUrl,
    syncBundle,
    loadedLanguageId,
    isEditMode,
    contentSource,
    getBundle,
    editSessionEpoch,
  ])

  useEffect(() => {
    return registerCatalogReload(async () => {
      setLoadedLanguageId(null)
      setBundleError(null)

      if (import.meta.env.DEV) {
        const root = await loadRootIndex(baseUrl, { cacheBust: true })
        const loaded: Record<string, LanguageBundle> = {}
        for (const lang of root.languages) {
          loaded[lang.id] = await loadLanguageBundle(baseUrl, lang.path, {
            cacheBust: true,
            fallbackBundle: getBundle(lang.id),
          })
        }
        applyCatalogFromDisk(root, loaded)
        setRootIndex(root)
        if (languageId && loaded[languageId]) {
          setBundle(loaded[languageId])
          setLoadedLanguageId(languageId)
          syncBundle(languageId, loaded[languageId])
        }
        return
      }

      if (editableRootIndex) setRootIndex(editableRootIndex)
      if (languageId) {
        const draft = getBundle(languageId)
        if (draft) {
          setBundle(draft)
          setLoadedLanguageId(languageId)
        }
      }
    })
  }, [
    registerCatalogReload,
    applyCatalogFromDisk,
    baseUrl,
    languageId,
    getBundle,
    syncBundle,
    editableRootIndex,
  ])

  const useLocalContent = isEditMode && contentSource === 'local'

  const displayRootIndex = useLocalContent ? (editableRootIndex ?? rootIndex) : rootIndex

  const displayBundle = useMemo(() => {
    if (!languageId) return bundle
    if (!useLocalContent) return languageBundles[languageId] ?? bundle
    return getBundle(languageId) ?? bundle
  }, [languageId, getBundle, bundle, useLocalContent, languageBundles])

  const bundleForView = displayBundle ?? bundle

  // Drop saved challenge progress that belongs to an older version of a lesson (see
  // progressFingerprint.ts). Runs again after progress changes, e.g. a restored backup.
  // Local edit-mode drafts are skipped: editing a challenge shouldn't wipe its progress.
  useEffect(() => {
    void progressVersion
    if (useLocalContent) return
    const loaded: Record<string, LanguageBundle> = { ...languageBundles }
    if (bundle && loadedLanguageId) loaded[loadedLanguageId] = bundle
    let dropped = false
    for (const [langId, b] of Object.entries(loaded)) {
      if (reconcileLanguageProgress(langId, b)) dropped = true
    }
    if (dropped) notifyProgressChanged()
  }, [languageBundles, bundle, loadedLanguageId, useLocalContent, progressVersion])

  /** A course's content to show: its local draft while editing drafts, else `fallback`. */
  const resolveBundle = useCallback(
    (langId: string, fallback: LanguageBundle | undefined) => {
      if (!useLocalContent) return fallback ?? null
      return getBundle(langId) ?? fallback ?? null
    },
    [getBundle, useLocalContent],
  )

  /** Opens a course's page and loads it, if it isn't loaded already. */
  const openLanguage = useCallback(
    async (path: string, id: string): Promise<LanguageBundle | null> => {
      goToLanguage(id)
      languagePack(id)?.preload()
      if (loadedLanguageId === id && bundle) return bundle
      try {
        const b = await loadLanguageBundle(baseUrl, path, {
          fallbackBundle: getBundle(id),
        })
        setLoadedLanguageId(id)
        setBundle(b)
        setBundleError(null)
        syncBundle(id, b)
        return b
      } catch (e: unknown) {
        setLoadedLanguageId(null)
        setBundle(null)
        setBundleError(lessonLoadErrorMessage(e, 'Failed to load language'))
        return null
      }
    },
    [baseUrl, syncBundle, goToLanguage, loadedLanguageId, bundle, getBundle],
  )

  /** Forgets the loaded course, so it loads again when next opened. */
  const forgetBundle = useCallback(() => {
    setBundle(null)
    setLoadedLanguageId(null)
  }, [])

  /** Shows a freshly loaded catalog, e.g. after importing content. */
  const replaceRootIndex = useCallback(
    (data: RootIndex) => {
      setRootIndex(data)
      forgetBundle()
    },
    [forgetBundle],
  )

  return {
    rootError,
    bundleError,
    displayRootIndex,
    bundleForView,
    languageBundles,
    activeOpenableId,
    useLocalContent,
    resolveBundle,
    openLanguage,
    forgetBundle,
    replaceRootIndex,
  }
}
