import { ChevronDown, ChevronUp } from 'lucide-react'
import type { FriendlyPythonError } from '../pythonSandbox'
import { pythonErrorLinePointer } from '../helpers'

interface PythonErrorPanelProps {
  error: FriendlyPythonError
  code: string
  expanded: boolean
  onToggleExpanded: () => void
}

export function PythonErrorPanel({ error, code, expanded, onToggleExpanded }: PythonErrorPanelProps) {
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
      {expanded && <div className="cq-sandbox-error-detail">{error.detail}</div>}
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
