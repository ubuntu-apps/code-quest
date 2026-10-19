export type TabId = 'learn' | 'about'
export type LearnView = 'languages' | 'sections' | 'levels' | 'level'
export type LevelStep = 'intro' | 'challenges' | 'quiz'

export const PASS_DEFAULT = 70
export const DEFAULT_SANDBOX_CODE: Record<string, string> = {
  python: 'print("Hello from CodeQuest!")',
  r: 'print("Hello from CodeQuest!")',
}
export const STREAK_STORAGE_KEY = 'codequest:streak'
export const LAST_LEVEL_STORAGE_KEY = 'codequest:lastLevel'
export const SELECTED_LANGUAGE_STORAGE_KEY = 'codequest:selectedLanguage'
/**
 * Lock a section until every topic quiz in the previous section is passed. (A section
 * with easy/medium projects always gates the next one on those projects instead.)
 * Off until every section has been rewritten, so learners and reviewers can reach
 * any section; turn it on afterwards.
 */
export const LOCK_SECTIONS_BY_QUIZZES = false
export const CHALLENGE_XP = 10
/** XP for a challenge solved after revealing its answer. */
export const CHALLENGE_XP_AFTER_ANSWER = 5
export const TEST_XP = 50

export const SANDBOX_SNIPPETS: Record<string, { id: string; label: string; code: string }[]> = {
  python: [
    { id: 'hello', label: 'Hello', code: 'print("Hello, Python!")' },
    {
      id: 'variables',
      label: 'Variables',
      code: 'name = "Alex"\nscore = 7\nprint(name)\nprint(score)',
    },
    { id: 'loop', label: 'Loop', code: 'for i in range(3):\n    print("Step", i)' },
    { id: 'function', label: 'Function', code: 'def add(a, b):\n    return a + b\n\nprint(add(2, 3))' },
  ],
  r: [
    { id: 'hello', label: 'Hello', code: 'print("Hello, R!")' },
    {
      id: 'variables',
      label: 'Variables',
      code: 'name <- "Alex"\nscore <- 7\nprint(name)\nprint(score)',
    },
    { id: 'vector', label: 'Vector', code: 'nums <- c(1, 2, 3)\nprint(nums * 2)' },
    { id: 'function', label: 'Function', code: 'add <- function(a, b) a + b\nprint(add(2, 3))' },
  ],
}

/** The element that shows the current lesson step, labelled by the top row's step tabs. */
export const STEP_PANEL_ID = 'cq-step-panel'

/** The id of a lesson step's tab, so the step panel can name it. */
export function stepTabId(step: LevelStep): string {
  return `cq-step-tab-${step}`
}
