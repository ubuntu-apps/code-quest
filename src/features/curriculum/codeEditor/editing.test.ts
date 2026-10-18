import { describe, expect, it } from 'vitest'
import { applyTextEdit, computeKeyEdit, INDENT, insertTextEdit, pairTextEdit, type TextEdit } from './editing'

function press(value: string, start: number, end: number, key: string, shiftKey = false) {
  const edit = computeKeyEdit(value, start, end, { key, shiftKey })
  return edit ? { value: applyTextEdit(value, edit), edit } : null
}

function sel(edit: TextEdit) {
  return [edit.selectionStart, edit.selectionEnd]
}

describe('computeKeyEdit', () => {
  it('inserts spaces for Tab at the cursor', () => {
    const r = press('x = 1', 0, 0, 'Tab')!
    expect(r.value).toBe(`${INDENT}x = 1`)
    expect(sel(r.edit)).toEqual([4, 4])
  })

  it('indents every selected line with Tab', () => {
    const value = 'a\nb\nc'
    const r = press(value, 0, value.length, 'Tab')!
    expect(r.value).toBe('    a\n    b\n    c')
    expect(sel(r.edit)).toEqual([4, r.value.length])
  })

  it('does not indent the line after a selection that ends at column 0', () => {
    const r = press('a\nb\nc', 0, 4, 'Tab')!
    expect(r.value).toBe('    a\n    b\nc')
  })

  it('removes one indent level with Shift+Tab', () => {
    const r = press('        x = 1', 10, 10, 'Tab', true)!
    expect(r.value).toBe('    x = 1')
    expect(sel(r.edit)).toEqual([6, 6])
  })

  it('dedents a multi-line selection and partial indents', () => {
    const value = '    a\n  b\nc'
    const r = press(value, 0, value.length, 'Tab', true)!
    expect(r.value).toBe('a\nb\nc')
  })

  it('leaves Shift+Tab to the browser when nothing is indented', () => {
    expect(press('x = 1', 2, 2, 'Tab', true)).toBeNull()
  })

  it('keeps indentation on Enter', () => {
    const value = '    x = 1'
    const r = press(value, value.length, value.length, 'Enter')!
    expect(r.value).toBe('    x = 1\n    ')
  })

  it('adds an indent level after a colon', () => {
    const value = 'for i in range(3):'
    const r = press(value, value.length, value.length, 'Enter')!
    expect(r.value).toBe('for i in range(3):\n    ')
    expect(sel(r.edit)).toEqual([r.value.length, r.value.length])
  })

  it('adds an indent level after an opening brace (R)', () => {
    const value = '  f <- function(x) {'
    const r = press(value, value.length, value.length, 'Enter')!
    expect(r.value).toBe(`${value}\n      `)
  })

  it('lets the browser handle Enter on an unindented line', () => {
    expect(press('x = 1', 5, 5, 'Enter')).toBeNull()
  })

  it('ignores keys with modifiers', () => {
    expect(computeKeyEdit('x', 0, 0, { key: 'Tab', ctrlKey: true })).toBeNull()
    expect(computeKeyEdit('    x', 5, 5, { key: 'Enter', metaKey: true })).toBeNull()
  })
})

describe('symbol key edits', () => {
  it('types a symbol over the selection', () => {
    const edit = insertTextEdit(3, 4, ':')
    expect(applyTextEdit('if x y', edit)).toBe('if : y')
    expect(sel(edit)).toEqual([4, 4])
  })

  it('types a pair with the cursor between', () => {
    const edit = pairTextEdit('print', 5, 5, '(', ')')
    expect(applyTextEdit('print', edit)).toBe('print()')
    expect(sel(edit)).toEqual([6, 6])
  })

  it('wraps the selection in a pair and keeps it selected', () => {
    const edit = pairTextEdit('say hi', 4, 6, '"', '"')
    expect(applyTextEdit('say hi', edit)).toBe('say "hi"')
    expect(sel(edit)).toEqual([5, 7])
  })
})
