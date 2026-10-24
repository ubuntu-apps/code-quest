import { useState } from 'react'
import { Check } from 'lucide-react'
import { CodeEditor } from '../codeEditor'
import { SANDBOX_SNIPPETS } from '../constants'
import {
  CODE_RUNTIME_UNSUPPORTED_MESSAGE,
  isCodeRuntimeSupported,
} from '../sandboxSupport'
import type { SandboxSnippet, SqlTable } from '../types'
import { PythonErrorPanel } from './PythonErrorPanel'
import { pythonErrorSummaryLine } from '../pythonErrorHelper'
import { rErrorSummaryLine } from '../rErrorHelper'
import { sqlErrorSummaryLine } from '../sqlErrorHelper'
import { SqlTablesNote } from './SqlTablesNote'
import { sqlTableNames } from '../sqlWords'
import type { FriendlyPythonError } from '../pythonSandbox'
import type { FriendlyRError } from '../rSandbox'

type FriendlySandboxError = FriendlyPythonError | FriendlyRError

type SandboxLanguage = 'python' | 'r' | 'sql'

interface PythonSandboxSectionProps {
  languageId: SandboxLanguage
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
  tables?: SqlTable[]
}

function errorSummary(error: FriendlySandboxError | null, languageId: SandboxLanguage): string | null {
  if (!error?.detail) return null
  if (languageId === 'sql') return sqlErrorSummaryLine(error.detail)
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
  tables,
}: PythonSandboxSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const [stdin, setStdin] = useState('')
  // Input is Python-only, and Stop works for the worker (Python and SQL), not for R.
  const isPython = languageId === 'python'
  const canStop = languageId !== 'r'
  const suggestNames = languageId === 'sql' ? sqlTableNames(tables) : undefined
  // Only show the Input box when the code asks for input.
  const usesInput = isPython && /\binput\s*\(/.test(code)
  const languageLabel = languageId === 'r' ? 'R' : languageId === 'sql' ? 'SQL' : 'Python'
  const runtimeSupported = isCodeRuntimeSupported()
  const snippets =
    snippetsOverride ?? SANDBOX_SNIPPETS[languageId] ?? SANDBOX_SNIPPETS.python
  // The sample shown in the editor, while it is unchanged (editing it unmarks it).
  const activeSnippetId = snippets.find((snippet) => snippet.code === code)?.id ?? null

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
      <label className="cq-label" id={`${languageId}-sandbox-label`} htmlFor={`${languageId}-sandbox-input`}>
        {languageLabel} code
      </label>
      <div className="cq-sandbox-snippets" role="group" aria-label="Sample code">
        {snippets.map((snippet) => {
          const active = snippet.id === activeSnippetId
          return (
            <button
              key={snippet.id}
              type="button"
              className={`cq-btn cq-btn--snippet${active ? ' cq-btn--snippet-active' : ''}`}
              aria-pressed={active}
              onClick={() => onCodeChange(snippet.code)}
            >
              {active ? <Check size={12} aria-hidden /> : null}
              {snippet.label}
            </button>
          )
        })}
      </div>
      {languageId === 'sql' && tables ? <SqlTablesNote tables={tables} /> : null}
      <CodeEditor
        id={`${languageId}-sandbox-input`}
        labelId={`${languageId}-sandbox-label`}
        language={languageId === 'r' ? 'plain' : languageId}
        suggestNames={suggestNames}
        className="cq-sandbox-input"
        rows={6}
        value={code}
        onChange={onCodeChange}
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
        {running && canStop && onStop ? (
          <button type="button" className="cq-btn" onClick={onStop}>
            Stop
          </button>
        ) : null}
        <button type="button" className="cq-btn" onClick={handleReset} disabled={running}>
          Reset code
        </button>
      </div>
      <div className="cq-label">Output</div>
      <pre className={`cq-sandbox-output${languageId === 'sql' ? ' cq-sandbox-output--table' : ''}`}>
        {output || 'Run code to see output.'}
      </pre>
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
