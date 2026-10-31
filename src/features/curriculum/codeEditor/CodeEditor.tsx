import { Component, Suspense, lazy, use, useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import type { EditorView } from '@codemirror/view'
import { CodeKeyBar, type KeyBarTarget } from './CodeKeyBar'
import { CodeTextareaWithErrorLine } from './CodeTextareaWithErrorLine'
import { hasCoarsePointer } from './pointer'
import { editorLanguageFor } from './preloadCodeEditor'
import type { CodeMirrorEditorProps, EditorError } from './CodeMirrorEditor'
import type { SqlTable } from '../types'

/** Downloaded on first use (see preloadCodeEditor), so pages without code stay light. */
const CodeMirrorEditor = lazy(() => import('./CodeMirrorEditor'))

/** The editor with the language's support (syntax, suggestions, indent), which loads alongside it. */
function LanguageEditor({ language, ...props }: Omit<CodeMirrorEditorProps, 'editorLanguage'> & { language: string }) {
  return <CodeMirrorEditor {...props} editorLanguage={use(editorLanguageFor(language))} />
}

/** If the editor can't be loaded (offline before it was cached), keep the plain text box. */
class EditorLoadBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export interface CodeEditorProps {
  /** Id of the element that names the editor (its <label>; give the label this id too). */
  labelId: string
  /** Id for the plain text box shown while the editor loads, so the label's htmlFor works. */
  id: string
  value: string
  onChange: (value: string) => void
  /** The language id (`python`, `sql`, `r`), or `plain` for text without colours or suggestions. */
  language?: string
  /** Starting height in lines. */
  rows?: number
  /** Extra classes for the plain text box (e.g. pass/fail borders). */
  className?: string
  /** 1-based line of the last error, its column, and the message for it. */
  errorLine?: number | null
  errorColumn?: number | null
  errorTitle?: string | null
  errorSummary?: string | null
  /** Changes on each run, so a closed error message shows again for a new error. */
  errorUiEpoch?: number
  /** More names to suggest while typing, such as the ones a challenge's instructions use. */
  suggestNames?: string[]
  /** SQL lessons: the database's tables, for suggesting a table's columns after `table.` or an alias. */
  sqlTables?: SqlTable[]
}

/**
 * A code box for challenges and the sandbox. It shows a plain text box straight away
 * and swaps in the full editor (CodeMirror) as soon as it has loaded; the cursor and
 * focus carry over. On phones and tablets a row of symbol keys shows while typing.
 */
export function CodeEditor({
  labelId,
  id,
  value,
  onChange,
  language = 'python',
  rows = 4,
  className,
  errorLine = null,
  errorColumn = null,
  errorTitle = null,
  errorSummary = null,
  errorUiEpoch = 0,
  suggestNames,
  sqlTables,
}: CodeEditorProps) {
  const hintId = useId()
  const [touch] = useState(hasCoarsePointer)
  const [focused, setFocused] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const targetRef = useRef<KeyBarTarget | null>(null)
  // Where the cursor was in the plain text box, to carry over when the editor arrives.
  const fallbackFocus = useRef<{ focused: boolean; start: number; end: number }>({ focused: false, start: 0, end: 0 })

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    },
    [],
  )

  // The key bar hides a moment after blur, so a tap on a key that briefly takes focus still lands.
  const onFocusChange = useCallback((isFocused: boolean) => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    if (isFocused) setFocused(true)
    else hideTimer.current = setTimeout(() => setFocused(false), 250)
  }, [])

  const onReady = useCallback((target: KeyBarTarget, view: EditorView) => {
    targetRef.current = target
    const carried = fallbackFocus.current
    if (carried.focused) {
      const length = view.state.doc.length
      view.dispatch({ selection: { anchor: Math.min(carried.start, length), head: Math.min(carried.end, length) } })
      view.focus()
    }
  }, [])

  // A closed error message stays closed until the next run (a new epoch) or a different error.
  const summary = (errorSummary ?? '').trim()
  const errorKey = errorLine != null ? `${errorLine}:${summary}:${errorUiEpoch}` : ''
  const [closedKey, setClosedKey] = useState<string | null>(null)
  const error = useMemo((): EditorError | null => {
    if (errorLine == null || !Number.isFinite(errorLine)) return null
    return {
      line: errorLine,
      column: errorColumn,
      title: (errorTitle ?? 'Error').trim() || 'Error',
      summary,
      showMessage: closedKey !== errorKey,
      key: errorKey,
      onClose: () => setClosedKey(errorKey),
    }
  }, [errorLine, errorColumn, errorTitle, summary, errorKey, closedKey])

  const fallback = (
    <div
      onFocusCapture={() => {
        fallbackFocus.current.focused = true
      }}
      onBlurCapture={() => {
        fallbackFocus.current.focused = false
      }}
      onSelectCapture={(e) => {
        const el = e.target as HTMLTextAreaElement
        fallbackFocus.current.start = el.selectionStart ?? 0
        fallbackFocus.current.end = el.selectionEnd ?? 0
      }}
    >
      <CodeTextareaWithErrorLine
        id={id}
        className={`cq-code-input${className ? ` ${className}` : ''}`}
        rows={rows}
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        errorLine={errorLine}
        errorSummary={errorSummary}
        errorTitle={errorTitle}
        errorColumn={errorColumn}
        errorUiEpoch={errorUiEpoch}
        keyLanguage={language}
      />
    </div>
  )

  return (
    <>
      <EditorLoadBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <LanguageEditor
            language={language}
            value={value}
            onChange={onChange}
            minLines={rows}
            labelledBy={labelId}
            describedBy={hintId}
            error={error}
            className={className}
            onFocusChange={onFocusChange}
            onReady={onReady}
            suggestNames={suggestNames}
            sqlTables={sqlTables}
          />
        </Suspense>
      </EditorLoadBoundary>
      <span id={hintId} className="cq-sr-only">
        Tab indents. Press Escape, then Tab, to move to the next control.
      </span>
      {touch && focused ? (
        <CodeKeyBar target={() => targetRef.current} language={language} />
      ) : null}
    </>
  )
}
