import { describe, expect, it } from 'vitest'
import { canTryCode, codeToTry } from './tryCode'

describe('canTryCode', () => {
  it('offers R code but not sample output', () => {
    expect(canTryCode('r', { content: 'x <- c(1, 2)\nmean(x)' })).toBe(true)
    expect(canTryCode('r', { content: '2026-10-28: 4 readings', lang: 'text' })).toBe(false)
    expect(canTryCode('r', { content: 'Total: 9.6' })).toBe(false)
  })

  it('keeps the Python and SQL rules', () => {
    expect(canTryCode('python', { content: 'print("hi")' })).toBe(true)
    expect(canTryCode('sql', { content: 'SELECT * FROM t;' })).toBe(true)
    expect(canTryCode('python', { content: 'print("hi")', lang: 'output' })).toBe(false)
  })
})

describe('codeToTry', () => {
  const blocks = [
    { content: 'steps <- c(4200, 8100)' },
    { content: 'Total: 12300', lang: 'text' },
    { content: '# Run it and read the error\nstpes * 2' },
    { content: 'sum(steps)' },
  ]

  it('gives R the earlier runnable blocks first, leaving out output and error demos', () => {
    expect(codeToTry('r', blocks, 3)).toBe('steps <- c(4200, 8100)\n\nsum(steps)')
    expect(codeToTry('r', blocks, 0)).toBe('steps <- c(4200, 8100)')
  })

  it('keeps an error demo itself, after the setup it needs', () => {
    expect(codeToTry('r', blocks, 2)).toBe('steps <- c(4200, 8100)\n\n# Run it and read the error\nstpes * 2')
  })

  it('gives Python and SQL just their own block', () => {
    expect(codeToTry('python', [{ content: 'x = 1' }, { content: 'print(x)' }], 1)).toBe('print(x)')
  })
})
