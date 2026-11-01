import type { FriendlyCodeError } from '../LanguagePack'

/** An error SQLite reported for one statement of the learner's SQL. */
export interface SqlErrorPayload {
  message: string
  /** The statement that failed. */
  statement: string
  /** Which statement it was, from 1. */
  number: number
}

/** The 1-based line in `code` where `statement` starts, if it can be found. */
function lineOf(code: string, statement: string): number | undefined {
  const start = code.indexOf(statement.trim().split('\n')[0] ?? '')
  if (start < 0) return undefined
  return code.slice(0, start).split('\n').length
}

/** SQLite's error message as a title, a plain explanation and a tip for beginners. */
export function explainSqlError(error: SqlErrorPayload, code: string): FriendlyCodeError {
  const message = error.message
  const which = error.number > 1 ? ` (in statement ${error.number})` : ''
  const base = { detail: `SQLite says: ${message}${which}`, line: lineOf(code, error.statement), errorType: 'SqlError' }
  let m: RegExpMatchArray | null
  if ((m = message.match(/^no such table: (.+)$/))) {
    return {
      ...base,
      title: 'Unknown table',
      tip: `There's no table called ${m[1]}. Check the spelling: the tables you can use are listed above the editor.`,
    }
  }
  if ((m = message.match(/^no such column: (.+)$/))) {
    return {
      ...base,
      title: 'Unknown column',
      tip: `There's no column called ${m[1]}. Check the spelling against the table's columns. If ${m[1]} is meant to be a text value, put it in single quotes: '${m[1]}'.`,
    }
  }
  if ((m = message.match(/^near "(.*)": syntax error$/))) {
    return {
      ...base,
      title: 'SQL syntax error',
      tip: `SQLite couldn't read the SQL just before "${m[1]}". Look for a missing comma between columns, a misspelt keyword, or parts in the wrong order: SELECT … FROM … WHERE … ORDER BY … LIMIT.`,
    }
  }
  if (/^incomplete input$/.test(message)) {
    return {
      ...base,
      title: 'Unfinished statement',
      tip: "The statement stops too early. Is a quote or a bracket still open, or is something missing after the last keyword?",
    }
  }
  if ((m = message.match(/^unrecognized token: "(.*)"$/))) {
    return {
      ...base,
      title: 'Unexpected text',
      tip: `SQLite didn't understand ${m[1]}. Text values go in single quotes, 'like this', and each quote needs a partner.`,
    }
  }
  if ((m = message.match(/^no such function: (.+)$/))) {
    return {
      ...base,
      title: 'Unknown function',
      tip: `SQLite has no function called ${m[1]}. Check the spelling, and that it's one this stage uses.`,
    }
  }
  if ((m = message.match(/^wrong number of arguments to function (.+)\(\)$/))) {
    return { ...base, title: 'Wrong number of values', tip: `${m[1]}() got too many or too few values in its brackets.` }
  }
  if ((m = message.match(/^ambiguous column name: (.+)$/))) {
    return {
      ...base,
      title: 'Which table?',
      tip: `More than one table has a column called ${m[1]}. Put the table name in front: table.${m[1]}.`,
    }
  }
  if ((m = message.match(/^table (\S+) has (\d+) columns but (\d+) values were supplied$/))) {
    return { ...base, title: 'Wrong number of values', tip: `${m[1]} has ${m[2]} columns, but ${m[3]} values were given. List the columns you are filling in, or give one value for each column.` }
  }
  if ((m = message.match(/^(\d+) values for (\d+) columns$/))) {
    return { ...base, title: 'Wrong number of values', tip: `You listed ${m[2]} columns but gave ${m[1]} values: give one value per column.` }
  }
  if ((m = message.match(/^(UNIQUE|NOT NULL|CHECK|FOREIGN KEY) constraint failed/))) {
    return { ...base, title: `${m[1]} rule broken`, tip: 'The table has a rule this change would break, so SQLite refused it. Read the message to see which column.' }
  }
  if (/misuse of aggregate/.test(message)) {
    return { ...base, title: 'Misused total', tip: 'Totals such as COUNT() and SUM() can’t go in WHERE. Filter totals with HAVING instead.' }
  }
  return { ...base, title: 'SQL error', tip: 'Read the message from SQLite above, then check that line of your SQL.' }
}

/** One-line summary for the editor's error marker. */
export function sqlErrorSummaryLine(detail: string): string | null {
  const line = detail.trim().split('\n')[0]
  return line ? line.replace(/^SQLite says: /, '') : null
}
