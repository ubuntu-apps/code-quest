import { describe, expect, it } from 'vitest'
import { highlightPython, looksLikePython } from './codeHighlight'

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
