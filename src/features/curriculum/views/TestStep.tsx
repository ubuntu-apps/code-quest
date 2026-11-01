import type { ReactNode } from 'react'
import { DoorClosed, DoorOpen } from 'lucide-react'
import type { Level, TestGradeResult, TestQuestion } from '../types'
import type { LevelProgress } from '../progressStorage'
import { PASS_DEFAULT } from '../constants'
import { InlineMarkdown, SimpleMarkdown } from '../SimpleMarkdown'
import { AddItemButton, EditableTestQuestionEditor, ListEditorActions, useEditorMode } from '../../editor'
import { YesNoQuestionInput } from '../components/YesNoQuestionInput'
import { isYesNoQuestion, yesNoCorrectAnswer } from '../testQuestionUtils'
import { reportProblemUrl } from '../reportProblem'
import { AnswerInput } from '../codeEditor/AnswerInput'

interface TestStepProps {
  level: Level
  prog: LevelProgress
  testShort: Record<string, string>
  testMcq: Record<string, string>
  testResult: TestGradeResult | null
  /** Questions changed since the last Submit: their marks are hidden until the next Submit. */
  testEdited: Record<string, true>
  onTestShortChange: (questionId: string, value: string) => void
  onTestMcqChange: (questionId: string, choiceId: string) => void
  onUpdatePassingScore: (score: number) => void
  onUpdateQuestion: (questionId: string, question: TestQuestion) => void
  onMoveQuestion: (questionId: string, direction: -1 | 1) => void
  onRemoveQuestion: (questionId: string) => void
  onAddQuestion: (type: 'mcq' | 'shortText') => void
  onSubmit: () => void
  onRetake: () => void
  /** Shown as a "Next lesson" button once the quiz is passed (null: no next lesson). */
  nextLevelTitle?: string | null
  onGoToNextLevel?: () => void
  /** Solved challenges, for a gentle "practise first" note before the first attempt. */
  challengesDone?: number
  onGoToChallenges?: () => void
  /** Shown under the result once the quiz is passed (e.g. a section certificate). */
  afterPass?: ReactNode
  /**
   * Practice (the daily review): no passing score, "Check answers", and the right answers
   * and explanations are shown after the first check.
   */
  practice?: boolean
  /** The lesson each question comes from, shown next to its number (used in review). */
  questionSources?: Record<string, string>
}

