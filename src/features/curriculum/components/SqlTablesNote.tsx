import type { SqlTable } from '../types'

/** The tables a SQL lesson's database has, with their columns, folded under one line. */
export function SqlTablesNote({ tables }: { tables: SqlTable[] }) {
  if (tables.length === 0) return null
  return (
    <details className="cq-sql-tables">
      <summary>
        {tables.length === 1 ? 'Table' : 'Tables'}: {tables.map((t) => t.name).join(', ')}
      </summary>
      <ul>
        {tables.map((table) => (
          <li key={table.name}>
            <code className="cq-md-code">{table.name}</code>
            <span className="cq-sql-columns">
              {table.columns.map((column) => (
                <code key={column} className="cq-md-code">
                  {column}
                </code>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </details>
  )
}
