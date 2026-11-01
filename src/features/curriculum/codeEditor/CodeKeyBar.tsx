import type { RefObject } from 'react'
import { applyEdit } from './applyEdit'
import { computeKeyEdit, insertTextEdit, pairTextEdit, type TextEdit } from './editing'
import { languagePack, type CodeKey } from '../../languages'

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

/** The keys for a course (see each LanguagePack's `keys`); a one-line answer box gets no indent keys. */
function keysFor(language: string | null | undefined, variant: 'code' | 'answer'): readonly CodeKey[] {
  const keys = languagePack(language)?.keys ?? []
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
  language,
}: {
  /** A plain text box to type into… */
  textareaRef?: RefObject<HTMLTextAreaElement | HTMLInputElement | null>
  /** …or any other editor (see KeyBarTarget). */
  target?: () => KeyBarTarget | null
  /** "answer": for a one-line quiz answer, without the indent keys. */
  variant?: 'code' | 'answer'
  /** The course's language, whose symbols to offer: SQL needs `%`, `||` and `;` rather than Python's `:` and `#`. */
  language?: string | null
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
