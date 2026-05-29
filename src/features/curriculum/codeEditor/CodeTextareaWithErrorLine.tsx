import { useEffect, useId, useRef, useState } from 'react'
import { CodeEditorLineGutter } from './CodeEditorLineGutter'
import { DraggableErrorPopover } from './DraggableErrorPopover'
import { useCodeEditorScrollSync } from './useCodeEditorScrollSync'

export type CodeTextareaWithErrorLineProps = {
  id?: string
  className?: string
  rows?: number
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  /** 1-based line from traceback; only highlights when in range */
  errorLine?: number | null
  /** Shown in a draggable popover below the highlighted row (e.g. `SyntaxError: …`) */
  errorSummary?: string | null
  /** Popover header — same idea as the main error panel title (e.g. "Syntax error") */
  errorTitle?: string | null
  /** Optional 1-based column index from traceback */
  errorColumn?: number | null
  /** Increment when validation runs again so the popover can reopen after dismiss */
  errorUiEpoch?: number
  spellCheck?: boolean
}

export function CodeTextareaWithErrorLine({
  id,
  className,
  rows,
  value,
  onChange,
  errorLine,
  errorSummary,
  errorTitle,
  errorColumn,
  errorUiEpoch = 0,
  spellCheck,
}: CodeTextareaWithErrorLineProps) {
  const taRef = useRef<HTMLTextAreaElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const tooltipLayerRef = useRef<HTMLDivElement>(null)
  const summaryId = useId()
  const titleId = useId()

  const lines = value.split('\n')
  const lineCount = lines.length
  const showHighlight =
    errorLine != null && Number.isFinite(errorLine) && errorLine >= 1 && errorLine <= lineCount
  const summaryText = (errorSummary ?? '').trim()
  const popoverKey =
    summaryText && errorLine != null ? `${summaryText}:${errorLine}:${errorUiEpoch}` : ''

  const [closedForKey, setClosedForKey] = useState<string | null>(null)
  const showErrorPopover = Boolean(popoverKey) && closedForKey !== popoverKey

  const syncScroll = useCodeEditorScrollSync(taRef, backdropRef, tooltipLayerRef)

  useEffect(() => {
    syncScroll()
  }, [value, errorLine, syncScroll])

  if (!showHighlight) {
    return (
      <textarea
        id={id}
        ref={taRef}
        className={className}
        rows={rows}
        spellCheck={spellCheck}
        value={value}
        onChange={onChange}
      />
    )
  }

  return (
    <div className="cq-code-editor-wrap">
      <div ref={backdropRef} className="cq-code-editor-backdrop" aria-hidden>
        <div className="cq-code-editor-backdrop-inner">
          <CodeEditorLineGutter lineCount={lineCount} errorLine={errorLine!} mode="highlight" />
        </div>
      </div>
      <textarea
        id={id}
        ref={taRef}
        className={`${className ?? ''} cq-code-editor-overlay`.trim()}
        rows={rows}
        spellCheck={spellCheck}
        value={value}
        onChange={onChange}
        onScroll={syncScroll}
        aria-describedby={showErrorPopover ? summaryId : undefined}
      />
      {summaryText ? (
        <div ref={tooltipLayerRef} className="cq-code-editor-tooltip-layer">
          <div className="cq-code-editor-backdrop-inner cq-code-editor-tooltip-layer-inner">
            <CodeEditorLineGutter lineCount={lineCount} mode="phantom" />
            {showErrorPopover ? (
              <DraggableErrorPopover
                key={popoverKey}
                heading={(errorTitle ?? 'Error').trim() || 'Error'}
                summaryText={summaryText}
                errorLine={errorLine!}
                errorColumn={errorColumn}
                summaryId={summaryId}
                titleId={titleId}
                onClose={() => setClosedForKey(popoverKey)}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
