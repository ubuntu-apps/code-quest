import { describe, expect, it } from 'vitest'
import { explainRError, rErrorSummaryLine } from './rErrorHelper'

describe('explainRError', () => {
  it('detects syntax errors', () => {
    const err = explainRError('unexpected symbol in "x <-"')
    expect(err.title).toBe('Syntax error')
  })

  it('detects missing object errors', () => {
    const err = explainRError("could not find function 'foo'")
    expect(err.title).toBe('Name not found')
  })
})

describe('rErrorSummaryLine', () => {
  it('returns the first non-empty line', () => {
    expect(rErrorSummaryLine('\n\nError in x\n')).toBe('Error in x')
  })
})
