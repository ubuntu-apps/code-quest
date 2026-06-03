import { useState } from 'react'
import { CodeTextareaWithErrorLine } from '../codeEditor'
import { SANDBOX_SNIPPETS } from '../constants'
import { PythonErrorPanel } from './PythonErrorPanel'
import { usePythonAiHelp } from '../hooks/usePythonAiHelp'
import { pythonErrorSummaryLine } from '../pythonErrorHelper'
import type { FriendlyPythonError } from '../pythonSandbox'

interface PythonSandboxSectionProps {
  code: string
  onCodeChange: (code: string) => void
  output: string
  running: boolean
  error: FriendlyPythonError | null
  errorUiEpoch: number
  onRun: () => void
  onReset: () => void
  onErrorClear: () => void
}

export function PythonSandboxSection({
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
  const { aiHelp, loading, fixCopied, setFixCopied, request, reset: resetAi } = usePythonAiHelp('sandbox')

  const handleReset = () => {
    onReset()
    setExpanded(false)
    resetAi()
    onErrorClear()
  }

  const handleRun = () => {
    resetAi()
    setExpanded(false)
    onRun()
  }

  return (
    <section className="cq-sandbox">
      <h3 className="cq-sandbox-title">Sandbox</h3>
      <p className="cq-muted">You can try some python code here.</p>
      <label className="cq-label" htmlFor="python-sandbox-input">
        Python code
      </label>
      <div className="cq-sandbox-snippets">
        {SANDBOX_SNIPPETS.map((snippet) => (
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
        id="python-sandbox-input"
        className="cq-code-input cq-sandbox-input"
        rows={6}
        spellCheck={false}
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        errorLine={error?.line ?? null}
        errorSummary={error?.detail ? pythonErrorSummaryLine(error.detail) : null}
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
          error={error}
          code={code}
          expanded={expanded}
          onToggleExpanded={() => setExpanded((v) => !v)}
          aiHelp={aiHelp}
          aiLoading={loading}
          fixCopied={fixCopied}
          onRequestAiHelp={() => void request(code, error)}
          onFixCopied={setFixCopied}
        />
      )}
    </section>
  )
}
