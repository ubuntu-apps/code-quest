import { useState } from 'react'
import { Check } from 'lucide-react'
import { CodeEditor } from '../codeEditor'
import {
  CODE_RUNTIME_UNSUPPORTED_MESSAGE,
  isCodeRuntimeSupported,
} from '../sandboxSupport'
import type { SandboxSnippet, SqlTable } from '../types'
import { CodeErrorPanel } from './CodeErrorPanel'
import { SqlTablesNote } from './SqlTablesNote'
import { sqlTableNames } from '../../languages/sql/sqlTables'
import { languagePack, type FriendlyCodeError } from '../../languages'

/** @deprecated Use FriendlyCodeError (languages/). */
export type FriendlySandboxError = FriendlyCodeError

interface CodeSandboxSectionProps {
  /** The course's language; a course without one has no sandbox. */
  languageId: string
  snippets?: SandboxSnippet[]
  code: string
  onCodeChange: (code: string) => void
  output: string
  running: boolean
  error: FriendlyCodeError | null
  errorUiEpoch: number
  onRun: (stdin: string) => void
  onStop?: () => void
  onReset: () => void
  onErrorClear: () => void
  /** SQL lessons: the tables the sandbox's database has. */
  tables?: SqlTable[]
  /** SQL lessons: the SQL that makes the sandbox's database, for peeking at a table's rows. */
  setupSql?: string
}

/** The lesson's sandbox: samples, a code editor, Run, Stop and Reset, and the output. */
export function CodeSandboxSection({
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
  setupSql,
}: CodeSandboxSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const [stdin, setStdin] = useState('')
  const pack = languagePack(languageId)
  if (!pack) return null
  const suggestNames = pack.hasDatabase ? sqlTableNames(tables) : undefined
  // Only show the Input box when the code asks for input.
  const usesInput = pack.readsInputIn(code)
  const runtimeSupported = isCodeRuntimeSupported()
  const snippets = snippetsOverride ?? pack.sandboxSamples
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
      <p className="cq-muted">You can try some {pack.label} code here.</p>
      <label className="cq-label" id={`${languageId}-sandbox-label`} htmlFor={`${languageId}-sandbox-input`}>
        {pack.label} code
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
      {pack.hasDatabase && tables ? <SqlTablesNote tables={tables} setupSql={setupSql} /> : null}
      <CodeEditor
        id={`${languageId}-sandbox-input`}
        labelId={`${languageId}-sandbox-label`}
        language={languageId}
        suggestNames={suggestNames}
        sqlTables={pack.hasDatabase ? tables : undefined}
        className="cq-sandbox-input"
        rows={6}
        value={code}
        onChange={onCodeChange}
        errorLine={error?.line ?? null}
        errorSummary={error?.detail ? pack.errorSummaryLine(error.detail) : null}
        errorTitle={error?.title ?? null}
        errorColumn={error?.column ?? null}
        errorUiEpoch={errorUiEpoch}
      />
      {usesInput && (
        <>
          <label className="cq-label" htmlFor={`${languageId}-sandbox-stdin`}>
            Input (optional, one line per <code className="cq-md-code">{pack.spec.sandbox.input?.call}</code> call)
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
        {running && onStop ? (
          <button type="button" className="cq-btn" onClick={onStop}>
            Stop
          </button>
        ) : null}
        <button type="button" className="cq-btn" onClick={handleReset} disabled={running}>
          Reset code
        </button>
      </div>
      <div className="cq-label">Output</div>
      <pre className={`cq-sandbox-output${pack.tableOutput ? ' cq-sandbox-output--table' : ''}`}>
        {output || 'Run code to see output.'}
      </pre>
      {error && (
        <CodeErrorPanel
          error={error}
          code={code}
          expanded={expanded}
          onToggleExpanded={() => setExpanded((v) => !v)}
        />
      )}
    </section>
  )
}
