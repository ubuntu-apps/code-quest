export interface FriendlyPythonError {
  title: string
  detail: string
  tip?: string
  line?: number
  column?: number
  errorType?: string
}

/** One-line exception text for tooltips, e.g. `SyntaxError: invalid decimal literal`. */
export function pythonErrorSummaryLine(detail: string): string | null {
  const lines = detail
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
  if (lines.length === 0) return null
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]
    if (/^[A-Za-z][A-Za-z0-9]*Error:/.test(line)) return line
  }
  return lines[lines.length - 1]
}

export type PythonErrorExplanationContext = {
  rawMessage: string
}

export type PythonErrorRule = (
  context: PythonErrorExplanationContext,
) => FriendlyPythonError | null

export type PythonErrorFallback = (
  context: PythonErrorExplanationContext,
) => Promise<FriendlyPythonError | null> | FriendlyPythonError | null

/** Frames that map to learner code in our Pyodide wrappers (not outer "<exec>"). */
const USER_FRAME_RE =
  /File\s+"(<sandbox>|<challenge_user>|<challenge_setup>|<challenge_assert>)",\s+line\s+(\d+)/gi

function parseTraceLocation(message: string): { line?: number; column?: number } {
  // First `File "...", line N` is often Pyodide's "<exec>" wrapper — prefer user frames.
  const userFrames = [...message.matchAll(USER_FRAME_RE)]
  let line: number | undefined
  if (userFrames.length > 0) {
    line = Number(userFrames[userFrames.length - 1][2])
  } else {
    const allFrames = [...message.matchAll(/File\s+"<[^>]+>",\s+line\s+(\d+)/g)]
    if (allFrames.length > 0) {
      line = Number(allFrames[allFrames.length - 1][1])
    }
  }

  // Tracebacks often include:
  //   some_code_here
  //           ^
  // We estimate the column from caret indentation. Use the last caret when multiple exist.
  const caretMatches = [...message.matchAll(/\n([^\n]*)\n(\s*)\^/g)]
  const lastCaret = caretMatches[caretMatches.length - 1]
  const column = lastCaret ? Math.max(1, (lastCaret[2]?.length ?? 0) + 1) : undefined

  return { line, column }
}

function defaultRules(): PythonErrorRule[] {
  return [
    ({ rawMessage }) => {
      const lower = rawMessage.toLowerCase()
      if (!lower.includes('typeerror')) return null
      const loc = parseTraceLocation(rawMessage)
      let tip = 'Two values are being combined in an incompatible way. Check their data types.'
      if (lower.includes('concatenate str') && lower.includes('"int"')) {
        tip = 'You are joining text with a number. Convert the number first: `print("..."+str(name))` or use `print("...", name)`.'
      } else if (lower.includes('unsupported operand type')) {
        tip = 'This operator is not valid for these value types. Convert one side or use a different operation.'
      }
      return {
        title: 'Type error',
        detail: rawMessage,
        tip,
        errorType: 'TypeError',
        line: loc.line,
        column: loc.column,
      }
    },
    ({ rawMessage }) => {
      const lower = rawMessage.toLowerCase()
      if (!lower.includes('syntaxerror')) return null
      const loc = parseTraceLocation(rawMessage)
      let tip = 'Check punctuation and indentation, then try again.'
      if (lower.includes('eol while scanning string') || lower.includes('unterminated string')) {
        tip = 'A quote is likely missing. Make sure each string starts and ends with matching quotes.'
      } else if (lower.includes('expected an indented block')) {
        tip = 'Python expected an indented block after a line ending in ":" (use 4 spaces).'
      } else if (lower.includes('unexpected indent')) {
        tip = 'There is extra indentation where Python does not expect it.'
      } else if (lower.includes('invalid syntax')) {
        tip = 'Look near the highlighted token for a missing colon, parenthesis, quote, or comma.'
      }
      return {
        title: 'Syntax error',
        detail: rawMessage,
        tip,
        errorType: 'SyntaxError',
        line: loc.line,
        column: loc.column,
      }
    },
    ({ rawMessage }) => {
      const lower = rawMessage.toLowerCase()
      if (!lower.includes('nameerror')) return null
      const loc = parseTraceLocation(rawMessage)
      return {
        title: 'Unknown name',
        detail: rawMessage,
        tip: 'A variable or function name may be misspelled or used before being defined.',
        errorType: 'NameError',
        line: loc.line,
        column: loc.column,
      }
    },
    ({ rawMessage }) => {
      const lower = rawMessage.toLowerCase()
      if (!lower.includes('indentationerror')) return null
      const loc = parseTraceLocation(rawMessage)
      return {
        title: 'Indentation problem',
        detail: rawMessage,
        tip: 'Use consistent indentation (4 spaces is standard in Python).',
        errorType: 'IndentationError',
        line: loc.line,
        column: loc.column,
      }
    },
  ]
}

function fallbackRule(context: PythonErrorExplanationContext): FriendlyPythonError {
  const loc = parseTraceLocation(context.rawMessage)
  return {
    title: 'Execution error',
    detail: context.rawMessage,
    tip: 'Review the line mentioned in the message, fix it, and run again.',
    errorType: 'ExecutionError',
    line: loc.line,
    column: loc.column,
  }
}

export async function explainPythonError(
  rawMessage: string,
  options?: {
    rules?: PythonErrorRule[]
    fallback?: PythonErrorFallback
  },
): Promise<FriendlyPythonError> {
  const context: PythonErrorExplanationContext = { rawMessage }
  const rules = options?.rules ?? defaultRules()

  for (const rule of rules) {
    const match = rule(context)
    if (match) return match
  }

  const customFallback = options?.fallback
  if (customFallback) {
    const custom = await customFallback(context)
    if (custom) return custom
  }

  return fallbackRule(context)
}
