import { ChevronDown, ChevronUp } from 'lucide-react'
import type { FriendlyCodeError } from '../../languages'
import { errorLinePointer } from '../helpers'

interface CodeErrorPanelProps {
  error: FriendlyCodeError
  code: string
  expanded: boolean
  onToggleExpanded: () => void
}

/** An error from running code: its title and tip, the full message on request, and where it happened. */
export function CodeErrorPanel({ error, code, expanded, onToggleExpanded }: CodeErrorPanelProps) {
  const pointer = errorLinePointer(code, error)

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
