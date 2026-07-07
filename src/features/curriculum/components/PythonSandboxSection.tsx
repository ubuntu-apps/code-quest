import { useState } from 'react'
import { CodeTextareaWithErrorLine } from '../codeEditor'
import { SANDBOX_SNIPPETS } from '../constants'
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
  onRun: () => void
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
  onReset,
  onErrorClear,
}: PythonSandboxSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const languageLabel = languageId === 'r' ? 'R' : 'Python'
  const snippets =
    snippetsOverride ?? SANDBOX_SNIPPETS[languageId] ?? SANDBOX_SNIPPETS.python

  const handleReset = () => {
    onReset()
    setExpanded(false)
    onErrorClear()
  }

  const handleRun = () => {
    setExpanded(false)
    onRun()
  }

  return (
    <section className="cq-sandbox">
      <h3 className="cq-sandbox-title">Sandbox</h3>
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
      <div className="cq-row">
        <button type="button" className="cq-btn cq-btn--primary" onClick={handleRun} disabled={running}>
          {running ? 'Running...' : 'Run code'}
        </button>
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
