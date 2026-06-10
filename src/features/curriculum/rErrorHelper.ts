export interface FriendlyRError {
  title: string
  detail: string
  tip?: string
  line?: number
  column?: number
}

export function explainRError(raw: string): FriendlyRError {
  const detail = raw.trim() || 'Unknown R error'
  const lower = detail.toLowerCase()

  if (lower.includes('unexpected') || lower.includes('syntax')) {
    return {
      title: 'Syntax error',
      detail,
      tip: 'Check parentheses (), brackets [], and quotes. Every opening bracket needs a closing one.',
    }
  }

  if (lower.includes('could not find function') || lower.includes('object ') && lower.includes('not found')) {
    return {
      title: 'Name not found',
      detail,
      tip: 'Did you spell the function or variable correctly? Load packages with library() before use.',
    }
  }

  if (lower.includes('non-numeric argument') || lower.includes('invalid argument type')) {
    return {
      title: 'Type error',
      detail,
      tip: 'Make sure values have the expected type (numeric, character, logical).',
    }
  }

  if (lower.includes('argument') && lower.includes('missing')) {
    return {
      title: 'Missing argument',
      detail,
      tip: 'A function call is missing a required argument.',
    }
  }

  return {
    title: 'R error',
    detail,
    tip: 'Read the error message from bottom to top to find the first line in your code.',
  }
}

export function rErrorSummaryLine(detail: string): string {
  const first = detail.split('\n').find((line) => line.trim().length > 0)
  return first?.trim() ?? detail
}
