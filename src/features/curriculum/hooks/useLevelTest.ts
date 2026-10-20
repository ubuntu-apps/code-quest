import { useCallback, useState } from 'react'
import { PASS_DEFAULT, TEST_XP } from '../constants'
import { loadProgress, saveProgress } from '../progressStorage'
import type { Level, TestGradeResult } from '../types'
import { gradeTest } from '../validateAnswer'
import { playSound } from '../../sound/sound'

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
  const [short, setShort] = useState<Record<string, string>>({})
  const [mcq, setMcq] = useState<Record<string, string>>({})
  const [result, setResult] = useState<TestGradeResult | null>(null)
  /** True after the learner retakes or edits answers, so a past pass doesn't show "Next" yet. */
  const [sessionReset, setSessionReset] = useState(false)
  /**
   * Questions changed since the last Submit. Their Correct/Incorrect marks are hidden, the
   * others stay, so a learner can fix the wrong ones and submit again.
   */
  const [edited, setEdited] = useState<Record<string, true>>({})

  const submit = () => {
    if (!languageId || !level) return
    const passing = level.test.passingScorePercent ?? PASS_DEFAULT
    const graded = gradeTest(level.test.questions, short, mcq, passing)
    setResult(graded)
    setEdited({})
    playSound(graded.passed ? 'quizPass' : 'quizFail')
    if (graded.passed) setSessionReset(false)
    const prev = loadProgress(languageId, level.id)
    saveProgress(languageId, level.id, { ...prev, testPassed: prev.testPassed || graded.passed })
    if (graded.passed && !prev.testPassed) onXp?.(TEST_XP)
    // A blank submit isn't practice, so it doesn't keep the daily streak going.
    const answered =
      Object.values(short).some((value) => value.trim() !== '') || Object.keys(mcq).length > 0
    if (answered) onActivity()
  }

  const retake = () => {
    setShort({})
    setMcq({})
    setResult(null)
    setEdited({})
    setSessionReset(true)
  }

  const markEdited = (questionId: string) => {
    setSessionReset(true)
    setEdited((prev) => (prev[questionId] ? prev : { ...prev, [questionId]: true }))
  }

  const changeShort = (questionId: string, value: string) => {
    markEdited(questionId)
    setShort((prev) => ({ ...prev, [questionId]: value }))
  }

  const changeMcq = (questionId: string, choiceId: string) => {
    markEdited(questionId)
    setMcq((prev) => ({ ...prev, [questionId]: choiceId }))
  }

  /** Hides the last result without marking the session as reset (used when leaving a level). */
  const dismissResult = () => {
    setResult(null)
    setEdited({})
  }

  const resetForLevel = useCallback(() => {
    setShort({})
    setMcq({})
    setResult(null)
    setEdited({})
  }, [])

  /** The last result still describes every answer (nothing changed since Submit). */
  const resultCurrent = result !== null && Object.keys(edited).length === 0

  return {
    short,
    mcq,
    result,
    resultCurrent,
    edited,
    sessionReset,
    submit,
    retake,
    changeShort,
    changeMcq,
    dismissResult,
    resetForLevel,
  }
}
