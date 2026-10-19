import { useId, useState } from 'react'
import { InlineMarkdown, SimpleMarkdown } from '../SimpleMarkdown'
import { CODE_RUNTIME_UNSUPPORTED_MESSAGE, isCodeRuntimeSupported } from '../sandboxSupport'
import { CHALLENGE_XP, CHALLENGE_XP_AFTER_ANSWER } from '../constants'
import { useAdminMode } from '../adminMode'
import type { Challenge } from '../types'
import type { FriendlyPythonError, PythonChallengeTestResult } from '../pythonSandbox'
import type { FriendlyRError, RChallengeTestResult } from '../rSandbox'
import { CodeEditor } from '../codeEditor'
import { pythonErrorSummaryLine } from '../pythonErrorHelper'
import { rErrorSummaryLine } from '../rErrorHelper'
import { PythonErrorPanel } from './PythonErrorPanel'
import { ValueDiff } from './ValueDiff'
import { HighlightedCode } from './HighlightedCode'
import { reportProblemUrl } from '../reportProblem'
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
  /** The answer was revealed before this challenge was solved. */
  answerViewed: boolean
  testResults: (PythonChallengeTestResult | RChallengeTestResult)[]
  runtimeError: FriendlyPythonError | FriendlyRError | null
  errorExpanded: boolean
  errorUiEpoch: number
  /** Set while the answer is being checked ("Checking…", "Downloading Python…"). */
  checkingMessage: string | null
  /** Set while the answer runs without its tests (the Run button). */
  runningMessage: string | null
  /** What the code printed on its last Run or Check (null: no output box). */
  output: string | null
  onDraftChange: (value: string) => void
  onRun: () => void
  onCheck: () => void
  onStopCheck: () => void
  onRevealAnswer: () => void
  onUpdateChallenge: (patch: Partial<Challenge>) => void
  onMove: (direction: -1 | 1) => void
  onDelete: () => void
  onToggleErrorExpanded: () => void
  /** Where to go after solving this one: the next unsolved challenge, or the quiz. */
  next?: { label: string; go: () => void }
}

