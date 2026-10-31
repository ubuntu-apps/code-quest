import { describe, expect, it } from 'vitest'
import { highlightR } from './codeHighlight'

function kinds(code: string): string {
  return highlightR(code)
    .filter((t) => t.kind !== 'plain')
    .map((t) => `${t.kind}:${t.text}`)
    .join(' ')
}

describe('highlightR', () => {
  it('colours keywords, constants, calls, text, numbers and comments', () => {
    expect(kinds('if (x > 2.5) print("big", TRUE)  # note')).toBe(
      'keyword:if number:2.5 builtin:print string:"big" constant:TRUE comment:# note',
    )
  })

  it('keeps a # inside text as part of the text, and dotted names whole', () => {
    expect(kinds('is.na(y) <- "a # b"')).toBe('builtin:is.na string:"a # b"')
  })

  it('gives back the code unchanged when joined', () => {
    const code = 'f <- function(x, n = 1L) {\n  x[x %in% c(1, 2)] * 1e3\n}\n'
    expect(highlightR(code).map((t) => t.text).join('')).toBe(code)
  })
})
