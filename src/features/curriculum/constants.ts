export type TabId = 'learn' | 'about'
export type LearnView = 'languages' | 'sections' | 'levels' | 'level'
export type LevelStep = 'intro' | 'challenges' | 'quiz'

export const PASS_DEFAULT = 70
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

/** The element that shows the current lesson step, labelled by the top row's step tabs. */
export const STEP_PANEL_ID = 'cq-step-panel'

/** The id of a lesson step's tab, so the step panel can name it. */
export function stepTabId(step: LevelStep): string {
  return `cq-step-tab-${step}`
}
