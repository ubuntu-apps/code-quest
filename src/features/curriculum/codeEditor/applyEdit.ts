import { applyTextEdit, type TextEdit } from './editing'

/**
 * Replaces text the way typing would, so the browser's undo history and React's
 * onChange both see the edit. Falls back to setRangeText where execCommand is missing.
 */
export function applyEdit(el: HTMLTextAreaElement | HTMLInputElement, edit: TextEdit): void {
  const expected = applyTextEdit(el.value, edit)
  el.setSelectionRange(edit.start, edit.end)
  let applied: boolean
  try {
    applied =
      edit.text === ''
        ? document.execCommand('delete', false)
        : document.execCommand('insertText', false, edit.text)
  } catch {
    applied = false
  }
  if (!applied || el.value !== expected) {
    el.value = expected
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }
  el.setSelectionRange(edit.selectionStart, edit.selectionEnd)
}
