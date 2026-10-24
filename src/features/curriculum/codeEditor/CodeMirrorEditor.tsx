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
import {
  HighlightStyle,
  bracketMatching,
  indentOnInput,
  indentUnit,
  syntaxHighlighting,
} from '@codemirror/language'
import {
  acceptCompletion,
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completeFromList,
  completionKeymap,
  completionStatus,
  type Completion,
  type CompletionContext,
  type CompletionSource,
} from '@codemirror/autocomplete'
import { localCompletionSource, python } from '@codemirror/lang-python'
import { tags as t } from '@lezer/highlight'
import type { KeyBarTarget } from './CodeKeyBar'
import { sqlLanguage } from './sqlLanguage'
import { SQL_FUNCTIONS, SQL_KEYWORDS } from '../sqlWords'

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
  language: 'python' | 'sql' | 'plain'
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
}

/**
 * Suggested besides the names in the learner's own code: Python's keywords and the
 * built-ins the course uses. Not the full list of built-ins, which is mostly noise for
 * beginners (TabError, aiter, ...).
 */
const PYTHON_WORDS: Completion[] = [
  ...'and as break case class continue def del elif else except False finally for from global if import in is lambda match None nonlocal not or pass raise return True try while with yield'
    .split(' ')
    .map((label) => ({ label, type: 'keyword' })),
  ...'abs all any bool dict divmod enumerate float input int isinstance len list map max min open print range repr reversed round set sorted str sum tuple type zip'
    .split(' ')
    .map((label) => ({ label, type: 'function' })),
]

/**
 * One list of suggestions for the word being typed: names used in this code first, then
 * names from the challenge's instructions (so `day_off` is offered before it is written),
 * then Python's words. Each name appears once. Suggestions start from the second letter
 * of a word (one letter matches too much), and the list closes when the word is deleted.
 */
function suggestions(extraNames: () => string[]): CompletionSource {
  const pythonWords = completeFromList(PYTHON_WORDS)
  return async (context: CompletionContext) => {
    const word = context.matchBefore(/\w+/)
    if (!context.explicit && (!word || word.to - word.from < 2)) return null
    const from = word ? word.from : context.pos
    const byLabel = new Map<string, Completion>()
    const add = (options: readonly Completion[] | undefined, boost: number) => {
      for (const option of options ?? []) {
        if (!byLabel.has(option.label)) byLabel.set(option.label, { ...option, boost })
      }
    }
    add((await localCompletionSource(context))?.options, 2)
    add(extraNames().map((label) => ({ label, type: 'variable' })), 1)
    add((await pythonWords(context))?.options, 0)
    return byLabel.size > 0 ? { from, options: [...byLabel.values()], validFor: /^\w{2,}$/ } : null
  }
}

const SQL_WORDS: Completion[] = [
  ...SQL_KEYWORDS.map((label) => ({ label, type: 'keyword' })),
  ...SQL_FUNCTIONS.map((label) => ({ label, type: 'function' })),
]
const SQL_KEYWORD_SET = new Set(SQL_KEYWORDS.map((w) => w.toLowerCase()))

/**
 * SQL suggestions: the lesson's table and column names first (and other names already
 * typed), then SQL's keywords and functions. Like Python's, they start from the second letter.
 */
function sqlSuggestions(extraNames: () => string[]): CompletionSource {
  const sqlWords = completeFromList(SQL_WORDS)
  return async (context: CompletionContext) => {
    const word = context.matchBefore(/\w+/)
    if (!context.explicit && (!word || word.to - word.from < 2)) return null
    const from = word ? word.from : context.pos
    const byLabel = new Map<string, Completion>()
    const add = (options: readonly Completion[] | undefined, boost: number) => {
      for (const option of options ?? []) {
        if (!byLabel.has(option.label.toLowerCase())) byLabel.set(option.label.toLowerCase(), { ...option, boost })
      }
    }
    add(extraNames().map((label) => ({ label, type: 'variable' })), 2)
    const typed = context.state.doc.toString().match(/[A-Za-z_]\w+/g) ?? []
    const current = word ? context.state.sliceDoc(word.from, word.to) : ''
    add(
      [...new Set(typed)]
        .filter((name) => name !== current && !SQL_KEYWORD_SET.has(name.toLowerCase()))
        .map((label) => ({ label, type: 'variable' })),
      1,
    )
    add((await sqlWords(context))?.options, 0)
    return byLabel.size > 0 ? { from, options: [...byLabel.values()], validFor: /^\w{2,}$/ } : null
  }
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
 * The code editor used for challenges and the sandbox: CodeMirror 6 with Python
 * colours, auto-indent, bracket matching and closing, name suggestions, undo, and the
 * last error's line marked. Loaded lazily (see CodeEditor), so pages without code don't download it.
 */
export default function CodeMirrorEditor({
  value,
  onChange,
  language,
  minLines,
  labelledBy,
  describedBy,
  error,
  className,
  onFocusChange,
  onReady,
  suggestNames,
}: CodeMirrorEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  // The latest props for the editor's own callbacks, which are set up once.
  const latest = useRef({ value, onChange, onFocusChange, onReady, suggestNames })

  useEffect(() => {
    latest.current = { value, onChange, onFocusChange, onReady, suggestNames }
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
          // Suggestions while typing: names already used in this code (variables,
          // functions), Python's keywords and common built-ins such as print and range.
          // Only words that start with what was typed. Enter or Tab picks one; Escape closes.
          language !== 'plain'
            ? autocompletion({
                override: [
                  (language === 'sql' ? sqlSuggestions : suggestions)(() => latest.current.suggestNames ?? []),
                ],
                filterStrict: true,
                icons: false,
                maxRenderedOptions: 8,
              })
            : [],
          EditorState.tabSize.of(4),
          indentUnit.of('    '),
          language === 'python' ? python() : language === 'sql' ? sqlLanguage : [],
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
  }, [language, labelledBy, describedBy])

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
