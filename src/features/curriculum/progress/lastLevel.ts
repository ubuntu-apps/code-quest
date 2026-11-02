import { STORES } from '../../../lib/stores'
import type { ContinueTarget } from '../views/LearnHome'

/** Remembers the lesson opened last, for the home page's Continue button. */
export function rememberLastLevel(target: ContinueTarget): void {
  STORES.lastLevel.set(JSON.stringify(target))
}

/** The lesson opened last, or null when none was saved or the saved value is unreadable. */
export function loadLastLevel(): ContinueTarget | null {
  try {
    const raw = STORES.lastLevel.get()
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ContinueTarget>
    if (parsed.languageId && parsed.languagePath && parsed.sectionId && parsed.levelId) {
      return parsed as ContinueTarget
    }
  } catch {
    // Ignore malformed local storage.
  }
  return null
}
