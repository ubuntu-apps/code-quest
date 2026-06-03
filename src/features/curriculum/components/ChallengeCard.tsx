import type { Challenge } from '../types'
import type { PythonAiHelp } from '../freeAiHelp'
import type { FriendlyPythonError, PythonChallengeTestResult } from '../pythonSandbox'
import { CodeTextareaWithErrorLine } from '../codeEditor'
import { pythonErrorSummaryLine } from '../pythonErrorHelper'
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
  testResults: PythonChallengeTestResult[]
  runtimeError: FriendlyPythonError | null
  errorExpanded: boolean
  errorUiEpoch: number
  aiHelp: PythonAiHelp | null
  aiLoading: boolean
  fixCopied: boolean
  onDraftChange: (value: string) => void
  onCheck: () => void
  onUpdateChallenge: (patch: Partial<Challenge>) => void
  onMove: (direction: -1 | 1) => void
  onDelete: () => void
  onToggleErrorExpanded: () => void
  onRequestAiHelp: () => void
  onFixCopied: (copied: boolean) => void
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
  aiHelp: pyAiHelp,
  aiLoading: pyAiLoading,
  fixCopied: pyFixCopied,
  onDraftChange,
  onCheck,
  onUpdateChallenge,
  onMove,
  onDelete,
  onToggleErrorExpanded,
  onRequestAiHelp,
  onFixCopied,
}: ChallengeCardProps) {
  const { isEditingLocal } = useEditorMode()

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
            label="Hints (one per line)"
            rows={2}
            value={(ch.hints ?? []).join('\n')}
            onChange={(raw) =>
              onUpdateChallenge({ hints: raw.split('\n').filter((h) => h.length > 0) })
            }
          />
          <EditableValidationEditor
            validation={ch.validation}
            onChange={(validation) => onUpdateChallenge({ validation })}
          />
        </>
      )}
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
        errorLine={
          ch.validation.mode === 'python_tests' && pyRuntimeErr?.line != null ? pyRuntimeErr.line : null
        }
        errorSummary={
          ch.validation.mode === 'python_tests' && pyRuntimeErr?.detail
            ? pythonErrorSummaryLine(pyRuntimeErr.detail)
            : null
        }
        errorTitle={ch.validation.mode === 'python_tests' ? (pyRuntimeErr?.title ?? null) : null}
        errorColumn={ch.validation.mode === 'python_tests' ? (pyRuntimeErr?.column ?? null) : null}
        errorUiEpoch={errorUiEpoch}
      />
      {ch.hints && ch.hints.length > 0 && (
        <details className="cq-hints">
          <summary>Hints</summary>
          <ul>
            {ch.hints.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </details>
      )}
      <div className="cq-row">
        <button type="button" className="cq-btn cq-btn--primary" onClick={onCheck}>
          {status === 'failed' ? 'Try again' : done ? 'Check again' : 'Check'}
        </button>
        {done && status !== 'failed' && draft.trim() !== '' ? (
          <span className="cq-badge cq-badge--ok">Challenge complete</span>
        ) : null}
      </div>
      {ch.validation.mode === 'python_tests' && pyRuntimeErr && (
        <PythonErrorPanel
          error={pyRuntimeErr}
          code={draft}
          expanded={pyErrExpanded}
          onToggleExpanded={onToggleErrorExpanded}
          aiHelp={pyAiHelp}
          aiLoading={pyAiLoading}
          fixCopied={pyFixCopied}
          onRequestAiHelp={onRequestAiHelp}
          onFixCopied={onFixCopied}
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
