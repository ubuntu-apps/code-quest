import { useCallback, useState } from 'react'
import { PASS_DEFAULT } from '../constants'
import { loadProgress, saveProgress } from '../progressStorage'
import type { Level, TestGradeResult } from '../types'
import { gradeTest } from '../validateAnswer'

/**
 * Answers and grading for a level's end-of-level test.
 * `onActivity` is called on every submit (used for the daily streak).
 */
export function useLevelTest(languageId: string | null, level: Level | null, onActivity: () => void) {
  const [short, setShort] = useState<Record<string, string>>({})
  const [mcq, setMcq] = useState<Record<string, string>>({})
  const [result, setResult] = useState<TestGradeResult | null>(null)
  /** True after the learner retakes or edits answers, so a past pass doesn't show "Next" yet. */
  const [sessionReset, setSessionReset] = useState(false)

  const submit = () => {
    if (!languageId || !level) return
    const passing = level.test.passingScorePercent ?? PASS_DEFAULT
    const graded = gradeTest(level.test.questions, short, mcq, passing)
    setResult(graded)
    if (graded.passed) setSessionReset(false)
    const prev = loadProgress(languageId, level.id)
    saveProgress(languageId, level.id, { ...prev, testPassed: prev.testPassed || graded.passed })
    onActivity()
  }

  const clearResult = () => {
    setResult(null)
    setSessionReset(true)
  }

  const retake = () => {
    setShort({})
    setMcq({})
    clearResult()
  }

  const changeShort = (questionId: string, value: string) => {
    clearResult()
    setShort((prev) => ({ ...prev, [questionId]: value }))
  }

  const changeMcq = (questionId: string, choiceId: string) => {
    clearResult()
    setMcq((prev) => ({ ...prev, [questionId]: choiceId }))
  }

  /** Hides the last result without marking the session as reset (used when leaving a level). */
  const dismissResult = () => setResult(null)

  const resetForLevel = useCallback(() => {
    setShort({})
    setMcq({})
    setResult(null)
  }, [])

  return {
    short,
    mcq,
    result,
    sessionReset,
    submit,
    retake,
    changeShort,
    changeMcq,
    dismissResult,
    resetForLevel,
  }
}
