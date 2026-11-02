import { useEffect, useRef, useState } from 'react'
import type { LanguagePack } from '../../languages'
import type { SqlTable } from '../content/types'

/** How many rows "Peek" shows. */
const PEEK_ROWS = 5

type Peek = { state: 'loading' } | { state: 'done'; text: string }

/**
 * The tables a SQL lesson's database has, with their columns, folded under one line.
 * With the lesson's `setupSql`, each table has a Peek button that shows its first rows,
 * so a learner can see what the data looks like before writing a query. The course's
 * language (`pack`) runs the query.
 */
export function SqlTablesNote({ pack, tables, setupSql }: { pack: LanguagePack; tables: SqlTable[]; setupSql?: string }) {
  // Peeks belong to one database; a different lesson's starts with none shown.
  const [peekState, setPeekState] = useState<{ setupSql?: string; peeks: Record<string, Peek> }>({ peeks: {} })
  const peeks = peekState.setupSql === setupSql ? peekState.peeks : {}
  const setPeeks = (update: (prev: Record<string, Peek>) => Record<string, Peek>) =>
    setPeekState((prev) => ({ setupSql, peeks: update(prev.setupSql === setupSql ? prev.peeks : {}) }))
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  if (tables.length === 0) return null

  const peek = async (name: string) => {
    if (!setupSql) return
    if (peeks[name]) {
      setPeeks((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
      return
    }
    setPeeks((prev) => ({ ...prev, [name]: { state: 'loading' } }))
    const result = await pack.peekTable({ table: name, setupSql, rows: PEEK_ROWS })
    if (!mounted.current) return
    const text = result.error
      ? `Couldn't load the rows: ${result.error.title}`
      : result.output.trim() || '(This table has no rows.)'
    setPeeks((prev) => (prev[name] ? { ...prev, [name]: { state: 'done', text } } : prev))
  }

  return (
    <details className="cq-sql-tables">
      <summary>
        {tables.length === 1 ? 'Table' : 'Tables'}: {tables.map((t) => t.name).join(', ')}
      </summary>
      <ul>
        {tables.map((table) => {
          const shown = peeks[table.name]
          return (
            <li key={table.name}>
              <div className="cq-sql-table-row">
                <code className="cq-md-code">{table.name}</code>
                <span className="cq-sql-columns">
                  {table.columns.map((column) => (
                    <code key={column} className="cq-md-code">
                      {column}
                    </code>
                  ))}
                </span>
                {setupSql ? (
                  <button
                    type="button"
                    className="cq-link-btn cq-sql-peek"
                    aria-expanded={Boolean(shown)}
                    onClick={() => void peek(table.name)}
                  >
                    {shown ? 'Hide rows' : 'Peek'}
                    <span className="cq-sr-only"> at {table.name}</span>
                  </button>
                ) : null}
              </div>
              {shown ? (
                <pre className="cq-sandbox-output cq-sandbox-output--table cq-sql-peek-rows" aria-live="polite">
                  {shown.state === 'loading' ? 'Loading…' : shown.text}
                </pre>
              ) : null}
            </li>
          )
        })}
      </ul>
      {setupSql ? (
        <p className="cq-sql-peek-note">Peek shows the first {PEEK_ROWS} rows. Checks may use other rows, too.</p>
      ) : null}
    </details>
  )
}
