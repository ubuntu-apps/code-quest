/** Spaces inserted by Tab and used for auto-indent (PEP 8 style). */
export const INDENT = '    '

/** A text replacement plus where the selection should land afterwards. */
export interface TextEdit {
  start: number
  end: number
  text: string
  selectionStart: number
  selectionEnd: number
}

export interface EditKey {
  key: string
  shiftKey?: boolean
  ctrlKey?: boolean
  metaKey?: boolean
  altKey?: boolean
}

/** Characters that open a block, so the next line gets one more indent level. */
const BLOCK_OPENERS = [':', '{', '(', '[']

function lineStartAt(value: string, index: number): number {
  return value.lastIndexOf('\n', index - 1) + 1
}

function lineEndAt(value: string, index: number): number {
  const i = value.indexOf('\n', index)
  return i === -1 ? value.length : i
}

/** Range of whole lines touched by the selection (a selection ending at column 0 skips that line). */
function selectedLines(value: string, start: number, end: number) {
  const from = lineStartAt(value, start)
  const lastIndex = end > start && value[end - 1] === '\n' ? end - 1 : end
  const to = lineEndAt(value, Math.max(lastIndex, from))
  return { from, to, lines: value.slice(from, to).split('\n') }
}

function leadingIndentLength(line: string): number {
  if (line.startsWith('\t')) return 1
  let n = 0
  while (n < INDENT.length && line[n] === ' ') n += 1
  return n
}

function indentLines(value: string, start: number, end: number): TextEdit {
  const { from, to, lines } = selectedLines(value, start, end)
  return {
    start: from,
    end: to,
    text: lines.map((line) => INDENT + line).join('\n'),
    selectionStart: start + INDENT.length,
    selectionEnd: end + INDENT.length * lines.length,
  }
}

function dedentLines(value: string, start: number, end: number): TextEdit | null {
  const { from, to, lines } = selectedLines(value, start, end)
  const removed = lines.map(leadingIndentLength)
  if (removed.every((n) => n === 0)) return null
  const totalRemoved = removed.reduce((sum, n) => sum + n, 0)
  const firstRemoved = Math.min(removed[0], start - from)
  return {
    start: from,
    end: to,
    text: lines.map((line, i) => line.slice(removed[i])).join('\n'),
    selectionStart: start - firstRemoved,
    selectionEnd: Math.max(start - firstRemoved, end - totalRemoved),
  }
}

function newlineWithIndent(value: string, start: number, end: number): TextEdit | null {
  const from = lineStartAt(value, start)
  const before = value.slice(from, start)
  const indent = before.match(/^[ \t]*/)?.[0] ?? ''
  const opensBlock = BLOCK_OPENERS.includes(before.trimEnd().slice(-1))
  const text = `\n${indent}${opensBlock ? INDENT : ''}`
  // Nothing to add: let the browser insert the newline itself.
  if (text === '\n') return null
  return {
    start,
    end,
    text,
    selectionStart: start + text.length,
    selectionEnd: start + text.length,
  }
}

/**
 * Works out how a code-editing key changes the text, or returns null to let
 * the browser handle the key normally.
 * - Tab: insert spaces, or indent every selected line.
 * - Shift+Tab: remove one indent level from the current or selected lines.
 * - Enter: keep the current line's indentation, plus one level after `:` `{` `(` `[`.
 */
export function computeKeyEdit(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  key: EditKey,
): TextEdit | null {
  if (key.ctrlKey || key.metaKey || key.altKey) return null
  const start = Math.min(selectionStart, selectionEnd)
  const end = Math.max(selectionStart, selectionEnd)

  if (key.key === 'Tab') {
    if (key.shiftKey) return dedentLines(value, start, end)
    if (value.slice(start, end).includes('\n')) return indentLines(value, start, end)
    return {
      start,
      end,
      text: INDENT,
      selectionStart: start + INDENT.length,
      selectionEnd: start + INDENT.length,
    }
  }

  if (key.key === 'Enter' && !key.shiftKey) return newlineWithIndent(value, start, end)

  return null
}

/** Applies a TextEdit to the result of `value` (used by tests and as the fallback check). */
export function applyTextEdit(value: string, edit: TextEdit): string {
  return value.slice(0, edit.start) + edit.text + value.slice(edit.end)
}

/** Types `text` over the selection, leaving the cursor after it. */
export function insertTextEdit(selectionStart: number, selectionEnd: number, text: string): TextEdit {
  const start = Math.min(selectionStart, selectionEnd)
  const end = Math.max(selectionStart, selectionEnd)
  return { start, end, text, selectionStart: start + text.length, selectionEnd: start + text.length }
}

/**
 * Types a pair such as `()` or `""`: around the selection if there is one (keeping it
 * selected), otherwise with the cursor between the two characters.
 */
export function pairTextEdit(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  open: string,
  close: string,
): TextEdit {
  const start = Math.min(selectionStart, selectionEnd)
  const end = Math.max(selectionStart, selectionEnd)
  const inner = value.slice(start, end)
  const caret = start + open.length
  return {
    start,
    end,
    text: open + inner + close,
    selectionStart: caret,
    selectionEnd: caret + inner.length,
  }
}
