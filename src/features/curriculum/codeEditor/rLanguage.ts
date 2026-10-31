import { StreamLanguage, type StreamParser } from '@codemirror/language'
import { R_CONSTANTS, R_KEYWORDS } from '../rWords'

const KEYWORDS = new Set(R_KEYWORDS)
const CONSTANTS = new Set(R_CONSTANTS)

interface RState {
  /** Inside a text that continues on the next line, and its quote. */
  quote: string | null
}

function readString(stream: Parameters<StreamParser<RState>['token']>[0], state: RState): string {
  while (!stream.eol()) {
    const ch = stream.next()
    if (ch === '\\') stream.next()
    else if (ch === state.quote) {
      state.quote = null
      return 'string'
    }
  }
  return 'string'
}

/** A small R tokenizer for colouring: keywords, constants, text, numbers, comments and calls. */
const rParser: StreamParser<RState> = {
  name: 'r',
  startState: () => ({ quote: null }),
  token(stream, state) {
    if (state.quote) return readString(stream, state)
    if (stream.eatSpace()) return null
    if (stream.match('#')) {
      stream.skipToEnd()
      return 'comment'
    }
    const ch = stream.peek()
    if (ch === '"' || ch === "'") {
      stream.next()
      state.quote = ch
      return readString(stream, state)
    }
    if (ch === '`') {
      stream.next()
      while (!stream.eol() && stream.next() !== '`') {
        // a name in backticks
      }
      return 'variableName'
    }
    if (stream.match(/^(0[xX][0-9a-fA-F]+|\d+(\.\d*)?([eE][+-]?\d+)?|\.\d+([eE][+-]?\d+)?)L?/)) return 'number'
    if (stream.match(/^[A-Za-z.][\w.]*/)) {
      const word = stream.current()
      if (KEYWORDS.has(word)) return 'keyword'
      if (CONSTANTS.has(word)) return 'atom'
      if (stream.match(/^\s*\(/, false)) return 'variableName.function'
      return 'variableName'
    }
    if (stream.match(/^(<<-|<-|->|%[^%\s]*%|\|>|==|!=|<=|>=|&&|\|\||[=<>+\-*/^!&|~$@:?])/)) return 'operator'
    stream.next()
    return null
  },
  languageData: { commentTokens: { line: '#' } },
}

export const rLanguage = StreamLanguage.define(rParser)
