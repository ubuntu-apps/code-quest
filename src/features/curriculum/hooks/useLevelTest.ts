import { useState } from 'react'
import { PASS_DEFAULT, TEST_XP } from '../constants'
import { loadProgress, saveProgress } from '../progress/progressStorage'
import type { Level } from '../content/types'
import { playSound } from '../../sound/sound'
import { recordReviewAnswers } from '../../review/reviewStorage'
import { useQuiz } from './useQuiz'
import { countEvent, countOnce } from '../../../lib/analytics'

/**
 * Answers and grading for a level's end-of-level test.
 * `onActivity` is called on every submit (used for the daily streak), and `onXp` with
 * the XP earned when the quiz is passed for the first time.
 */
export function useLevelTest(
  languageId: string | null,
  level: Level | null,
  onActivity: () => void,
  onXp?: (xp: number) => void,
) {
  /** True after the learner retakes or edits answers, so a past pass doesn't show "Next" yet. */
  const [sessionReset, setSessionReset] = useState(false)
  const quiz = useQuiz(() => setSessionReset(true))
  const { reset } = quiz

  const submit = () => {
    if (!languageId || !level) return
    const { graded, answeredIds } = quiz.grade(level.test.questions, level.test.passingScorePercent ?? PASS_DEFAULT)
    playSound(graded.passed ? 'quizPass' : 'quizFail')
    if (graded.passed) setSessionReset(false)
    const prev = loadProgress(languageId, level.id)
    saveProgress(languageId, level.id, { ...prev, testPassed: prev.testPassed || graded.passed })
    if (graded.passed && !prev.testPassed) onXp?.(TEST_XP)
    if (graded.passed) countOnce(`lesson-finished/${languageId}/${level.id}`, `Lesson finished: ${level.title}`)
    // How each answered question went, for the daily review.
    recordReviewAnswers(languageId, graded.byQuestion, answeredIds)
    // A blank submit isn't practice, so it doesn't keep the daily streak going.
    if (answeredIds.length > 0) {
      onActivity()
      countEvent(
        `quiz-${graded.passed ? 'passed' : 'failed'}/${languageId}/${level.id}`,
        `Quiz ${graded.passed ? 'passed' : 'failed'}: ${level.title}`,
      )
    }
  }

  const retake = () => {
    reset()
    setSessionReset(true)
  }

  return {
    short: quiz.short,
    mcq: quiz.mcq,
    result: quiz.result,
    resultCurrent: quiz.resultCurrent,
    edited: quiz.edited,
    sessionReset,
    submit,
    retake,
    changeShort: quiz.changeShort,
    changeMcq: quiz.changeMcq,
    /** Hides the last result without marking the session as reset (used when leaving a level). */
    dismissResult: quiz.dismissResult,
    resetForLevel: reset,
  }
}

export type LevelTestState = ReturnType<typeof useLevelTest>
