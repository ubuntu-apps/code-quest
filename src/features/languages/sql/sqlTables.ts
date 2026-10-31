import type { SqlTable } from '../../curriculum/types'
import language from './language.json'

/** Helpers for a SQL lesson's tables: their names, and which ones a query uses (for suggestions). */

/** Table and column names, for the editor's suggestions. */
export function sqlTableNames(tables: SqlTable[] | undefined): string[] {
  return [...new Set((tables ?? []).flatMap((t) => [t.name, ...t.columns]))]
}

const SQL_KEYWORD_SET = new Set(language.words.keywords.map((w) => w.toLowerCase()))

/** A word that starts a clause, so it can't be an alias in `FROM books WHERE …`. */
export function isSqlKeyword(word: string): boolean {
  return SQL_KEYWORD_SET.has(word.toLowerCase())
}

/**
 * The table a name stands for in this query: a table's own name, or an alias given to it
 * with `FROM books b`, `JOIN authors AS a` or `UPDATE books AS b`.
 */
export function sqlTableFor(name: string, sql: string, tables: SqlTable[]): SqlTable | null {
  const byName = (n: string) => tables.find((t) => t.name.toLowerCase() === n.toLowerCase()) ?? null
  const direct = byName(name)
  if (direct) return direct
  const aliasRe = /\b(?:from|join|update)\s+([A-Za-z_]\w*)(?:\s+(?:as\s+)?([A-Za-z_]\w*))?/gi
  for (const m of sql.matchAll(aliasRe)) {
    const alias = m[2]
    if (alias && !isSqlKeyword(alias) && alias.toLowerCase() === name.toLowerCase()) return byName(m[1])
  }
  return null
}

/** The lesson tables this query names (after FROM, JOIN, INTO, UPDATE and so on). */
export function sqlTablesInQuery(sql: string, tables: SqlTable[]): SqlTable[] {
  const words = new Set((sql.match(/[A-Za-z_]\w*/g) ?? []).map((w) => w.toLowerCase()))
  return tables.filter((t) => words.has(t.name.toLowerCase()))
}
