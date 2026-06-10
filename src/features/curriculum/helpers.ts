import type { FriendlyPythonError } from './pythonSandbox'
import type { Level } from './types'
import { CHALLENGE_XP, STREAK_STORAGE_KEY, TEST_XP } from './constants'
import { loadProgress } from './progressStorage'

type StreakState = { lastDate: string; count: number }

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function loadStreakState(): StreakState {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY)
    if (!raw) return { lastDate: '', count: 0 }
    const parsed = JSON.parse(raw) as Partial<StreakState>
    return {
      lastDate: typeof parsed.lastDate === 'string' ? parsed.lastDate : '',
      count: typeof parsed.count === 'number' ? parsed.count : 0,
    }
  } catch {
    return { lastDate: '', count: 0 }
  }
}

export function recordDailyActivity(): number {
  const today = dateKey(new Date())
  const yesterday = dateKey(new Date(Date.now() - 24 * 60 * 60 * 1000))
  const curr = loadStreakState()
  let next: StreakState
  if (curr.lastDate === today) {
    next = curr
  } else if (curr.lastDate === yesterday) {
    next = { lastDate: today, count: curr.count + 1 }
  } else {
    next = { lastDate: today, count: 1 }
  }
  localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(next))
  return next.count
}

export function computeLevelXp(languageId: string, level: Level): number {
  const p = loadProgress(languageId, level.id)
  const challengeXp = Math.min(p.challengesCompleted.length, level.challenges.length) * CHALLENGE_XP
  const testXp = p.testPassed ? TEST_XP : 0
  return challengeXp + testXp
}

export type SectionProgressStatus = 'not_started' | 'in_progress' | 'complete'

export function isLevelComplete(languageId: string, level: Level): boolean {
  const p = loadProgress(languageId, level.id)
  const challengesDone =
    level.challenges.length === 0 ||
    level.challenges.every((c) => p.challengesCompleted.includes(c.id))
  return challengesDone && p.testPassed
}

export function isLevelStarted(languageId: string, level: Level): boolean {
  const p = loadProgress(languageId, level.id)
  return p.challengesCompleted.length > 0 || p.testPassed
}

export function getSectionProgressStatus(
  languageId: string,
  levels: Level[],
): SectionProgressStatus {
  if (levels.length === 0) return 'not_started'
  if (!levels.some((level) => isLevelStarted(languageId, level))) return 'not_started'
  if (levels.every((level) => isLevelComplete(languageId, level))) return 'complete'
  return 'in_progress'
}

export function computeSectionXp(languageId: string, levels: Level[]): number {
  return levels.reduce((sum, level) => sum + computeLevelXp(languageId, level), 0)
}

export function pythonErrorLinePointer(
  code: string,
  err: Pick<FriendlyPythonError, 'line' | 'column'> | null | undefined,
) {
  if (!err?.line) return null
  const lines = code.split('\n')
  const lineIndex = err.line - 1
  if (lineIndex < 0 || lineIndex >= lines.length) return null
  const text = lines[lineIndex] ?? ''
  const col = Math.max(1, err.column ?? 1)
  const caretPad = ' '.repeat(Math.max(0, col - 1))
  return {
    line: err.line,
    text,
    caret: `${caretPad}^`,
    column: err.column,
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text.trim()) return false
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
