import { ChevronDown, ChevronUp } from 'lucide-react'
import type { PythonAiHelp } from '../freeAiHelp'
import type { FriendlyPythonError } from '../pythonSandbox'
import { copyToClipboard, pythonErrorLinePointer } from '../helpers'

interface PythonErrorPanelProps {
  error: FriendlyPythonError
  code: string
  expanded: boolean
  onToggleExpanded: () => void
  aiHelp: PythonAiHelp | null
  aiLoading: boolean
  fixCopied: boolean
  onRequestAiHelp: () => void
  onFixCopied: (copied: boolean) => void
}

export function PythonErrorPanel({
  error,
  code,
  expanded,
  onToggleExpanded,
  aiHelp,
  aiLoading,
  fixCopied,
  onRequestAiHelp,
  onFixCopied,
}: PythonErrorPanelProps) {
  const pointer = pythonErrorLinePointer(code, error)

  return (
    <div className="cq-sandbox-error" role="alert">
      <div className="cq-sandbox-error-title">{error.title}</div>
      {error.tip && <div className="cq-sandbox-error-tip">{error.tip}</div>}
      <button
        type="button"
        className="cq-sandbox-error-toggle"
        onClick={onToggleExpanded}
        aria-expanded={expanded}
      >
        {expanded ? (
          <>
            Hide full error <ChevronUp size={14} />
          </>
        ) : (
          <>
            Show full error <ChevronDown size={14} />
          </>
        )}
      </button>
      <button
        type="button"
        className="cq-sandbox-error-toggle"
        onClick={onRequestAiHelp}
        disabled={aiLoading}
      >
        {aiLoading ? 'AI is thinking...' : 'AI Help'}
      </button>
      {expanded && <div className="cq-sandbox-error-detail">{error.detail}</div>}
      {aiHelp && (
        <>
          <div className="cq-ai-help-text">{aiHelp.text}</div>
          {aiHelp.fix && (
            <div className="cq-ai-help-actions">
              <button
                type="button"
                className="cq-sandbox-error-toggle"
                onClick={() => void copyToClipboard(aiHelp.fix).then(onFixCopied)}
              >
                {fixCopied ? 'Copied!' : 'Copy fix'}
              </button>
            </div>
          )}
        </>
      )}
      {pointer && (
        <pre className="cq-sandbox-error-pointer">
          {`Line ${pointer.line}${pointer.column ? `, Col ${pointer.column}` : ''}
${pointer.text}
${pointer.caret}`}
        </pre>
      )}
    </div>
  )
}
