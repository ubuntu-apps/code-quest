import { useState } from 'react'
import type { LoadedSection, TestQuestion } from '../content/types'
import { playSound } from '../../sound/sound'
import { recordReviewAnswers } from '../../review/reviewStorage'
import { countEvent } from '../../../lib/analytics'
import { useQuiz } from '../hooks/useQuiz'
import { PracticeQuiz } from './PracticeQuiz'
import {
  buildTestOutQuestions,
  canTestOut,
  hasTestedOut,
  markTestedOut,
  TEST_OUT_PASS_PERCENT,
} from '../progress/testOut'

interface TestOutPanelProps {
  languageId: string
  section: LoadedSection
  /** Title of the section after this one, which a pass unlocks (null for the last section). */
  nextSectionTitle: string | null
}

/**
 * On a section's page: "Already know this?" A quiz made from the section's lessons;
 * passing it opens every lesson here and the next section (see testOut.ts).
 */
export function TestOutPanel({ languageId, section, nextSectionTitle }: TestOutPanelProps) {
  const sectionId = section.sectionRef.id
  const levels = section.file.levels
  const [open, setOpen] = useState(false)
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const quiz = useQuiz()
  const testedOut = hasTestedOut(languageId, sectionId)

  if (!canTestOut(levels)) return null

  const start = () => {
    setQuestions(buildTestOutQuestions(levels))
    quiz.reset()
    setOpen(true)
  }

  const submit = () => {
    const { graded, answeredIds } = quiz.grade(questions, TEST_OUT_PASS_PERCENT)
    playSound(graded.passed ? 'quizPass' : 'quizFail')
    recordReviewAnswers(languageId, graded.byQuestion, answeredIds)
    if (graded.passed && !testedOut) markTestedOut(languageId, sectionId)
    countEvent(
      `skip-ahead-${graded.passed ? 'passed' : 'failed'}/${sectionId}`,
      `Skip-ahead quiz ${graded.passed ? 'passed' : 'failed'}: ${section.sectionRef.title}`,
    )
  }

  const unlocks = nextSectionTitle
    ? `every stage here and the next quest, ${nextSectionTitle}`
    : 'every stage here'

  if (testedOut && !open) {
    return (
      <p className="cq-testout-done" role="status">
        {`You cleared the skip-ahead gate, so you can open ${unlocks}. The stages are still here to practise.`}
      </p>
    )
  }

  if (!open) {
    return (
      <section className="cq-panel cq-testout">
        <h2 className="cq-subtitle">Already know this?</h2>
        <p className="cq-muted">
          {`Take a skip-ahead gate of ${buildTestOutQuestions(levels, undefined, () => 0).length} questions from this quest's stages. Score ${TEST_OUT_PASS_PERCENT}% or more to open ${unlocks}. It doesn't earn XP, and you can take it again.`}
        </p>
        <div className="cq-row">
          <button type="button" className="cq-btn" onClick={start}>
            Start the skip-ahead gate
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="cq-testout cq-testout--open">
      <div className="cq-card-row cq-card-row--panel">
        <h2 className="cq-subtitle">Skip-ahead gate</h2>
        <button type="button" className="cq-btn cq-btn--sm" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>
      {quiz.result?.passed ? (
        <p className="cq-testout-done" role="status">
          {`Passed! You can now open ${unlocks}.`}
        </p>
      ) : null}
      <PracticeQuiz
        languageId={languageId}
        id={`testout_${sectionId}`}
        title={`${section.sectionRef.title} skip-ahead gate`}
        questions={questions}
        passingPercent={TEST_OUT_PASS_PERCENT}
        quiz={quiz}
        passedBefore={testedOut}
        onSubmit={submit}
        // "Retake" draws a new set of questions.
        onRetake={start}
      />
    </section>
  )
}
