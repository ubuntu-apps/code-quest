import type { Level, TestQuestion } from '../types'
import type { LevelProgress } from '../progressStorage'
import { PASS_DEFAULT } from '../constants'
import { SimpleMarkdown } from '../SimpleMarkdown'
import { AddItemButton, EditableTestQuestionEditor, ListEditorActions } from '../../editor'

interface TestStepProps {
  level: Level
  prog: LevelProgress
  isEditMode: boolean
  testShort: Record<string, string>
  testMcq: Record<string, string>
  testResult: { correct: number; total: number; passed: boolean } | null
  onTestShortChange: (questionId: string, value: string) => void
  onTestMcqChange: (questionId: string, choiceId: string) => void
  onUpdatePassingScore: (score: number) => void
  onUpdateQuestion: (questionId: string, question: TestQuestion) => void
  onMoveQuestion: (questionId: string, direction: -1 | 1) => void
  onRemoveQuestion: (questionId: string) => void
  onAddQuestion: (type: 'mcq' | 'shortText') => void
  onSubmit: () => void
}

export function TestStep({
  level,
  prog,
  isEditMode,
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
}: TestStepProps) {
  return (
    <section className="cq-panel cq-test">
      <p className="cq-muted">
        Passing score:{' '}
        {isEditMode ? (
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
      <ol className="cq-test-list">
        {level.test.questions.map((q, qi) => (
          <li key={q.id} className="cq-test-item">
            <div className="cq-test-prompt">
              <span className="cq-test-num">{qi + 1}.</span>
              <div className="cq-test-content">
                <div className="cq-card-row cq-card-row--panel">
                  <div className="cq-test-body">
                    {q.type === 'mcq' ? (
                      <>
                        <p>{q.prompt}</p>
                        <div className="cq-mcq">
                          {q.choices.map((c) => (
                            <label key={c.id} className="cq-mcq-opt">
                              <input
                                type="radio"
                                name={`mcq-${q.id}`}
                                checked={testMcq[q.id] === c.id}
                                onChange={() => onTestMcqChange(q.id, c.id)}
                              />
                              <span>{c.label}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <SimpleMarkdown text={q.prompt} />
                        <textarea
                          className="cq-code-input"
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
        ))}
      </ol>
      <div className="cq-row cq-test-add-buttons">
        <AddItemButton label="Add MCQ" onClick={() => onAddQuestion('mcq')} />
        <AddItemButton label="Add short-text" onClick={() => onAddQuestion('shortText')} />
      </div>
      <button type="button" className="cq-btn cq-btn--primary" onClick={onSubmit}>
        Submit test
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