export function ChallengeCard({
  challenge: ch,
  chIndex,
  totalChallenges,
  draft,
  done,
  status,
  answerViewed,
  testResults,
  runtimeError: pyRuntimeErr,
  errorExpanded: pyErrExpanded,
  errorUiEpoch,
  checkingMessage,
  runningMessage,
  output,
  onDraftChange,
  onRun,
  onCheck,
  onStopCheck,
  onRevealAnswer,
  onUpdateChallenge,
  onMove,
  onDelete,
  onToggleErrorExpanded,
  next,
}: ChallengeCardProps) {
  const { isEditingLocal } = useEditorMode()
  // Admin mode (for testing) opens answers straight away, without the XP penalty.
  const isAdmin = useAdminMode()
  // Challenges solved before the lesson was opened start folded, so the open ones stand out.
  const [collapsed, setCollapsed] = useState(() => done && !isEditingLocal)
  const [showHint, setShowHint] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const hintText = ch.hint ?? ch.hints?.[0]
  const isRuntimeTests =
    ch.validation.mode === 'python_tests' || ch.validation.mode === 'r_tests'
  // Very old browsers can't run the code runtimes, so these challenges can't be checked there.
  const cannotRun = isRuntimeTests && !isCodeRuntimeSupported()
  const answerNoteId = useId()
  const checking = checkingMessage !== null
  const running = runningMessage !== null
  const busy = checking || running
  // Run shows what the code prints before it is graded (Python challenges only).
  const canRun = ch.validation.mode === 'python_tests' && !cannotRun
  // An empty box next to an error says nothing, so it shows only when there is output or no error.
  const showOutput = output !== null && (output !== '' || running || !pyRuntimeErr)
  // The answer unlocks after one Check attempt, so learners try first.
  // (Where code can't run, Check is unavailable, so the answer is open from the start.)
  const answerUnlocked = isEditingLocal || isAdmin || done || answerViewed || status !== undefined || cannotRun
  const answerNote = !answerUnlocked
    ? 'Press Check once to unlock the answer.'
    : !done && !answerViewed && !isEditingLocal && !isAdmin && !cannotRun
      ? `Solving after viewing the answer earns ${CHALLENGE_XP_AFTER_ANSWER} XP instead of ${CHALLENGE_XP}.`
      : null

  const failedChecks = testResults.filter((t) => !t.passed).length
  // Empty while checking, so the same result twice in a row is still announced.
  const checkResultAnnouncement = busy || status === undefined
    ? ''
    : status === 'passed'
      ? 'Passed. Every check passed.'
      : isRuntimeTests && pyRuntimeErr
        ? `Not yet. Your code stopped with an error: ${pyRuntimeErr.title}.`
        : testResults.length === 1
          ? 'Not yet. The check failed.'
          : testResults.length > 1
            ? `Not yet. ${failedChecks} of ${testResults.length} checks failed.`
            : 'Not yet. This answer did not pass.'

  const challengeNumber = `Challenge ${chIndex + 1} of ${totalChallenges}`

  const toggleAnswer = () => {
    if (!showAnswer && !done && !answerViewed && !isEditingLocal && !isAdmin) onRevealAnswer()
    setShowAnswer((v) => !v)
  }

  if (collapsed) {
    return (
      <div id={`challenge-${ch.id}`} className="cq-panel cq-challenge-card cq-challenge-card--folded">
        <p className="cq-challenge-number">{challengeNumber}</p>
        <div className="cq-card-row cq-card-row--panel">
          <h2 className="cq-subtitle">{ch.title}</h2>
          <span className="cq-badge cq-badge--ok">Solved</span>
        </div>
        <button
          type="button"
          className="cq-btn cq-btn--sm"
          onClick={() => setCollapsed(false)}
          aria-label={`Show challenge: ${ch.title}`}
        >
          Show challenge
        </button>
      </div>
    )
  }

  return (
    <div id={`challenge-${ch.id}`} className="cq-panel cq-challenge-card">
      <p className="cq-challenge-number">{challengeNumber}</p>
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
        <button
          type="button"
          className="cq-btn cq-btn--sm"
          onClick={toggleAnswer}
          disabled={!answerUnlocked}
          aria-describedby={answerNote && !showAnswer ? answerNoteId : undefined}
        >
          {showAnswer ? 'Hide answer' : 'Answer'}
        </button>
      </div>
      {answerNote && !showAnswer ? (
        <p id={answerNoteId} className="cq-muted cq-answer-note">
          {answerNote}
        </p>
      ) : null}
      {showHint ? (
        <div className="cq-challenge-reveal cq-challenge-reveal--hint">
          <SimpleMarkdown text={hintText ?? 'No hint available for this challenge yet.'} />
        </div>
      ) : null}
      {showAnswer ? (
        <pre className="cq-challenge-reveal cq-challenge-reveal--answer">
          {ch.solution ? <HighlightedCode code={ch.solution} /> : 'No answer available for this challenge yet.'}
        </pre>
      ) : null}
      <label className="cq-label" id={`code-label-${ch.id}`} htmlFor={`code-${ch.id}`}>
        Your answer
      </label>
      <CodeEditor
        id={`code-${ch.id}`}
        labelId={`code-label-${ch.id}`}
        language={ch.validation.mode === 'r_tests' ? 'plain' : 'python'}
        rows={4}
        value={draft}
        onChange={onDraftChange}
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
      {cannotRun ? (
        <p className="cq-muted cq-sandbox-unsupported" role="note">
          {CODE_RUNTIME_UNSUPPORTED_MESSAGE}
        </p>
      ) : null}
      <div className="cq-row">
        {canRun ? (
          <button type="button" className="cq-btn" onClick={onRun} disabled={busy}>
            {running ? 'Running…' : 'Run'}
          </button>
        ) : null}
        <button
          type="button"
          className="cq-btn cq-btn--primary"
          onClick={onCheck}
          disabled={cannotRun || busy}
        >
          {checking ? 'Checking…' : status === 'failed' ? 'Try again' : done ? 'Check again' : 'Check'}
        </button>
        {busy && ch.validation.mode === 'python_tests' ? (
          <button type="button" className="cq-btn" onClick={onStopCheck}>
            Stop
          </button>
        ) : null}
        {done && status !== 'failed' && !busy && draft.trim() !== '' ? (
          <span className="cq-badge cq-badge--ok">Challenge complete</span>
        ) : null}
        {status === 'passed' && !busy && next ? (
          <button type="button" className="cq-btn cq-btn--sm" onClick={next.go}>
            {next.label}
          </button>
        ) : null}
      </div>
      <p className="cq-muted cq-check-status" role="status" aria-live="polite">
        {checking && checkingMessage !== 'Checking…'
          ? checkingMessage
          : running && runningMessage !== 'Running…'
            ? runningMessage
            : done && status === 'failed' && !busy
              ? 'You solved this challenge before, so it stays complete. This answer did not pass.'
              : ''}
      </p>
      {/* The result of a Check, for screen readers: on screen it is the badges and the list below. */}
      <p className="cq-sr-only" role="status">
        {checkResultAnnouncement}
      </p>
      {showOutput ? (
        <>
          <div className="cq-label">Output</div>
          <pre className="cq-sandbox-output">{output || (running ? '' : 'Your code ran but printed nothing.')}</pre>
        </>
      ) : null}
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
              <span>
                <InlineMarkdown text={t.label} />
              </span>
              <span>{t.passed ? 'Pass' : 'Fail'}</span>
              {!t.passed && 'diff' in t && t.diff ? (
                <div className="cq-testcase-detail">
                  <ValueDiff diff={t.diff} />
                </div>
              ) : !t.passed && t.detail ? (
                <div className="cq-testcase-detail">{t.detail}</div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {!isEditingLocal ? (
        <a
          className="cq-report-link"
          href={reportProblemUrl(`the challenge "${ch.title}"`, `challenge ${ch.id}`)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Report a problem with this challenge
        </a>
      ) : null}
    </div>
  )
}
