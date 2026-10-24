import type { SqlTable } from './types'

/** SQL keywords the course uses (SQLite), for colouring and suggestions. */
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
  'IGNORE', 'WITHOUT', 'ROWID',
]

/** SQLite functions the course uses. */
export const SQL_FUNCTIONS = [
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'ABS', 'UPPER', 'LOWER', 'LENGTH', 'SUBSTR', 'TRIM', 'REPLACE',
  'INSTR', 'COALESCE', 'IFNULL', 'NULLIF', 'CAST', 'DATE', 'TIME', 'DATETIME', 'STRFTIME', 'JULIANDAY',
  'GROUP_CONCAT', 'PRINTF', 'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LAG', 'LEAD', 'IIF', 'TYPEOF',
]

/** Table and column names, for the editor's suggestions. */
export function sqlTableNames(tables: SqlTable[] | undefined): string[] {
  return [...new Set((tables ?? []).flatMap((t) => [t.name, ...t.columns]))]
}
