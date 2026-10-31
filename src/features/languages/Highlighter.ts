import type { LanguageSpec } from './languageSpec'

/** Kinds of token that get their own colour (the `cq-hl-<kind>` classes). */
export type TokenKind = 'keyword' | 'builtin' | 'constant' | 'string' | 'number' | 'comment' | 'name' | 'decorator' | 'plain'

export interface Token {
  text: string
  kind: TokenKind
}

interface NameRule {
  kind: TokenKind
  words: Set<string> | null
  after: Set<string> | null
  call: boolean
}

/**
 * Colours code for display, from a language's `highlight` patterns and word lists. It is a
 * highlighter, not a parser: anything it doesn't recognise stays plain text, so odd code still shows.
 *
 * The token patterns are tried in order at each position (strings before comments, so a `#`
 * inside a string isn't read as one). A name then gets the kind of the first rule it fits.
 */
export class Highlighter {
  private readonly pattern: RegExp
  /** For each token kind in order: the index of its group in `pattern`. */
  private readonly groups: { kind: TokenKind; index: number }[]
  private readonly names: NameRule[]
  private readonly caseInsensitive: boolean

  constructor(spec: LanguageSpec) {
    const { tokens, names, caseInsensitive = false } = spec.highlight
    this.caseInsensitive = caseInsensitive
    let index = 1
    this.groups = tokens.map(({ kind, pattern }) => {
      const group = { kind, index }
      // This kind's own group, plus any groups inside its pattern, which move the next ones along.
      index += new RegExp(`(?:${pattern})|`).exec('')!.length
      return group
    })
    this.pattern = new RegExp(tokens.map((t) => `(${t.pattern})`).join('|'), 'g')
    const fold = (word: string) => (caseInsensitive ? word.toLowerCase() : word)
    this.names = names.map((rule) => ({
      kind: rule.kind,
      words: rule.words ? new Set(spec.words[rule.words].map(fold)) : null,
      after: rule.after ? new Set(rule.after) : null,
      call: rule.call ?? false,
    }))
  }

  highlight(code: string): Token[] {
    const tokens: Token[] = []
    let last = 0
    // The name before this one (`def` in `def greet`); cleared by any other token.
    let previousName = ''
    // exec rather than matchAll, which Safari 12 (still supported for reading lessons) lacks.
    this.pattern.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = this.pattern.exec(code)) !== null) {
      const text = m[0]
      push(tokens, code.slice(last, m.index), 'plain')
      const kind = this.groups.find((g) => m![g.index] !== undefined)?.kind ?? 'plain'
      if (kind === 'name') {
        push(tokens, text, this.nameKind(text, previousName, code.slice(m.index + text.length)))
        previousName = text
      } else {
        push(tokens, text, kind)
        previousName = ''
      }
      last = m.index + text.length
    }
    push(tokens, code.slice(last), 'plain')
    return tokens
  }

  private nameKind(name: string, previousName: string, rest: string): TokenKind {
    const word = this.caseInsensitive ? name.toLowerCase() : name
    const rule = this.names.find(
      (r) => (!r.words || r.words.has(word)) && (!r.after || r.after.has(previousName)) && (!r.call || /^\s*\(/.test(rest)),
    )
    return rule?.kind ?? 'plain'
  }
}

function push(tokens: Token[], text: string, kind: TokenKind): void {
  if (!text) return
  const previous = tokens[tokens.length - 1]
  if (previous && previous.kind === kind) previous.text += text
  else tokens.push({ text, kind })
}
