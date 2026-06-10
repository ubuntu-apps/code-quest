import type { LevelStep, TabId } from './constants'

export interface ParsedLearnPath {
  tab: TabId
  langId: string | null
  sectionId: string | null
  levelId: string | null
  step: LevelStep
}

const LEVEL_STEPS = new Set<LevelStep>(['intro', 'challenges', 'test'])

function normalizePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '') || '/'
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

export function parseAppPath(pathname: string): ParsedLearnPath {
  const path = normalizePath(pathname)

  if (path === '/progress') {
    return { tab: 'progress', langId: null, sectionId: null, levelId: null, step: 'intro' }
  }

  const progressMatch = path.match(/^\/progress\/([^/]+)$/)
  if (progressMatch) {
    return {
      tab: 'progress',
      langId: decodeURIComponent(progressMatch[1]),
      sectionId: null,
      levelId: null,
      step: 'intro',
    }
  }
  if (path === '/about') {
    return { tab: 'about', langId: null, sectionId: null, levelId: null, step: 'intro' }
  }

  if (path === '/' || path === '/learn') {
    return { tab: 'learn', langId: null, sectionId: null, levelId: null, step: 'intro' }
  }

  const learnMatch = path.match(/^\/learn(?:\/([^/]+))?(?:\/([^/]+))?(?:\/([^/]+))?(?:\/([^/]+))?$/)
  if (!learnMatch) {
    return { tab: 'learn', langId: null, sectionId: null, levelId: null, step: 'intro' }
  }

  const [, langId, sectionId, levelId, maybeStep] = learnMatch
  const step =
    maybeStep && LEVEL_STEPS.has(maybeStep as LevelStep) ? (maybeStep as LevelStep) : 'intro'
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

export function progressPath(langId?: string | null): string {
  return langId ? `/progress/${encodeURIComponent(langId)}` : '/progress'
}

export function tabPath(tab: TabId, langId?: string | null): string {
  if (tab === 'learn') return langId ? learnLanguagePath(langId) : learnHomePath()
  if (tab === 'progress') return progressPath(langId)
  return `/${tab}`
}

export function authCallbackPath(): string {
  return '/auth/callback'
}
