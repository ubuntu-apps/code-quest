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

/** Keys that are slow to reach on a phone keyboard, in roughly the order Python needs them. */
const KEYS: CodeKey[] = [
  { label: '⇥', aria: 'Indent', kind: 'tab' },
  { label: '⇤', aria: 'Remove indent', kind: 'untab' },
  { label: ':', kind: 'text', text: ':' },
  { label: '( )', aria: 'Parentheses', kind: 'pair', open: '(', close: ')' },
  { label: '[ ]', aria: 'Square brackets', kind: 'pair', open: '[', close: ']' },
  { label: '" "', aria: 'Double quotes', kind: 'pair', open: '"', close: '"' },
  { label: "' '", aria: 'Single quotes', kind: 'pair', open: "'", close: "'" },
  { label: '=', kind: 'text', text: '=' },
  { label: '_', aria: 'Underscore', kind: 'text', text: '_' },
  { label: '.', aria: 'Dot', kind: 'text', text: '.' },
  { label: ',', aria: 'Comma', kind: 'text', text: ',' },
  { label: '#', kind: 'text', text: '#' },
  { label: '{ }', aria: 'Curly braces', kind: 'pair', open: '{', close: '}' },
  { label: '+', kind: 'text', text: '+' },
  { label: '-', kind: 'text', text: '-' },
  { label: '*', kind: 'text', text: '*' },
  { label: '/', kind: 'text', text: '/' },
  { label: '<', kind: 'text', text: '<' },
  { label: '>', kind: 'text', text: '>' },
  { label: '!', kind: 'text', text: '!' },
]

/** A one-line answer box gets no indent keys. */
const ANSWER_KEYS = KEYS.filter((key) => key.kind !== 'tab' && key.kind !== 'untab')

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
}: {
  /** A plain text box to type into… */
  textareaRef?: RefObject<HTMLTextAreaElement | HTMLInputElement | null>
  /** …or any other editor (see KeyBarTarget). */
  target?: () => KeyBarTarget | null
  /** "answer": for a one-line quiz answer, without the indent keys. */
  variant?: 'code' | 'answer'
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
      {(variant === 'answer' ? ANSWER_KEYS : KEYS).map((key) => (
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
