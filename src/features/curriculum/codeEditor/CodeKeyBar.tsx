import type { RefObject } from 'react'
import { applyEdit } from './applyEdit'
import { computeKeyEdit, insertTextEdit, pairTextEdit, type TextEdit } from './editing'

/**
 * What the key bar types into: a plain text box, or the code editor (CodeMirror), which
 * isn't a textarea but can say where the cursor is and apply the same edits.
 */
export interface KeyBarTarget {
  focus: () => void
  value: () => string
  selection: () => { start: number; end: number }
  apply: (edit: TextEdit) => void
}

function textBoxTarget(el: HTMLTextAreaElement | HTMLInputElement): KeyBarTarget {
  return {
    focus: () => el.focus(),
    value: () => el.value,
    selection: () => {
      const start = el.selectionStart ?? el.value.length
      return { start, end: el.selectionEnd ?? start }
    },
    apply: (edit) => applyEdit(el, edit),
  }
}

type CodeKey =
  | { label: string; aria: string; kind: 'tab' | 'untab' }
  | { label: string; aria?: string; kind: 'pair'; open: string; close: string }
  | { label: string; aria?: string; kind: 'text'; text: string }

const INDENT: CodeKey = { label: '⇥', aria: 'Indent', kind: 'tab' }
const UNINDENT: CodeKey = { label: '⇤', aria: 'Remove indent', kind: 'untab' }
const PARENS: CodeKey = { label: '( )', aria: 'Parentheses', kind: 'pair', open: '(', close: ')' }
const DOUBLE_QUOTES: CodeKey = { label: '" "', aria: 'Double quotes', kind: 'pair', open: '"', close: '"' }
const SINGLE_QUOTES: CodeKey = { label: "' '", aria: 'Single quotes', kind: 'pair', open: "'", close: "'" }
const text = (t: string, aria?: string): CodeKey => ({ label: t, aria, kind: 'text', text: t })

/** Keys that are slow to reach on a phone keyboard, in roughly the order Python needs them. */
const PYTHON_KEYS: CodeKey[] = [
  INDENT,
  UNINDENT,
  text(':'),
  PARENS,
  { label: '[ ]', aria: 'Square brackets', kind: 'pair', open: '[', close: ']' },
  DOUBLE_QUOTES,
  SINGLE_QUOTES,
  text('='),
  text('_', 'Underscore'),
  text('.', 'Dot'),
  text(','),
  text('#'),
  { label: '{ }', aria: 'Curly braces', kind: 'pair', open: '{', close: '}' },
  text('+'),
  text('-'),
  text('*'),
  text('/'),
  text('<'),
  text('>'),
  text('!'),
]

/**
 * The same for SQL, in roughly the order the lessons use them. `%` (LIKE patterns) and `||`
 * (joining text) sit on a phone keyboard's second symbol page. SQL only uses `|` doubled,
 * so one tap types both. Indenting is only for looks in SQL, so those keys come last.
 */
const SQL_KEYS: CodeKey[] = [
  PARENS,
  SINGLE_QUOTES,
  text(','),
  text('.', 'Dot'),
  text('_', 'Underscore'),
  text(';', 'Semicolon'),
  text('='),
  text('*'),
  text('%', 'Percent'),
  text('||', 'Join text (two bars)'),
  text('<'),
  text('>'),
  text('-'),
  text('+'),
  text('/'),
  text('!'),
  DOUBLE_QUOTES,
  INDENT,
  UNINDENT,
]

/**
 * The same for R: the arrow `<-` first, since it is two awkward keys, then `$` for columns,
 * `%in%` and `~` (formulas), which sit far away on a phone keyboard.
 */
const R_KEYS: CodeKey[] = [
  text('<-', 'Assignment arrow'),
  PARENS,
  DOUBLE_QUOTES,
  { label: '[ ]', aria: 'Square brackets', kind: 'pair', open: '[', close: ']' },
  text('$', 'Dollar'),
  text(','),
  text('=', 'Equals'),
  text('.', 'Dot'),
  text('_', 'Underscore'),
  text(':'),
  text('~', 'Tilde'),
  text('%in%'),
  text('#'),
  { label: '{ }', aria: 'Curly braces', kind: 'pair', open: '{', close: '}' },
  text('+'),
  text('-'),
  text('*'),
  text('/'),
  text('<'),
  text('>'),
  text('!'),
  text('&'),
  text('|'),
  INDENT,
  UNINDENT,
]

export type KeyBarLanguage = 'python' | 'sql' | 'r'

/** The keys for a course; a one-line answer box gets no indent keys. */
function keysFor(language: KeyBarLanguage, variant: 'code' | 'answer'): CodeKey[] {
  const keys = language === 'sql' ? SQL_KEYS : language === 'r' ? R_KEYS : PYTHON_KEYS
  return variant === 'answer' ? keys.filter((key) => key.kind !== 'tab' && key.kind !== 'untab') : keys
}

function editFor(key: CodeKey, target: KeyBarTarget): TextEdit | null {
  const value = target.value()
  const { start, end } = target.selection()
  switch (key.kind) {
    case 'tab':
      return computeKeyEdit(value, start, end, { key: 'Tab' })
    case 'untab':
      return computeKeyEdit(value, start, end, { key: 'Tab', shiftKey: true })
    case 'pair':
      return pairTextEdit(value, start, end, key.open, key.close)
    case 'text':
      return insertTextEdit(start, end, key.text)
  }
}

/**
 * A row of symbol keys under a code editor on phones and tablets, where Tab, colons,
 * brackets and quotes are buried on the on-screen keyboard. Pressing a key types into
 * the editor without taking focus from it, so the keyboard stays open.
 */
export function CodeKeyBar({
  textareaRef,
  target,
  variant = 'code',
  language = 'python',
}: {
  /** A plain text box to type into… */
  textareaRef?: RefObject<HTMLTextAreaElement | HTMLInputElement | null>
  /** …or any other editor (see KeyBarTarget). */
  target?: () => KeyBarTarget | null
  /** "answer": for a one-line quiz answer, without the indent keys. */
  variant?: 'code' | 'answer'
  /** Which symbols to offer: SQL needs `%`, `||` and `;` rather than Python's `:` and `#`. */
  language?: KeyBarLanguage
}) {
  const press = (key: CodeKey) => {
    const el = textareaRef?.current
    const t = target?.() ?? (el ? textBoxTarget(el) : null)
    if (!t) return
    t.focus()
    const edit = editFor(key, t)
    if (edit) t.apply(edit)
  }

  return (
    <div className="cq-code-keys" role="toolbar" aria-label="Code symbols">
      {keysFor(language, variant).map((key) => (
        <button
          key={key.label}
          type="button"
          className="cq-code-key"
          tabIndex={-1}
          aria-label={key.aria}
          // Keep focus (and the on-screen keyboard) in the editor.
          onPointerDown={(e) => e.preventDefault()}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => press(key)}
        >
          {key.label}
        </button>
      ))}
    </div>
  )
}
