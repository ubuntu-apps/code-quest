import { useCallback, useEffect, useState } from 'react'
import type { LanguageBundle, RootIndex } from '../content/types'
import { lessonLoadErrorMessage, loadLanguageBundle, loadRootIndex } from '../content/loadCurriculum'
import { reconcileLanguageProgress } from '../progress/progressFingerprint'
import { languagePack } from '../../languages'
import { useLanguageBundles } from './useLanguageBundles'

interface UseCurriculumOptions {
  baseUrl: string
  /** The course in the address, if any. */
  languageId: string | null
  /** The course in the address, or the one picked last. */
  activeLanguageId: string | null
  /** Admin mode: "coming soon" courses can be opened too. */
  unlockAll: boolean
  progressVersion: number
  goToLanguage: (langId: string) => void
}

/**
 * Loads the catalog and the open course (public/content). Also drops saved progress that
 * belongs to an older version of a lesson.
 */
export function useCurriculum({
  baseUrl,
  languageId,
  activeLanguageId,
  unlockAll,
  progressVersion,
  goToLanguage,
}: UseCurriculumOptions) {
  const [rootIndex, setRootIndex] = useState<RootIndex | null>(null)
  const [rootError, setRootError] = useState<string | null>(null)

  const [bundle, setBundle] = useState<LanguageBundle | null>(null)
  /** Why a course couldn't be loaded, and which course it was. */
  const [bundleFailure, setBundleFailure] = useState<{ languageId: string; message: string } | null>(null)
  const [loadedLanguageId, setLoadedLanguageId] = useState<string | null>(null)

  /** Whether a course can be opened now: it is in the catalog and not "coming soon" (unless admin mode). */
  const canOpen = useCallback(
    (id: string) => {
      const lang = rootIndex?.languages.find((l) => l.id === id)
      return lang !== undefined && (unlockAll || !lang.comingSoon)
    },
    [rootIndex, unlockAll],
  )

  /** The course picked last, unless it can't be opened now (e.g. it became "coming soon"). */
  const activeOpenableId = activeLanguageId && (!rootIndex || canOpen(activeLanguageId)) ? activeLanguageId : null

  /** The course in the address isn't in the catalog, or can't be opened yet. */
  const courseNotFound = Boolean(languageId && rootIndex && !canOpen(languageId))

  const languageBundles = useLanguageBundles(rootIndex, baseUrl, activeOpenableId)

  useEffect(() => {
    loadRootIndex(baseUrl)
      .then(setRootIndex)
      .catch((e: unknown) => setRootError(lessonLoadErrorMessage(e, 'Failed to load catalog')))
  }, [baseUrl])

  /** Downloads a course: its content, or the error to show. */
  const fetchCourse = useCallback(
    (path: string): Promise<LanguageBundle | Error> =>
      loadLanguageBundle(baseUrl, path).catch((e: unknown) => new Error(lessonLoadErrorMessage(e, 'Failed to load language'))),
    [baseUrl],
  )

  /** Makes a downloaded course the open one, or shows why it couldn't be. */
  const showCourse = useCallback((id: string, result: LanguageBundle | Error): LanguageBundle | null => {
    const failed = result instanceof Error
    setLoadedLanguageId(failed ? null : id)
    setBundle(failed ? null : result)
    setBundleFailure(failed ? { languageId: id, message: result.message } : null)
    return failed ? null : result
  }, [])

  // The course in the address, when the page opens on it (a reload or a link).
  useEffect(() => {
    if (!languageId || !rootIndex || loadedLanguageId === languageId || !canOpen(languageId)) return
    const lang = rootIndex.languages.find((l) => l.id === languageId)
    if (!lang) return
    let cancelled = false
    void fetchCourse(lang.path).then((result) => {
      if (!cancelled) showCourse(languageId, result)
    })
    return () => {
      cancelled = true
    }
  }, [languageId, rootIndex, loadedLanguageId, canOpen, fetchCourse, showCourse])

  // The course in the address, once loaded; another course loaded earlier never stands in for it.
  const bundleForView = languageId
    ? courseNotFound
      ? null
      : (languageBundles[languageId] ?? (loadedLanguageId === languageId ? bundle : null))
    : bundle
  /** The error for the course in the address only, not one left over from another course. */
  const bundleError = bundleFailure && bundleFailure.languageId === languageId ? bundleFailure.message : null

  // Drop saved challenge progress that belongs to an older version of a lesson (see
  // progressFingerprint.ts). Runs again after progress changes, e.g. a restored backup.
  useEffect(() => {
    void progressVersion
    const loaded: Record<string, LanguageBundle> = { ...languageBundles }
    if (bundle && loadedLanguageId) loaded[loadedLanguageId] = bundle
    // Each change it saves tells progress-driven views (and runs this again, finding nothing).
    for (const [langId, b] of Object.entries(loaded)) reconcileLanguageProgress(langId, b)
  }, [languageBundles, bundle, loadedLanguageId, progressVersion])

  /** Opens a course's page and loads it, if it isn't loaded already. */
  const openLanguage = useCallback(
    async (path: string, id: string): Promise<LanguageBundle | null> => {
      goToLanguage(id)
      if (!canOpen(id)) return null
      languagePack(id)?.preload()
      if (loadedLanguageId === id && bundle) return bundle
      return showCourse(id, await fetchCourse(path))
    },
    [goToLanguage, canOpen, loadedLanguageId, bundle, fetchCourse, showCourse],
  )

  return {
    rootError,
    bundleError,
    courseNotFound,
    displayRootIndex: rootIndex,
    bundleForView,
    languageBundles,
    activeOpenableId,
    openLanguage,
  }
}
