import type { FriendlyCodeError } from '../LanguagePack'
import type { JsError } from './jsHarness'

/** A JavaScript error, explained for learners: what kind it is, and what to look for. */
export function explainJsError(error: JsError): FriendlyCodeError {
  const { name, message } = error
  const detail = `${name}: ${message}`
  const at = { ...(error.line ? { line: error.line } : {}), ...(error.column ? { column: error.column } : {}), errorType: name }
  const lower = message.toLowerCase()

  if (name === 'SyntaxError') {
    return {
      title: 'Syntax error',
      detail,
      tip: lower.includes('declared')
        ? 'A name can be declared with `let` or `const` only once. Drop the second `let`/`const`, or pick another name.'
        : 'JavaScript couldn\'t read this code. Check that every bracket ( ) [ ] { } and every quote has its partner.',
      ...at,
    }
  }
  if (name === 'ReferenceError') {
    if (lower.includes('before initialization')) {
      return { title: 'Used before it was made', detail, tip: 'Move the line that creates it (`let` or `const`) above the line that uses it.', ...at }
    }
    return {
      title: 'Name not found',
      detail,
      tip: 'JavaScript doesn\'t know this name. Check the spelling and the capital letters (`console.log`, not `Console.log`), and that it was created with `let` or `const` first.',
      ...at,
    }
  }
  if (name === 'TypeError') {
    if (lower.includes('constant')) {
      return { title: 'A const can\'t change', detail, tip: 'This name was made with `const`. Use `let` if its value needs to change.', ...at }
    }
    if (lower.includes('not a function')) {
      return { title: 'Not a function', detail, tip: 'Something is called with ( ) that isn\'t a function. Check its spelling, or whether it needs brackets at all.', ...at }
    }
    if (lower.includes('undefined') || lower.includes('null')) {
      return { title: 'Nothing there', detail, tip: 'The code reads something from `undefined` or `null`. Check the value before the dot has been set.', ...at }
    }
    return { title: 'Type error', detail, tip: 'A value isn\'t the kind the code expects (a number, text, an array…).', ...at }
  }
  if (name === 'RangeError') {
    return {
      title: 'Value out of range',
      detail,
      tip: lower.includes('call stack') ? 'A function keeps calling itself without stopping. Check the case that should end it.' : 'A number is too big, too small or not allowed here.',
      ...at,
    }
  }
  return { title: `${name}`, detail, tip: 'Read the message, then look at the line it points to.', ...at }
}

/** The first line of an error's detail, for the message under the error line in the editor. */
export function jsErrorSummaryLine(detail: string): string | null {
  const first = detail.split('\n').find((line) => line.trim().length > 0)
  return first?.trim() ?? null
}
