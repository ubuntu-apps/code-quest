import { describe, expect, it } from 'vitest'
import { explainSqlError, sqlErrorSummaryLine } from './sqlErrorHelper'

describe('explainSqlError', () => {
  it('suggests quotes when an unknown column looks like a text value', () => {
    const e = explainSqlError(
      { message: 'no such column: dog', statement: "SELECT name FROM pets WHERE species = dog", number: 1 },
      'SELECT name FROM pets WHERE species = dog;',
    )
    expect(e.title).toBe('Unknown column')
    expect(e.tip).toContain("'dog'")
    expect(e.line).toBe(1)
  })

  it('finds the line of the statement that failed', () => {
    const code = 'SELECT * FROM books;\n\nSELECT * FROM pet;'
    const e = explainSqlError({ message: 'no such table: pet', statement: 'SELECT * FROM pet;', number: 2 }, code)
    expect(e.title).toBe('Unknown table')
    expect(e.line).toBe(3)
    expect(e.detail).toContain('statement 2')
  })

  it('explains syntax errors and keeps SQLite\'s message', () => {
    const e = explainSqlError({ message: 'near "FROM": syntax error', statement: 'SELECT title, FROM books', number: 1 }, 'SELECT title, FROM books')
    expect(e.title).toBe('SQL syntax error')
    expect(sqlErrorSummaryLine(e.detail)).toBe('near "FROM": syntax error')
  })
})
