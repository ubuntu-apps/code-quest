import type { LearnView, LevelStep, TabId } from './constants'
import type { Crumb } from './components/Breadcrumbs'

export interface ParsedLearnPath {
  tab: TabId
  langId: string | null
  sectionId: string | null
  levelId: string | null
  step: LevelStep
}

const LEVEL_STEPS = new Set<LevelStep>(['intro', 'challenges', 'quiz'])

function normalizePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '') || '/'
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

/** A path segment decoded, or as it is when it isn't valid (a stray "%" in a link). */
function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

export function parseAppPath(pathname: string): ParsedLearnPath {
  const path = normalizePath(pathname)

  // The Progress tab was removed: its old links open the matching Learn page.
  if (path === '/progress') {
    return { tab: 'learn', langId: null, sectionId: null, levelId: null, step: 'intro' }
  }

  const progressMatch = path.match(/^\/progress\/([^/]+)$/)
  if (progressMatch) {
    return {
      tab: 'learn',
      langId: safeDecode(progressMatch[1]),
      sectionId: null,
      levelId: null,
      step: 'intro',
    }
  }
  if (path === '/about' || path === '/settings') {
    return { tab: path === '/about' ? 'about' : 'settings', langId: null, sectionId: null, levelId: null, step: 'intro' }
  }

  if (path === '/' || path === '/learn') {
    return { tab: 'learn', langId: null, sectionId: null, levelId: null, step: 'intro' }
  }

  const learnMatch = path.match(/^\/learn(?:\/([^/]+))?(?:\/([^/]+))?(?:\/([^/]+))?(?:\/([^/]+))?$/)
  if (!learnMatch) {
    return { tab: 'learn', langId: null, sectionId: null, levelId: null, step: 'intro' }
  }

  const [, langId, sectionId, levelId, maybeStep] = learnMatch
  // The quiz step used to be called "test"; old links and bookmarks still open it.
  const stepName = maybeStep === 'test' ? 'quiz' : maybeStep
  const step =
    stepName && LEVEL_STEPS.has(stepName as LevelStep) ? (stepName as LevelStep) : 'intro'
  const resolvedLevelId = levelId && !LEVEL_STEPS.has(levelId as LevelStep) ? levelId : null

  return {
    tab: 'learn',
    langId: langId ?? null,
    sectionId: sectionId ?? null,
    levelId: resolvedLevelId,
    step,
  }
}

export function learnHomePath(): string {
  return '/learn'
}

export function learnLanguagePath(langId: string): string {
  return `/learn/${encodeURIComponent(langId)}`
}

export function learnSectionPath(langId: string, sectionId: string): string {
  return `/learn/${encodeURIComponent(langId)}/${encodeURIComponent(sectionId)}`
}

export function learnLevelPath(
  langId: string,
  sectionId: string,
  levelId: string,
  step: LevelStep = 'intro',
): string {
  const base = `/learn/${encodeURIComponent(langId)}/${encodeURIComponent(sectionId)}/${encodeURIComponent(levelId)}`
  return step === 'intro' ? base : `${base}/${step}`
}

export function tabPath(tab: TabId, langId?: string | null): string {
  if (tab === 'learn') return langId ? learnLanguagePath(langId) : learnHomePath()
  return `/${tab}`
}

/**
 * The pages above the current Learn page, for the breadcrumb trail: "Home › Python ›
 * Fundamentals". The current page isn't included; it is the heading below the trail.
 */
export function learnBreadcrumbs({
  learnView,
  languageId,
  courseTitle,
  section,
}: {
  learnView: LearnView
  languageId: string | null
  /** The open course's title, once it has loaded. */
  courseTitle: string | null
  section: { id: string; title: string } | null
}): Crumb[] {
  if (learnView === 'languages' || !languageId || courseTitle === null) return []
  const crumbs: Crumb[] = [{ label: 'Home', to: learnHomePath() }]
  if (learnView !== 'sections') crumbs.push({ label: courseTitle, to: learnLanguagePath(languageId) })
  if (learnView === 'level' && section) {
    crumbs.push({ label: section.title, to: learnSectionPath(languageId, section.id) })
  }
  return crumbs
}
