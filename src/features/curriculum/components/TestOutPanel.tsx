import { useState } from 'react'
import type { LoadedSection, TestGradeResult, TestQuestion } from '../types'
import { gradeTest } from '../validateAnswer'
import { playSound } from '../../sound/sound'
import { answeredQuestionIds, recordReviewAnswers } from '../../review/reviewStorage'
import { countEvent } from '../../../lib/analytics'
import { TestStep } from '../views/TestStep'
import { CodeLanguageContext } from '../codeLanguageContext'
import {
  buildTestOutQuestions,
  canTestOut,
  hasTestedOut,
  markTestedOut,
  TEST_OUT_PASS_PERCENT,
} from '../testOut'

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
  const [short, setShort] = useState<Record<string, string>>({})
  const [mcq, setMcq] = useState<Record<string, string>>({})
  const [result, setResult] = useState<TestGradeResult | null>(null)
  const [edited, setEdited] = useState<Record<string, true>>({})
  const testedOut = hasTestedOut(languageId, sectionId)

  if (!canTestOut(levels)) return null

  const start = () => {
    setQuestions(buildTestOutQuestions(levels))
    setShort({})
    setMcq({})
    setResult(null)
    setEdited({})
    setOpen(true)
  }

  const markEdited = (questionId: string) =>
    setEdited((prev) => (prev[questionId] ? prev : { ...prev, [questionId]: true }))

  const submit = () => {
    const graded = gradeTest(questions, short, mcq, TEST_OUT_PASS_PERCENT)
    setResult(graded)
    setEdited({})
    playSound(graded.passed ? 'quizPass' : 'quizFail')
    recordReviewAnswers(languageId, graded.byQuestion, answeredQuestionIds(short, mcq))
    if (graded.passed && !testedOut) markTestedOut(languageId, sectionId)
    countEvent(
      `skip-ahead-${graded.passed ? 'passed' : 'failed'}/${sectionId}`,
      `Skip-ahead quiz ${graded.passed ? 'passed' : 'failed'}: ${section.sectionRef.title}`,
    )
  }

  const unlocks = nextSectionTitle
    ? `every lesson here and the next section, ${nextSectionTitle}`
    : 'every lesson here'

  if (testedOut && !open) {
    return (
      <p className="cq-testout-done" role="status">
        {`You passed the skip-ahead quiz, so you can open ${unlocks}. The lessons are still here to practise.`}
      </p>
    )
  }

  if (!open) {
    return (
      <section className="cq-panel cq-testout">
        <h2 className="cq-subtitle">Already know this?</h2>
        <p className="cq-muted">
          {`Take a skip-ahead quiz of ${buildTestOutQuestions(levels, undefined, () => 0).length} questions from this section's lessons. Score ${TEST_OUT_PASS_PERCENT}% or more to open ${unlocks}. It doesn't earn XP, and you can take it again.`}
        </p>
        <div className="cq-row">
          <button type="button" className="cq-btn" onClick={start}>
            Start the skip-ahead quiz
          </button>
        </div>
      </section>
    )
  }

  // TestStep shows any quiz; this one is a made-up "level" holding the picked questions.
  const quizLevel = {
    id: `testout_${sectionId}`,
    title: `${section.sectionRef.title} skip-ahead quiz`,
    intro: { bodyMarkdown: '' },
    challenges: [],
    test: { passingScorePercent: TEST_OUT_PASS_PERCENT, questions },
  }

  return (
    <section className="cq-testout cq-testout--open">
      <div className="cq-card-row cq-card-row--panel">
        <h2 className="cq-subtitle">Skip-ahead quiz</h2>
        <button type="button" className="cq-btn cq-btn--sm" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>
      {result?.passed ? (
        <p className="cq-testout-done" role="status">
          {`Passed! You can now open ${unlocks}.`}
        </p>
      ) : null}
      <CodeLanguageContext.Provider value={languageId}>
        <TestStep
          level={quizLevel}
          prog={{ challengesCompleted: [], testPassed: testedOut, challengeAnswers: {} }}
          testShort={short}
          testMcq={mcq}
          testResult={result}
          testEdited={edited}
          onTestShortChange={(id, value) => {
            markEdited(id)
            setShort((prev) => ({ ...prev, [id]: value }))
          }}
          onTestMcqChange={(id, choice) => {
            markEdited(id)
            setMcq((prev) => ({ ...prev, [id]: choice }))
          }}
          onUpdatePassingScore={() => undefined}
          onUpdateQuestion={() => undefined}
          onMoveQuestion={() => undefined}
          onRemoveQuestion={() => undefined}
          onAddQuestion={() => undefined}
          onSubmit={submit}
          // "Retake" draws a new set of questions.
          onRetake={start}
        />
      </CodeLanguageContext.Provider>
    </section>
  )
}
