import { describe, expect, it } from 'vitest'
import { languagePack } from '.'

const python = languagePack('python')!
const sql = languagePack('sql')!
const highlightPython = (code: string) => python.highlight(code)
const highlightSql = (code: string) => sql.highlight(code)
const looksLikePython = (code: string) => python.looksLikeCode(code)
const looksLikeSql = (code: string) => sql.looksLikeCode(code)

function kinds(code: string): string {
  return highlightPython(code)
    .filter((t) => t.kind !== 'plain')
    .map((t) => `${t.kind}:${t.text}`)
    .join(' ')
}

describe('highlightPython', () => {
  it('colours keywords, names, builtins, strings, numbers and comments', () => {
    expect(kinds('def greet(name):\n    print(f"Hi {name}", 3)  # say hi')).toBe(
      'keyword:def name:greet builtin:print string:f"Hi {name}" number:3 comment:# say hi',
    )
  })

  it('keeps a # inside a string as part of the string', () => {
    expect(kinds('x = "a # b"')).toBe('string:"a # b"')
  })

  it('handles triple-quoted strings over several lines', () => {
    expect(kinds('s = """one\ntwo"""\nTrue')).toBe('string:"""one\ntwo""" constant:True')
  })

  it('gives back the code unchanged when joined', () => {
    const code = "for i in range(3):\n    print(i ** 2, 'x', 1_000, .5e3)\n"
    expect(highlightPython(code).map((t) => t.text).join('')).toBe(code)
  })
})

describe('looksLikePython', () => {
  it('accepts code', () => {
    expect(looksLikePython('total = 0\nfor n in range(3):\n    total += n')).toBe(true)
    expect(looksLikePython('print("hi")')).toBe(true)
  })

  it('rejects sample output, folders and shell commands', () => {
    expect(looksLikePython('Your guess: 3\nToo low')).toBe(false)
    expect(looksLikePython('shop/\n    __init__.py\n    prices.py')).toBe(false)
    expect(looksLikePython('python -m pip install requests')).toBe(false)
    expect(looksLikePython('> look\nHall')).toBe(false)
  })
})

describe('highlightSql', () => {
  const kinds = (code: string) =>
    highlightSql(code)
      .filter((t) => t.kind !== 'plain')
      .map((t) => `${t.kind}:${t.text}`)

  it('colours keywords in any case, text, numbers, comments and functions', () => {
    expect(kinds("select UPPER(name) FROM pets WHERE age > 3 -- old\nAND species = 'dog'")).toEqual([
      'keyword:select',
      'builtin:UPPER',
      'keyword:FROM',
      'keyword:WHERE',
      'number:3',
      'comment:-- old',
      'keyword:AND',
      "string:'dog'",
    ])
  })

  it('keeps a doubled quote inside text, and shows NULL as a constant', () => {
    expect(kinds("SELECT 'it''s', NULL")).toEqual(['keyword:SELECT', "string:'it''s'", 'constant:NULL'])
  })
})

describe('looksLikeSql', () => {
  it('is true for runnable statements only', () => {
    expect(looksLikeSql('-- every pet\nSELECT * FROM pets;')).toBe(true)
    expect(looksLikeSql('title | year\n------+-----')).toBe(false)
    expect(looksLikeSql('PRAGMA foreign_keys = ON;\nCREATE TABLE t (id INTEGER);')).toBe(true)
    expect(looksLikeSql('BEGIN;\nDELETE FROM loans;\nROLLBACK;')).toBe(true)
  })
})

const highlightR = (code: string) => languagePack('r')!.highlight(code)

function rKinds(code: string): string {
  return highlightR(code)
    .filter((t) => t.kind !== 'plain')
    .map((t) => `${t.kind}:${t.text}`)
    .join(' ')
}

describe('highlightR', () => {
  it('colours keywords, constants, calls, text, numbers and comments', () => {
    expect(rKinds('if (x > 2.5) print("big", TRUE)  # note')).toBe(
      'keyword:if number:2.5 builtin:print string:"big" constant:TRUE comment:# note',
    )
  })

  it('keeps a # inside text as part of the text, and dotted names whole', () => {
    expect(rKinds('is.na(y) <- "a # b"')).toBe('builtin:is.na string:"a # b"')
  })

  it('gives back the code unchanged when joined', () => {
    const code = 'f <- function(x, n = 1L) {\n  x[x %in% c(1, 2)] * 1e3\n}\n'
    expect(highlightR(code).map((t) => t.text).join('')).toBe(code)
  })
})
