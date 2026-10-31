import { SQL_FUNCTIONS, SQL_KEYWORDS } from './sqlWords'

/** Kinds of Python token that get their own colour. */
export type TokenKind = 'keyword' | 'builtin' | 'constant' | 'string' | 'number' | 'comment' | 'name' | 'decorator' | 'plain'

export interface Token {
  text: string
  kind: TokenKind
}

const KEYWORDS = new Set([
  'and', 'as', 'assert', 'async', 'await', 'break', 'case', 'class', 'continue', 'def', 'del', 'elif', 'else',
  'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'match', 'nonlocal', 'not',
  'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
])

const CONSTANTS = new Set(['True', 'False', 'None'])

const BUILTINS = new Set([
  'abs', 'all', 'any', 'bool', 'chr', 'dict', 'dir', 'divmod', 'enumerate', 'filter', 'float', 'format',
  'getattr', 'hasattr', 'help', 'input', 'int', 'isinstance', 'issubclass', 'iter', 'len', 'list', 'map', 'max',
  'min', 'next', 'object', 'open', 'ord', 'pow', 'print', 'range', 'repr', 'reversed', 'round', 'set', 'setattr',
  'sorted', 'str', 'sum', 'super', 'tuple', 'type', 'vars', 'zip', 'self', 'cls',
])

/**
 * One alternative per token, tried in order at each position. Strings come first so
 * that a `#` inside a string isn't read as a comment; triple quotes before single.
 */
const TOKEN_RE = new RegExp(
  [
    String.raw`(#[^\n]*)`, // 1 comment
    String.raw`((?:[rRbBuUfF]{1,2})?(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?))`, // 2 string
    String.raw`(\b0[xXoObB][0-9a-fA-F_]+\b|\b\d[\d_]*(?:\.[\d_]*)?(?:[eE][+-]?\d+)?j?\b|\.\d[\d_]*(?:[eE][+-]?\d+)?\b)`, // 3 number
    String.raw`(@[A-Za-z_][\w.]*)`, // 4 decorator
    String.raw`([A-Za-z_]\w*)`, // 5 name
  ].join('|'),
  'g',
)

function push(tokens: Token[], text: string, kind: TokenKind): void {
  if (!text) return
  const last = tokens[tokens.length - 1]
  if (last && last.kind === kind) last.text += text
  else tokens.push({ text, kind })
}

/**
 * Splits Python source into coloured tokens for display. It is a highlighter, not a
 * parser: anything it doesn't recognise is left as plain text, so odd code still shows.
 */
export function highlightPython(code: string): Token[] {
  const tokens: Token[] = []
  let last = 0
  let previousName = ''
  // exec rather than matchAll, which Safari 12 (still supported for reading lessons) lacks.
  TOKEN_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = TOKEN_RE.exec(code)) !== null) {
    const index = m.index
    push(tokens, code.slice(last, index), 'plain')
    const [text, comment, string, number, decorator, name] = m
    if (comment) push(tokens, text, 'comment')
    else if (string) push(tokens, text, 'string')
    else if (number) push(tokens, text, 'number')
    else if (decorator) push(tokens, text, 'decorator')
    else if (name) {
      // The name right after `def` or `class` is the one being defined.
      const kind: TokenKind = KEYWORDS.has(name)
        ? 'keyword'
        : CONSTANTS.has(name)
          ? 'constant'
          : previousName === 'def' || previousName === 'class'
            ? 'name'
            : BUILTINS.has(name)
              ? 'builtin'
              : 'plain'
      push(tokens, text, kind)
      previousName = name
      last = index + text.length
      continue
    }
    previousName = ''
    last = index + text.length
  }
  push(tokens, code.slice(last), 'plain')
  return tokens
}

