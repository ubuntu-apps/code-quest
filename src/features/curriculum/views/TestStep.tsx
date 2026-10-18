import type { Level, TestGradeResult, TestQuestion } from '../types'
import type { LevelProgress } from '../progressStorage'
import { PASS_DEFAULT } from '../constants'
import { InlineMarkdown, SimpleMarkdown } from '../SimpleMarkdown'
import { AddItemButton, EditableTestQuestionEditor, ListEditorActions, useEditorMode } from '../../editor'
import { YesNoQuestionInput } from '../components/YesNoQuestionInput'
import { isYesNoQuestion, yesNoCorrectAnswer } from '../testQuestionUtils'

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
}: TestStepProps) {
  const { isEditingLocal } = useEditorMode()
  // Right answers are shown only once the quiz is passed (now or before), so a
  // failed attempt can't be turned into a pass by reading the feedback.
  const revealAnswers = testResult !== null && (testResult.passed || prog.testPassed)
  const resultCurrent = testResult !== null && Object.keys(testEdited).length === 0

  return (
    <section className="cq-panel cq-test">
      <p className="cq-muted">
        Passing score:{' '}
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
        % · {prog.testPassed ? 'You already passed at least once.' : 'Answer all questions, then Submit.'}
      </p>
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
          <li key={q.id} className={`cq-test-item${itemClass}`}>
            <div className="cq-test-prompt">
              <span className="cq-test-num">{qi + 1}.</span>
              <div className="cq-test-content">
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
                        <div className="cq-mcq">
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
                        <input
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
                    confirmMessage="Delete this test question?"
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
          {resultCurrent ? 'Retake' : testResult ? 'Submit again' : 'Submit test'}
        </button>
        {testResult && !resultCurrent ? (
          <button type="button" className="cq-btn" onClick={onRetake}>
            Start over
          </button>
        ) : null}
      </div>
      {testResult && resultCurrent && (
        <p className={testResult.passed ? 'cq-score cq-score--pass' : 'cq-score cq-score--fail'}>
          Score {testResult.correct}/{testResult.total} (
          {Math.round((testResult.correct / Math.max(testResult.total, 1)) * 100)}%){' '}
          {testResult.passed ? 'Passed' : 'Not passed'}
          {!revealAnswers && ' · Change the answers marked Incorrect and submit again. Correct answers are shown once you pass.'}
        </p>
      )}
      {testResult && !resultCurrent && (
        <p className="cq-muted">Answers you changed are no longer marked. Submit again to see your new score.</p>
      )}
    </section>
  )
}
