import { StreamLanguage, type StreamParser } from '@codemirror/language'
import language from './language.json'

const KEYWORDS = new Set(language.words.keywords.map((w) => w.toLowerCase()))
const FUNCTIONS = new Set(language.words.functions.map((w) => w.toLowerCase()))

interface SqlState {
  /** Inside a /* comment *\/ that continues on the next line. */
  inComment: boolean
}

/** A small SQL (SQLite) tokenizer for colouring: keywords, functions, text, numbers and comments. */
const sqlParser: StreamParser<SqlState> = {
  name: 'sql',
  startState: () => ({ inComment: false }),
  token(stream, state) {
    if (state.inComment) {
      if (stream.skipTo('*/')) {
        stream.next()
        stream.next()
        state.inComment = false
      } else stream.skipToEnd()
      return 'comment'
    }
    if (stream.eatSpace()) return null
    if (stream.match('--')) {
      stream.skipToEnd()
      return 'comment'
    }
    if (stream.match('/*')) {
      state.inComment = true
      return 'comment'
    }
    if (stream.eat("'")) {
      // '' inside text is an escaped quote.
      while (!stream.eol()) {
        if (stream.next() === "'" && !stream.eat("'")) return 'string'
      }
      return 'string'
    }
    const quote = stream.peek()
    if (quote === '"' || quote === '`') {
      // A quoted name, such as "Product name".
      stream.next()
      while (!stream.eol() && stream.next() !== quote) {
        // read up to the closing quote
      }
      return 'variableName'
    }
    if (stream.match(/^\d+(\.\d*)?([eE][+-]?\d+)?/) || stream.match(/^\.\d+/)) return 'number'
    if (stream.match(/^[A-Za-z_][\w$]*/)) {
      const word = stream.current().toLowerCase()
      if (KEYWORDS.has(word)) return 'keyword'
      if (FUNCTIONS.has(word) && stream.match(/^\s*\(/, false)) return 'variableName.function'
      return 'variableName'
    }
    if (stream.match(/^(<>|!=|<=|>=|\|\||[=<>+\-*/%])/)) return 'operator'
    stream.next()
    return null
  },
  languageData: { commentTokens: { line: '--', block: { open: '/*', close: '*/' } } },
}

export const sqlLanguage = StreamLanguage.define(sqlParser)
