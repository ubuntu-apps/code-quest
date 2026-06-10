import type { Level, TestGradeResult, TestQuestion } from '../types'
import type { LevelProgress } from '../progressStorage'
import { PASS_DEFAULT } from '../constants'
import { SimpleMarkdown } from '../SimpleMarkdown'
import { AddItemButton, EditableTestQuestionEditor, ListEditorActions, useEditorMode } from '../../editor'
import { YesNoQuestionInput } from '../components/YesNoQuestionInput'
import { isYesNoQuestion, yesNoCorrectAnswer } from '../testQuestionUtils'

interface TestStepProps {
  level: Level
  prog: LevelProgress
  testShort: Record<string, string>
  testMcq: Record<string, string>
  testResult: TestGradeResult | null
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
          const showFeedback = testResult !== null
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
                        <p>{q.prompt}</p>
                        <div className="cq-mcq">
                          {q.choices.map((c) => {
                            const selected = testMcq[q.id] === c.id
                            const isCorrect = q.correctChoiceId === c.id
                            let optClass = 'cq-mcq-opt'
                            if (showFeedback) {
                              if (isCorrect) optClass += ' cq-mcq-opt--correct'
                              else if (selected) optClass += ' cq-mcq-opt--wrong'
                            }
                            return (
                            <label key={c.id} className={optClass}>
                              <input
                                type="radio"
                                name={`mcq-${q.id}`}
                                checked={selected}
                                onChange={() => onTestMcqChange(q.id, c.id)}
                              />
                              <span>{c.label}</span>
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
                        questionPassed={questionPassed}
                        onChange={(value) => onTestShortChange(q.id, value)}
                      />
                    ) : (
                      <>
                        <SimpleMarkdown text={q.prompt} />
                        <textarea
                          className={`cq-code-input${
                            showFeedback
                              ? questionPassed
                                ? ' cq-code-input--pass'
                                : ' cq-code-input--fail'
                              : ''
                          }`}
                          rows={2}
                          spellCheck={false}
                          value={testShort[q.id] ?? ''}
                          onChange={(e) => onTestShortChange(q.id, e.target.value)}
                        />
                      </>
                    )}
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
      <button
        type="button"
        className="cq-btn cq-btn--primary"
        onClick={testResult ? onRetake : onSubmit}
      >
        {testResult ? 'Retake' : 'Submit test'}
      </button>
      {testResult && (
        <p className={testResult.passed ? 'cq-score cq-score--pass' : 'cq-score cq-score--fail'}>
          Score {testResult.correct}/{testResult.total} (
          {Math.round((testResult.correct / Math.max(testResult.total, 1)) * 100)}%){' '}
          {testResult.passed ? 'Passed' : 'Not passed'}
        </p>
      )}
    </section>
  )
}
