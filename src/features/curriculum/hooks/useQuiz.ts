import { useCallback, useState } from 'react'
import type { TestGradeResult, TestQuestion } from '../content/types'
import { gradeTest } from '../content/validateAnswer'
import { answeredQuestionIds } from '../../review/reviewStorage'

/**
 * A quiz's answers and its last result: the gate at the end of a stage, the skip-ahead gate
 * and the daily review all use it. After a check, answers the learner changes are marked
 * `edited`: their Correct/Incorrect marks hide, the others stay, so wrong ones can be fixed
 * and checked again.
 *
 * @param onEdit Called whenever an answer changes (the gate uses it to hide "Next" again).
 */
export function useQuiz(onEdit?: () => void) {
  const [short, setShort] = useState<Record<string, string>>({})
  const [mcq, setMcq] = useState<Record<string, string>>({})
  const [result, setResult] = useState<TestGradeResult | null>(null)
  const [edited, setEdited] = useState<Record<string, true>>({})

  const markEdited = (questionId: string) => {
    onEdit?.()
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

  /** Grades the answers and shows the result. `answeredIds`: the questions actually answered. */
  const grade = (questions: TestQuestion[], passingPercent: number) => {
    const graded = gradeTest(questions, short, mcq, passingPercent)
    setResult(graded)
    setEdited({})
    return { graded, answeredIds: answeredQuestionIds(short, mcq) }
  }

  /** Clears the answers and the result, for a new attempt. */
  const reset = useCallback(() => {
    setShort({})
    setMcq({})
    setResult(null)
    setEdited({})
  }, [])

  /** Hides the last result, keeping the answers. */
  const dismissResult = () => {
    setResult(null)
    setEdited({})
  }

  /** The last result still describes every answer (nothing changed since the check). */
  const resultCurrent = result !== null && Object.keys(edited).length === 0

  return { short, mcq, result, edited, resultCurrent, changeShort, changeMcq, grade, reset, dismissResult }
}

export type QuizState = ReturnType<typeof useQuiz>
