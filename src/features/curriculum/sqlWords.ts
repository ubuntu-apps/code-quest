import type { SqlTable } from './types'

/**
 * SQL keywords the course uses (SQLite), for colouring and suggestions. Words the lessons also
 * use as names (`AS before`, `AS first`) are left out, so they aren't coloured as keywords.
 */
export const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'AS', 'DISTINCT',
  'ORDER', 'BY', 'ASC', 'DESC', 'LIMIT', 'OFFSET', 'GROUP', 'HAVING', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL',
  'OUTER', 'CROSS', 'ON', 'USING', 'UNION', 'ALL', 'INTERSECT', 'EXCEPT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'ADD', 'COLUMN',
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'DEFAULT', 'CHECK', 'INDEX', 'VIEW', 'IF', 'EXISTS',
  'WITH', 'RECURSIVE', 'OVER', 'PARTITION', 'WINDOW', 'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION', 'INTEGER',
  'TEXT', 'REAL', 'NUMERIC', 'BLOB', 'TRUE', 'FALSE', 'COLLATE', 'NOCASE', 'GLOB', 'ESCAPE', 'RETURNING',
  'PRAGMA', 'STRICT', 'CASCADE', 'RESTRICT', 'ACTION', 'NO', 'AUTOINCREMENT', 'CONSTRAINT', 'RENAME', 'TO',
  'TEMP', 'TEMPORARY', 'EXPLAIN', 'QUERY', 'PLAN', 'SAVEPOINT', 'RELEASE', 'CONFLICT', 'DO', 'NOTHING',
  'IGNORE', 'WITHOUT', 'ROWID', 'FILTER', 'ROWS', 'RANGE', 'GROUPS', 'ROW', 'PRECEDING', 'FOLLOWING', 'UNBOUNDED',
  'CURRENT', 'EXCLUDE', 'MATERIALIZED', 'REGEXP',
]

/** SQLite functions the course uses. */
export const SQL_FUNCTIONS = [
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'ABS', 'UPPER', 'LOWER', 'LENGTH', 'SUBSTR', 'TRIM', 'REPLACE',
  'INSTR', 'COALESCE', 'IFNULL', 'NULLIF', 'CAST', 'DATE', 'TIME', 'DATETIME', 'STRFTIME', 'JULIANDAY',
  'GROUP_CONCAT', 'PRINTF', 'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LAG', 'LEAD', 'IIF', 'TYPEOF', 'NTILE',
  'FIRST_VALUE', 'LAST_VALUE', 'NTH_VALUE', 'PERCENT_RANK', 'CUME_DIST', 'CEIL', 'FLOOR', 'TOTAL', 'RANDOM',
  'LTRIM', 'RTRIM', 'HEX', 'QUOTE', 'FORMAT', 'UNIXEPOCH', 'CHAR', 'UNICODE', 'JSON', 'JSON_EXTRACT', 'JSON_EACH',
  'JSON_SET', 'JSON_INSERT', 'JSON_REMOVE', 'JSON_ARRAY', 'JSON_ARRAY_LENGTH', 'JSON_OBJECT', 'JSON_GROUP_ARRAY',
  'JSON_GROUP_OBJECT', 'JSON_TYPE', 'JSON_VALID', 'JSON_TREE', 'PRAGMA_TABLE_INFO', 'CHANGES', 'LAST_INSERT_ROWID',
]

/** Table and column names, for the editor's suggestions. */
export function sqlTableNames(tables: SqlTable[] | undefined): string[] {
  return [...new Set((tables ?? []).flatMap((t) => [t.name, ...t.columns]))]
}

const SQL_KEYWORD_SET = new Set(SQL_KEYWORDS.map((w) => w.toLowerCase()))

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
