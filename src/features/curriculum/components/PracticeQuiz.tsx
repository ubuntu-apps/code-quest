import type { TestQuestion } from '../content/types'
import { TestStep } from '../views/TestStep'
import { CodeLanguageContext } from '../codeLanguageContext'
import type { QuizState } from '../hooks/useQuiz'

interface PracticeQuizProps {
  languageId: string
  /** For the quiz's own ids and its "Report a problem" link. */
  id: string
  title: string
  questions: TestQuestion[]
  passingPercent: number
  quiz: QuizState
  /** Passed before (right answers can be shown from the start). */
  passedBefore?: boolean
  /** Nothing is at stake: right answers are shown after the first check. */
  practice?: boolean
  /** Each question's lesson, shown above it. */
  questionSources?: Record<string, string>
  onSubmit: () => void
  onRetake: () => void
}

/**
 * A quiz made up of questions from several lessons (the skip-ahead gate, the daily review),
 * shown like a stage's gate. The gate's view takes a stage, so this one is a made-up stage
 * holding just the questions.
 */
export function PracticeQuiz({
  languageId,
  id,
  title,
  questions,
  passingPercent,
  quiz,
  passedBefore = false,
  practice = false,
  questionSources,
  onSubmit,
  onRetake,
}: PracticeQuizProps) {
  const level = {
    id,
    title,
    intro: { bodyMarkdown: '' },
    challenges: [],
    test: { passingScorePercent: passingPercent, questions },
  }
  return (
    <CodeLanguageContext.Provider value={languageId}>
      <TestStep
        practice={practice}
        questionSources={questionSources}
        level={level}
        prog={{ challengesCompleted: [], testPassed: passedBefore, challengeAnswers: {} }}
        testShort={quiz.short}
        testMcq={quiz.mcq}
        testResult={quiz.result}
        testEdited={quiz.edited}
        onTestShortChange={quiz.changeShort}
        onTestMcqChange={quiz.changeMcq}
        onSubmit={onSubmit}
        onRetake={onRetake}
      />
    </CodeLanguageContext.Provider>
  )
}
