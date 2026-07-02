import { useState } from 'react'
import type { Challenge } from '../types'
import type { FriendlyPythonError, PythonChallengeTestResult } from '../pythonSandbox'
import type { FriendlyRError, RChallengeTestResult } from '../rSandbox'
import { CodeTextareaWithErrorLine } from '../codeEditor'
import { pythonErrorSummaryLine } from '../pythonErrorHelper'
import { rErrorSummaryLine } from '../rErrorHelper'
import { PythonErrorPanel } from './PythonErrorPanel'
import {
  EditableMarkdown,
  EditableText,
  EditableTextarea,
  EditableValidationEditor,
  ListEditorActions,
  useEditorMode,
} from '../../editor'

interface ChallengeCardProps {
  challenge: Challenge
  chIndex: number
  totalChallenges: number
  draft: string
  done: boolean
  status: 'passed' | 'failed' | undefined
  testResults: (PythonChallengeTestResult | RChallengeTestResult)[]
  runtimeError: FriendlyPythonError | FriendlyRError | null
  errorExpanded: boolean
  errorUiEpoch: number
  onDraftChange: (value: string) => void
  onCheck: () => void
  onUpdateChallenge: (patch: Partial<Challenge>) => void
  onMove: (direction: -1 | 1) => void
  onDelete: () => void
  onToggleErrorExpanded: () => void
}

export function ChallengeCard({
  challenge: ch,
  chIndex,
  totalChallenges,
  draft,
  done,
  status,
  testResults,
  runtimeError: pyRuntimeErr,
  errorExpanded: pyErrExpanded,
  errorUiEpoch,
  onDraftChange,
  onCheck,
  onUpdateChallenge,
  onMove,
  onDelete,
  onToggleErrorExpanded,
}: ChallengeCardProps) {
  const { isEditingLocal } = useEditorMode()
  const [showHint, setShowHint] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const hintText = ch.hint ?? ch.hints?.[0]
  const isRuntimeTests =
    ch.validation.mode === 'python_tests' || ch.validation.mode === 'r_tests'

  return (
    <div className="cq-panel cq-challenge-card">
      <div className="cq-card-row cq-card-row--panel">
        <EditableText
          as="h2"
          className="cq-subtitle"
          value={ch.title}
          onChange={(title) => onUpdateChallenge({ title })}
        />
        <ListEditorActions
          canMoveUp={chIndex > 0}
          canMoveDown={chIndex < totalChallenges - 1}
          onMoveUp={() => onMove(-1)}
          onMoveDown={() => onMove(1)}
          confirmMessage={`Delete challenge "${ch.title}"?`}
          onDelete={onDelete}
        />
      </div>
      <EditableMarkdown
        value={ch.promptMarkdown}
        onChange={(promptMarkdown) => onUpdateChallenge({ promptMarkdown })}
      />
      {isEditingLocal && (
        <>
          <EditableTextarea
            label="Starter code"
            rows={2}
            value={ch.starterCode ?? ''}
            onChange={(starterCode) => onUpdateChallenge({ starterCode })}
          />
          <EditableTextarea
            label="Hint"
            rows={2}
            value={ch.hint ?? ch.hints?.[0] ?? ''}
            onChange={(hint) => onUpdateChallenge({ hint, hints: undefined })}
          />
          <EditableTextarea
            label="Solution (answer code)"
            rows={4}
            value={ch.solution ?? ''}
            onChange={(solution) => onUpdateChallenge({ solution })}
          />
          <EditableValidationEditor
            validation={ch.validation}
            onChange={(validation) => onUpdateChallenge({ validation })}
          />
        </>
      )}
      <div className="cq-challenge-help-row">
        <button type="button" className="cq-btn cq-btn--sm" onClick={() => setShowHint((v) => !v)}>
          {showHint ? 'Hide hint' : 'Hint'}
        </button>
        <button type="button" className="cq-btn cq-btn--sm" onClick={() => setShowAnswer((v) => !v)}>
          {showAnswer ? 'Hide answer' : 'Answer'}
        </button>
      </div>
      {showHint ? (
        <div className="cq-challenge-reveal cq-challenge-reveal--hint">
          {hintText ?? 'No hint available for this challenge yet.'}
        </div>
      ) : null}
      {showAnswer ? (
        <pre className="cq-challenge-reveal cq-challenge-reveal--answer">
          {ch.solution ?? 'No answer available for this challenge yet.'}
        </pre>
      ) : null}
      <label className="cq-label" htmlFor={`code-${ch.id}`}>
        Your answer
      </label>
      <CodeTextareaWithErrorLine
        id={`code-${ch.id}`}
        className="cq-code-input"
        rows={4}
        spellCheck={false}
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        errorLine={isRuntimeTests && pyRuntimeErr?.line != null ? pyRuntimeErr.line : null}
        errorSummary={
          isRuntimeTests && pyRuntimeErr?.detail
            ? ch.validation.mode === 'r_tests'
              ? rErrorSummaryLine(pyRuntimeErr.detail)
              : pythonErrorSummaryLine(pyRuntimeErr.detail)
            : null
        }
        errorTitle={isRuntimeTests ? (pyRuntimeErr?.title ?? null) : null}
        errorColumn={isRuntimeTests ? (pyRuntimeErr?.column ?? null) : null}
        errorUiEpoch={errorUiEpoch}
      />
      <div className="cq-row">
        <button type="button" className="cq-btn cq-btn--primary" onClick={onCheck}>
          {status === 'failed' ? 'Try again' : done ? 'Check again' : 'Check'}
        </button>
        {done && status !== 'failed' && draft.trim() !== '' ? (
          <span className="cq-badge cq-badge--ok">Challenge complete</span>
        ) : null}
      </div>
      {isRuntimeTests && pyRuntimeErr && (
        <PythonErrorPanel
          error={pyRuntimeErr as FriendlyPythonError}
          code={draft}
          expanded={pyErrExpanded}
          onToggleExpanded={onToggleErrorExpanded}
        />
      )}
      {testResults.length > 0 && (
        <ul className="cq-testcase-list">
          {testResults.map((t) => (
            <li
              key={t.id}
              className={`cq-testcase-item${t.passed ? ' cq-testcase-item--pass' : ' cq-testcase-item--fail'}`}
            >
              <span>{t.label}</span>
              <span>{t.passed ? 'Pass' : 'Fail'}</span>
              {!t.passed && t.detail ? <div className="cq-testcase-detail">{t.detail}</div> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
