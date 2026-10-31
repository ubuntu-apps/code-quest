import type { Token, TokenKind } from './codeHighlight'
import { R_CONSTANTS, R_KEYWORDS } from './rWords'

const KEYWORDS = new Set(R_KEYWORDS)
const CONSTANTS = new Set(R_CONSTANTS)

const R_TOKEN_RE = new RegExp(
  [
    String.raw`(#[^\n]*)`, // 1 comment
    String.raw`("(?:\\[\s\S]|[^"\\])*"?|'(?:\\[\s\S]|[^'\\])*'?)`, // 2 text
    String.raw`((?:\b\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?L?)`, // 3 number
    String.raw`([A-Za-z.][\w.]*)`, // 4 name
  ].join('|'),
  'g',
)

function push(tokens: Token[], text: string, kind: TokenKind): void {
  if (!text) return
  const last = tokens[tokens.length - 1]
  if (last && last.kind === kind) last.text += text
  else tokens.push({ text, kind })
}

/** Splits R code into coloured tokens: keywords, constants, text, numbers, comments and calls. */
export function highlightR(code: string): Token[] {
  const tokens: Token[] = []
  let last = 0
  R_TOKEN_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = R_TOKEN_RE.exec(code)) !== null) {
    push(tokens, code.slice(last, m.index), 'plain')
    const [text, comment, string, number, name] = m
    if (comment) push(tokens, text, 'comment')
    else if (string) push(tokens, text, 'string')
    else if (number) push(tokens, text, 'number')
    else if (name) {
      const isCall = /^\s*\(/.test(code.slice(m.index + text.length))
      push(tokens, text, KEYWORDS.has(name) ? 'keyword' : CONSTANTS.has(name) ? 'constant' : isCall ? 'builtin' : 'plain')
    }
    last = m.index + text.length
  }
  push(tokens, code.slice(last), 'plain')
  return tokens
}
