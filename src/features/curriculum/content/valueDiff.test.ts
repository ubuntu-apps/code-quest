import { describe, expect, it } from 'vitest'
import { diffValues, type DiffSegment } from './valueDiff'

function marked(segments: DiffSegment[]): string {
  return segments.map((s) => (s.changed ? `[${s.text}]` : s.text)).join('')
}

describe('diffValues', () => {
  it('marks only the characters that differ', () => {
    const d = diffValues('Hello, world!', 'Hello world')
    expect(marked(d.expected)).toBe('Hello[,] world[!]')
    expect(marked(d.actual)).toBe('Hello world')
  })

  it('marks extra characters on the actual side', () => {
    const d = diffValues('3', '12')
    expect(marked(d.expected)).toBe('[3]')
    expect(marked(d.actual)).toBe('[12]')
  })

  it('handles a missing line', () => {
    const d = diffValues('a\nb\nc', 'a\nc')
    expect(marked(d.expected)).toBe('a\n[b\n]c')
    expect(marked(d.actual)).toBe('a\nc')
  })

  it('falls back to the common start and end for very long values', () => {
    const long = 'x'.repeat(1000)
    const d = diffValues(`${long}A${long}`, `${long}B${long}`)
    expect(d.expected.filter((s) => s.changed).map((s) => s.text)).toEqual(['A'])
    expect(d.actual.filter((s) => s.changed).map((s) => s.text)).toEqual(['B'])
  })
})
