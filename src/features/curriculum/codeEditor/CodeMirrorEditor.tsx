import { useEffect, useRef } from 'react'
import { Annotation, EditorState, StateEffect, StateField, type Extension } from '@codemirror/state'
import {
  Decoration,
  EditorView,
  WidgetType,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  type DecorationSet,
} from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { HighlightStyle, bracketMatching, indentOnInput, syntaxHighlighting } from '@codemirror/language'
import { acceptCompletion, closeBrackets, closeBracketsKeymap, completionKeymap, completionStatus } from '@codemirror/autocomplete'
import { tags as t } from '@lezer/highlight'
import type { KeyBarTarget } from './CodeKeyBar'
import type { SqlTable } from '../types'
import type { EditorLanguage } from '../../languages/EditorLanguage'

/** The error from the last Run or Check, shown on its line. */
export interface EditorError {
  /** 1-based line. */
  line: number
  /** 1-based column, when known. */
  column: number | null
  title: string
  summary: string
  /** The message under the line (it can be closed; the line stays marked). */
  showMessage: boolean
  /** Changes when the message should show again (a new run). */
  key: string
  onClose: () => void
}

export interface CodeMirrorEditorProps {
  value: string
  onChange: (value: string) => void
  /** The language's syntax, suggestions and indent (see languages/EditorLanguage.ts). */
  editorLanguage: EditorLanguage
  /** Height to start at, in lines; the editor grows with the code. */
  minLines: number
  /** Element ids naming and describing the editor (its label, the keyboard hint). */
  labelledBy?: string
  describedBy?: string
  error: EditorError | null
  className?: string
  onFocusChange?: (focused: boolean) => void
  /** Called once the editor is ready, with a handle for the phone key bar. */
  onReady?: (target: KeyBarTarget, view: EditorView) => void
  /** More names to suggest while typing, such as the ones a challenge's instructions use. */
  suggestNames?: string[]
  /** SQL lessons: the database's tables, for suggesting a table's columns after `table.` or an alias. */
  sqlTables?: SqlTable[]
}

/** Marks changes that came from the `value` prop, so they aren't echoed back as onChange. */
const fromProps = Annotation.define<boolean>()

const setError = StateEffect.define<EditorError | null>()

class ErrorMessageWidget extends WidgetType {
  private readonly error: EditorError

  constructor(error: EditorError) {
    super()
    this.error = error
  }

  eq(other: ErrorMessageWidget): boolean {
    return (
      other.error.key === this.error.key &&
      other.error.title === this.error.title &&
      other.error.summary === this.error.summary
    )
  }

  toDOM(): HTMLElement {
    const box = document.createElement('div')
    box.className = 'cq-cm-error-message'
    box.setAttribute('role', 'note')
    const text = document.createElement('div')
    const title = document.createElement('strong')
    title.textContent = this.error.title
    const summary = document.createElement('span')
    summary.textContent = this.error.summary
    text.append(title, summary)
    const close = document.createElement('button')
    close.type = 'button'
    close.className = 'cq-cm-error-close'
    close.setAttribute('aria-label', 'Hide error message')
    close.textContent = '×'
    close.addEventListener('mousedown', (e) => e.preventDefault())
    close.addEventListener('click', () => this.error.onClose())
    box.append(text, close)
    return box
  }

  ignoreEvent(): boolean {
    return true
  }
}

function errorDecorations(state: EditorState, error: EditorError | null): DecorationSet {
  if (!error || error.line < 1 || error.line > state.doc.lines) return Decoration.none
  const line = state.doc.line(error.line)
  const ranges = [Decoration.line({ class: 'cq-cm-error-line' }).range(line.from)]
  if (error.column != null && error.column >= 1 && line.from + error.column - 1 < line.to) {
    const at = line.from + error.column - 1
    ranges.push(Decoration.mark({ class: 'cq-cm-error-column' }).range(at, at + 1))
  }
  if (error.showMessage && error.summary) {
    ranges.push(Decoration.widget({ widget: new ErrorMessageWidget(error), block: true, side: 1 }).range(line.to))
  }
  return Decoration.set(ranges, true)
}

/** The error line, its column and the message under it; kept on the same line number as code changes. */
const errorField = StateField.define<{ error: EditorError | null; decorations: DecorationSet }>({
  create: () => ({ error: null, decorations: Decoration.none }),
  update(value, tr) {
    let error = value.error
    for (const effect of tr.effects) if (effect.is(setError)) error = effect.value
    if (error === value.error && !tr.docChanged) return value
    return { error, decorations: errorDecorations(tr.state, error) }
  },
  provide: (field) => EditorView.decorations.from(field, (value) => value.decorations),
})

