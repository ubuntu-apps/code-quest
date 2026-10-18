import { useState } from 'react'
import { CodeTextareaWithErrorLine } from '../codeEditor'
import { SANDBOX_SNIPPETS } from '../constants'
import {
  CODE_RUNTIME_UNSUPPORTED_MESSAGE,
  isCodeRuntimeSupported,
} from '../sandboxSupport'
import type { SandboxSnippet } from '../types'
import { PythonErrorPanel } from './PythonErrorPanel'
import { pythonErrorSummaryLine } from '../pythonErrorHelper'
import { rErrorSummaryLine } from '../rErrorHelper'
import type { FriendlyPythonError } from '../pythonSandbox'
import type { FriendlyRError } from '../rSandbox'

type FriendlySandboxError = FriendlyPythonError | FriendlyRError

interface PythonSandboxSectionProps {
  languageId: 'python' | 'r'
  snippets?: SandboxSnippet[]
  code: string
  onCodeChange: (code: string) => void
  output: string
  running: boolean
  error: FriendlySandboxError | null
  errorUiEpoch: number
  onRun: (stdin: string) => void
  onStop?: () => void
  onReset: () => void
  onErrorClear: () => void
}

function errorSummary(error: FriendlySandboxError | null, languageId: 'python' | 'r'): string | null {
  if (!error?.detail) return null
  return languageId === 'r' ? rErrorSummaryLine(error.detail) : pythonErrorSummaryLine(error.detail)
}

export function PythonSandboxSection({
  languageId,
  snippets: snippetsOverride,
  code,
  onCodeChange,
  output,
  running,
  error,
  errorUiEpoch,
  onRun,
  onStop,
  onReset,
  onErrorClear,
}: PythonSandboxSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const [stdin, setStdin] = useState('')
  // Input and Stop are Python-only: the R runtime has no stdin hook or stop control here.
  const isPython = languageId === 'python'
  // Only show the Input box when the code asks for input.
  const usesInput = isPython && /\binput\s*\(/.test(code)
  const languageLabel = languageId === 'r' ? 'R' : 'Python'
  const runtimeSupported = isCodeRuntimeSupported()
  const snippets =
    snippetsOverride ?? SANDBOX_SNIPPETS[languageId] ?? SANDBOX_SNIPPETS.python

  const handleReset = () => {
    onReset()
    setExpanded(false)
    onErrorClear()
  }

  const handleRun = () => {
    setExpanded(false)
    onRun(usesInput ? stdin : '')
  }

  return (
    <section id="cq-sandbox" className="cq-sandbox">
      <h2 className="cq-sandbox-title">Sandbox</h2>
      <p className="cq-muted">You can try some {languageLabel} code here.</p>
      <label className="cq-label" htmlFor={`${languageId}-sandbox-input`}>
        {languageLabel} code
      </label>
      <div className="cq-sandbox-snippets">
        {snippets.map((snippet) => (
          <button
            key={snippet.id}
            type="button"
            className="cq-btn cq-btn--snippet"
            onClick={() => onCodeChange(snippet.code)}
          >
            {snippet.label}
          </button>
        ))}
      </div>
      <CodeTextareaWithErrorLine
        id={`${languageId}-sandbox-input`}
        className="cq-code-input cq-sandbox-input"
        rows={6}
        spellCheck={false}
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        errorLine={error?.line ?? null}
        errorSummary={errorSummary(error, languageId)}
        errorTitle={error?.title ?? null}
        errorColumn={error?.column ?? null}
        errorUiEpoch={errorUiEpoch}
      />
      {usesInput && (
        <>
          <label className="cq-label" htmlFor={`${languageId}-sandbox-stdin`}>
            Input (optional, one line per <code className="cq-md-code">input()</code> call)
          </label>
          <textarea
            id={`${languageId}-sandbox-stdin`}
            className="cq-code-input cq-sandbox-stdin"
            rows={2}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
          />
        </>
      )}
      {!runtimeSupported && (
        <p className="cq-muted cq-sandbox-unsupported" role="note">
          {CODE_RUNTIME_UNSUPPORTED_MESSAGE}
        </p>
      )}
      <div className="cq-row">
        <button
          type="button"
          className="cq-btn cq-btn--primary"
          onClick={handleRun}
          disabled={running || !runtimeSupported}
        >
          {running ? 'Running...' : 'Run code'}
        </button>
        {running && isPython && onStop ? (
          <button type="button" className="cq-btn" onClick={onStop}>
            Stop
          </button>
        ) : null}
        <button type="button" className="cq-btn" onClick={handleReset} disabled={running}>
          Reset code
        </button>
      </div>
      <div className="cq-label">Output</div>
      <pre className="cq-sandbox-output">{output || 'Run code to see output.'}</pre>
      {error && (
        <PythonErrorPanel
          error={error as FriendlyPythonError}
          code={code}
          expanded={expanded}
          onToggleExpanded={() => setExpanded((v) => !v)}
        />
      )}
    </section>
  )
}