export function TestStep({
  level,
  prog,
  testShort,
  testMcq,
  testResult,
  testEdited,
  onTestShortChange,
  onTestMcqChange,
  onUpdatePassingScore,
  onUpdateQuestion,
  onMoveQuestion,
  onRemoveQuestion,
  onAddQuestion,
  onSubmit,
  onRetake,
  nextLevelTitle = null,
  onGoToNextLevel,
  challengesDone,
  onGoToChallenges,
  afterPass,
  practice = false,
  questionSources,
}: TestStepProps) {
  const { isEditingLocal } = useEditorMode()
  // Before a first attempt, nudge learners who skipped most of the challenges (not a lock).
  const challengesTotal = level.challenges.length
  const suggestPractice =
    !isEditingLocal &&
    !prog.testPassed &&
    testResult === null &&
    challengesDone !== undefined &&
    challengesTotal > 0 &&
    challengesDone < Math.ceil(challengesTotal / 2)
  // Right answers are shown only once the quiz is passed (now or before), so a
  // failed attempt can't be turned into a pass by reading the feedback. In practice
  // nothing is at stake, so they are shown after the first check.
  const revealAnswers = testResult !== null && (practice || testResult.passed || prog.testPassed)
  const resultCurrent = testResult !== null && Object.keys(testEdited).length === 0

  return (
    <section className="cq-panel cq-test">
      {suggestPractice ? (
        <p className="cq-test-practice-note">
          {`You've solved ${challengesDone} of ${challengesTotal} challenges. Working through them first makes this gate much easier.`}{' '}
          {onGoToChallenges ? (
            <button type="button" className="cq-link-btn" onClick={onGoToChallenges}>
              Go to the challenges
            </button>
          ) : null}
        </p>
      ) : null}
      {practice ? null : (
        <p className="cq-muted">
          To clear the gate:{' '}
          {isEditingLocal ? (
            <input
              type="number"
              className="cq-editable-input"
              style={{ width: '4rem', display: 'inline' }}
              min={0}
              max={100}
              value={level.test.passingScorePercent ?? PASS_DEFAULT}
              onChange={(e) => onUpdatePassingScore(Number(e.target.value))}
            />
          ) : (
            (level.test.passingScorePercent ?? PASS_DEFAULT)
          )}
          % · {prog.testPassed ? "You've cleared this gate before." : 'Answer every question, then press Check my answers.'}
        </p>
      )}
      <ul className="cq-test-list">
        {level.test.questions.map((q, qi) => {
          const showFeedback = testResult !== null && !testEdited[q.id]
          const questionPassed = testResult?.byQuestion[q.id]
          const itemClass = showFeedback
            ? questionPassed
              ? ' cq-test-item--pass'
              : ' cq-test-item--fail'
            : ''

          return (
          <li key={q.id} className={`cq-test-item${itemClass}`} data-scroll-anchor={`question-${q.id}`}>
            <div className="cq-test-prompt">
              <div className="cq-test-content">
                <p className="cq-test-num">
                  Question {qi + 1} of {level.test.questions.length}
                  {questionSources?.[q.id] ? <span className="cq-test-source"> · {questionSources[q.id]}</span> : null}
                </p>
                <div className="cq-card-row cq-card-row--panel">
                  <div className="cq-test-body">
                    {showFeedback && (
                      <span
                        className={`cq-test-status${questionPassed ? ' cq-test-status--pass' : ' cq-test-status--fail'}`}
                      >
                        {questionPassed ? 'Correct' : 'Incorrect'}
                      </span>
                    )}
                    {q.type === 'mcq' ? (
                      <>
                        <SimpleMarkdown text={q.prompt} />
                        <div className="cq-mcq" role="radiogroup" aria-label={`Question ${qi + 1}`}>
                          {q.choices.map((c) => {
                            const selected = testMcq[q.id] === c.id
                            const isCorrect = q.correctChoiceId === c.id
                            let optClass = 'cq-mcq-opt'
                            if (showFeedback) {
                              if (selected) optClass += questionPassed ? ' cq-mcq-opt--correct' : ' cq-mcq-opt--wrong'
                              else if (revealAnswers && isCorrect) optClass += ' cq-mcq-opt--correct'
                            }
                            return (
                            <label key={c.id} className={optClass}>
                              <input
                                type="radio"
                                name={`mcq-${q.id}`}
                                checked={selected}
                                onChange={() => onTestMcqChange(q.id, c.id)}
                              />
                              <span>
                                <InlineMarkdown text={c.label} />
                              </span>
                            </label>
                            )
                          })}
                        </div>
                      </>
                    ) : isYesNoQuestion(q) ? (
                      <YesNoQuestionInput
                        prompt={q.prompt}
                        value={testShort[q.id]}
                        correctAnswer={yesNoCorrectAnswer(q)!}
                        showFeedback={showFeedback}
                        revealAnswer={revealAnswers}
                        questionPassed={questionPassed}
                        onChange={(value) => onTestShortChange(q.id, value)}
                      />
                    ) : (
                      <>
                        <SimpleMarkdown text={q.prompt} />
                        <AnswerInput
                          type="text"
                          className={`cq-code-input cq-short-answer${
                            showFeedback
                              ? questionPassed
                                ? ' cq-code-input--pass'
                                : ' cq-code-input--fail'
                              : ''
                          }`}
                          aria-label={`Answer to question ${qi + 1}`}
                          autoComplete="off"
                          autoCapitalize="off"
                          autoCorrect="off"
                          spellCheck={false}
                          value={testShort[q.id] ?? ''}
                          onChange={(e) => onTestShortChange(q.id, e.target.value)}
                        />
                        {revealAnswers && !questionPassed && q.validation.expected && (
                          <p className="cq-test-answer">
                            Answer: <code>{q.validation.expected}</code>
                          </p>
                        )}
                      </>
                    )}
                    {/* Like the right answers, explanations stay hidden on wrong answers until
                        the quiz is passed, so they can't be used to fix a failed attempt. */}
                    {showFeedback && q.explanation && (questionPassed || revealAnswers) ? (
                      <div className="cq-test-explanation">
                        <InlineMarkdown text={q.explanation} />
                      </div>
                    ) : null}
                  </div>
                  <ListEditorActions
                    canMoveUp={qi > 0}
                    canMoveDown={qi < level.test.questions.length - 1}
                    onMoveUp={() => onMoveQuestion(q.id, -1)}
                    onMoveDown={() => onMoveQuestion(q.id, 1)}
                    confirmMessage="Delete this gate question?"
                    onDelete={() => onRemoveQuestion(q.id)}
                  />
                </div>
                <EditableTestQuestionEditor
                  question={q}
                  onChange={(question) => onUpdateQuestion(q.id, question)}
                />
              </div>
            </div>
          </li>
          )
        })}
      </ul>
      <div className="cq-row cq-test-add-buttons">
        <AddItemButton label="Add MCQ" onClick={() => onAddQuestion('mcq')} />
        <AddItemButton label="Add short-text" onClick={() => onAddQuestion('shortText')} />
      </div>
      <div className="cq-row">
        <button
          type="button"
          className="cq-btn cq-btn--primary"
          onClick={resultCurrent ? onRetake : onSubmit}
        >
          {practice
            ? resultCurrent
              ? 'Done'
              : testResult
                ? 'Check again'
                : 'Check answers'
            : resultCurrent
              ? 'Retake'
              : testResult
                ? 'Submit again'
                : 'Check my answers'}
        </button>
        {testResult && !resultCurrent && !practice ? (
          <button type="button" className="cq-btn" onClick={onRetake}>
            Start over
          </button>
        ) : null}
      </div>
      {/* Read out after Submit; the score line below appears too late to be announced itself. */}
      <p className="cq-sr-only" role="status">
        {testResult && resultCurrent
          ? `Score ${testResult.correct} out of ${testResult.total}.${practice ? '' : testResult.passed ? ' Gate cleared.' : ' The gate is still shut.'}`
          : ''}
      </p>
      {testResult && resultCurrent && (
        <p
          className={
            (practice ? testResult.correct * 2 >= testResult.total : testResult.passed)
              ? 'cq-score cq-score--pass'
              : 'cq-score cq-score--fail'
          }
        >
          {practice ? null : testResult.passed ? (
            <span className="cq-gate-result">
              <DoorOpen size={22} aria-hidden className="cq-gate-door cq-gate-door--open" /> Gate cleared!{' '}
            </span>
          ) : (
            <span className="cq-gate-result">
              <DoorClosed size={22} aria-hidden className="cq-gate-door" /> The gate stays shut.{' '}
            </span>
          )}
          Score {testResult.correct}/{testResult.total} (
          {Math.round((testResult.correct / Math.max(testResult.total, 1)) * 100)}%)
          {!revealAnswers && ' · Change the answers marked Incorrect and submit again. Correct answers are shown once you clear the gate.'}
        </p>
      )}
      {testResult && resultCurrent && testResult.passed && !isEditingLocal ? afterPass : null}
      {testResult && resultCurrent && testResult.passed && nextLevelTitle && onGoToNextLevel ? (
        <div className="cq-row">
          <button type="button" className="cq-btn cq-btn--primary" onClick={onGoToNextLevel}>
            Next stage: {nextLevelTitle}
          </button>
        </div>
      ) : null}
      {testResult && !resultCurrent && (
        <p className="cq-muted">Answers you changed are no longer marked. Submit again to see your new score.</p>
      )}
      {!isEditingLocal ? (
        <a
          className="cq-report-link"
          href={reportProblemUrl(`the gate for "${level.title}"`, `gate for stage ${level.id}`)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Report a problem with this gate
        </a>
      ) : null}
    </section>
  )
}