/** Syntax colours from the theme (index.css), so they follow light and dark mode. */
const codeQuestHighlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.operatorKeyword, t.definitionKeyword, t.moduleKeyword], color: 'var(--cq-hl-keyword)' },
  { tag: [t.string, t.special(t.string)], color: 'var(--cq-hl-string)' },
  { tag: [t.number, t.bool, t.null], color: 'var(--cq-hl-number)' },
  { tag: t.comment, color: 'var(--cq-hl-comment)', fontStyle: 'italic' },
  { tag: [t.function(t.variableName), t.standard(t.variableName), t.self], color: 'var(--cq-hl-builtin)' },
  { tag: [t.definition(t.variableName), t.function(t.definition(t.variableName)), t.definition(t.className)], color: 'var(--cq-hl-name)' },
  { tag: [t.meta, t.attributeName], color: 'var(--cq-hl-decorator)' },
])

/**
 * Tab indents, so keyboard users need a way out (WCAG 2.1.2, no keyboard trap): after
 * Escape, the next Tab moves focus to the next control instead.
 */
function escapeThenTab(): Extension {
  let escaped = false
  return EditorView.domEventHandlers({
    keydown(event, view) {
      // Escape that only closes the suggestion list doesn't count.
      if (event.key === 'Escape' && completionStatus(view.state) === null) {
        escaped = true
        return false
      }
      if (event.key === 'Tab' && escaped) {
        escaped = false
        // Handled here so CodeMirror doesn't indent; the browser moves focus as usual.
        return true
      }
      escaped = false
      return false
    },
  })
}

/**
 * The code editor used for challenges and the sandbox: CodeMirror 6 with the language's
 * colours, auto-indent, bracket matching and closing, name suggestions, undo, and the
 * last error's line marked. Loaded lazily (see CodeEditor), so pages without code don't download it.
 */
export default function CodeMirrorEditor({
  value,
  onChange,
  editorLanguage,
  minLines,
  labelledBy,
  describedBy,
  error,
  className,
  onFocusChange,
  onReady,
  suggestNames,
  sqlTables,
}: CodeMirrorEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  // The latest props for the editor's own callbacks, which are set up once.
  const latest = useRef({ value, onChange, onFocusChange, onReady, suggestNames, sqlTables })

  useEffect(() => {
    latest.current = { value, onChange, onFocusChange, onReady, suggestNames, sqlTables }
  })

  // Create the editor once per language; later `value` changes are applied below.
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const contentAttributes: Record<string, string> = {
      autocapitalize: 'off',
      autocorrect: 'off',
      spellcheck: 'false',
    }
    if (labelledBy) contentAttributes['aria-labelledby'] = labelledBy
    if (describedBy) contentAttributes['aria-describedby'] = describedBy

    const view = new EditorView({
      parent: host,
      state: EditorState.create({
        doc: latest.current.value,
        extensions: [
          escapeThenTab(),
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          history(),
          drawSelection(),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          // The language's suggestions while typing, indent and syntax.
          ...editorLanguage.extensions({
            extraNames: () => latest.current.suggestNames ?? [],
            sqlTables: () => latest.current.sqlTables ?? [],
          }),
          syntaxHighlighting(codeQuestHighlight),
          keymap.of([
            ...closeBracketsKeymap,
            ...completionKeymap,
            { key: 'Tab', run: acceptCompletion },
            ...defaultKeymap,
            ...historyKeymap,
            indentWithTab,
          ]),
          EditorView.contentAttributes.of(contentAttributes),
          errorField,
          EditorView.updateListener.of((update) => {
            if (update.docChanged && !update.transactions.some((tr) => tr.annotation(fromProps))) {
              latest.current.onChange(update.state.doc.toString())
            }
            if (update.focusChanged) latest.current.onFocusChange?.(update.view.hasFocus)
          }),
        ],
      }),
    })
    viewRef.current = view

    const target: KeyBarTarget = {
      focus: () => view.focus(),
      value: () => view.state.doc.toString(),
      selection: () => {
        const { from, to } = view.state.selection.main
        return { start: from, end: to }
      },
      apply: (edit) =>
        view.dispatch({
          changes: { from: edit.start, to: edit.end, insert: edit.text },
          selection: { anchor: edit.selectionStart, head: edit.selectionEnd },
          userEvent: 'input.type',
          scrollIntoView: true,
        }),
    }
    latest.current.onReady?.(target, view)

    // A <label> can't focus a non-form element by itself, so clicking it focuses the editor here.
    const label = labelledBy ? document.getElementById(labelledBy) : null
    const focusFromLabel = () => view.focus()
    label?.addEventListener('click', focusFromLabel)

    return () => {
      label?.removeEventListener('click', focusFromLabel)
      view.destroy()
      viewRef.current = null
    }
  }, [editorLanguage, labelledBy, describedBy])

  // The value changed from outside (a snippet, Reset, starter code): replace the text.
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current === value) return
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
      annotations: fromProps.of(true),
    })
  }, [value])

  useEffect(() => {
    viewRef.current?.dispatch({ effects: setError.of(error) })
  }, [error])

  return (
    <div
      ref={hostRef}
      className={`cq-cm${className ? ` ${className}` : ''}`}
      style={{ '--cq-cm-min-lines': minLines } as React.CSSProperties}
    />
  )
}