const CODE_LINE = [
  /^\s*(import|from|def|class|for|while|if|elif|else|try|except|finally|with|return|raise|assert|match|case|async|lambda|print)\b/,
  /^\s*@\w/,
  // An assignment (not ==), including tuple targets and augmented assignment.
  /^\s*[A-Za-z_][\w.[\]'"]*(\s*,\s*[A-Za-z_][\w.[\]]*)*\s*(\*\*|\/\/|[+\-*/%])?=(?!=)/,
  // A call on its own line.
  /^\s*[A-Za-z_][\w.]*\(/,
]

const NOT_CODE_LINE = [
  /^(>|\$|>>>) /, // something typed at a program or a shell prompt
  /^\s*(python|pip|py|npm|cd|source)\s/, // shell commands
  /^[A-Za-z][\w%]*( [\w%()]+)+: /, // program output like "Your guess: 3"
  /^[A-Z][a-z]+: /, // program output like "Price: 4.5"
]

/**
 * Whether a lesson's code block is Python code that can be run, rather than sample
 * output, a folder layout or shell commands (those get no "Try it" button).
 */
export function looksLikePython(code: string): boolean {
  const lines = code.split('\n').filter((l) => l.trim() !== '' && !l.trim().startsWith('#'))
  if (lines.length === 0) return false
  if (lines.some((l) => NOT_CODE_LINE.some((re) => re.test(l)))) return false
  return lines.some((l) => CODE_LINE.some((re) => re.test(l)))
}

const SQL_TOKEN_RE = new RegExp(
  [
    String.raw`(--[^\n]*|\/\*[\s\S]*?(?:\*\/|$))`, // 1 comment
    String.raw`('(?:[^']|'')*'?)`, // 2 text
    String.raw`(\b\d+(?:\.\d*)?(?:[eE][+-]?\d+)?\b|\.\d+\b)`, // 3 number
    String.raw`([A-Za-z_][\w$]*)`, // 4 name
  ].join('|'),
  'g',
)

const SQL_KEYWORD_SET = new Set(SQL_KEYWORDS.map((w) => w.toLowerCase()))
const SQL_FUNCTION_SET = new Set(SQL_FUNCTIONS.map((w) => w.toLowerCase()))

/** Splits SQL into coloured tokens: keywords, functions, text, numbers and comments. */
export function highlightSql(code: string): Token[] {
  const tokens: Token[] = []
  let last = 0
  SQL_TOKEN_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = SQL_TOKEN_RE.exec(code)) !== null) {
    push(tokens, code.slice(last, m.index), 'plain')
    const [text, comment, string, number, name] = m
    if (comment) push(tokens, text, 'comment')
    else if (string) push(tokens, text, 'string')
    else if (number) push(tokens, text, 'number')
    else if (name) {
      const lower = name.toLowerCase()
      const isCall = code.slice(m.index + text.length).trimStart().startsWith('(')
      push(
        tokens,
        text,
        lower === 'null' || lower === 'true' || lower === 'false'
          ? 'constant'
          : SQL_KEYWORD_SET.has(lower)
            ? 'keyword'
            : isCall && SQL_FUNCTION_SET.has(lower)
              ? 'builtin'
              : 'plain',
      )
    }
    last = m.index + text.length
  }
  push(tokens, code.slice(last), 'plain')
  return tokens
}

const SQL_STATEMENT = /^\s*(SELECT|WITH|INSERT|UPDATE|DELETE|REPLACE|CREATE|DROP|ALTER|BEGIN|PRAGMA|EXPLAIN)\b/i

/** Whether a lesson's code block is SQL that can be run (not a result table or a sketch). */
/**
 * R code worth trying in the sandbox: an assignment, a function call or a calculation.
 * Sample output (`Total: 10.56`) doesn't count.
 */
export function looksLikeR(code: string): boolean {
  const lines = code.split('\n').filter((l) => l.trim() !== '' && !l.trim().startsWith('#'))
  return lines.length > 0 && lines.some((l) => /<-|[A-Za-z_.][\w.]*\(|^\s*-?[\d.]+\s*([-+*/^]|%%|%\/%)\s*[\d.(]/.test(l))
}

export function looksLikeSql(code: string): boolean {
  const lines = code.split('\n').filter((l) => l.trim() !== '' && !l.trim().startsWith('--'))
  return lines.length > 0 && SQL_STATEMENT.test(lines[0])
}
