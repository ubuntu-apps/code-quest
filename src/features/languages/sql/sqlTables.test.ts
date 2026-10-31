import { describe, expect, it } from 'vitest'
import { sqlTableFor, sqlTablesInQuery } from './sqlTables'

const tables = [
  { name: 'books', columns: ['id', 'title', 'author_id'] },
  { name: 'authors', columns: ['id', 'name'] },
  { name: 'loans', columns: ['book_id', 'due'] },
]

describe('sqlTableFor', () => {
  it('finds a table by its own name, in any case', () => {
    expect(sqlTableFor('Books', 'SELECT 1', tables)?.name).toBe('books')
  })

  it('finds a table by its alias', () => {
    const sql = 'SELECT b.title, a.name FROM books b JOIN authors AS a ON a.id = b.author_id'
    expect(sqlTableFor('b', sql, tables)?.name).toBe('books')
    expect(sqlTableFor('a', sql, tables)?.name).toBe('authors')
    expect(sqlTableFor('l', sql, tables)).toBeNull()
  })

  it("doesn't take a keyword after the table for an alias", () => {
    expect(sqlTableFor('where', 'SELECT * FROM books WHERE id = 1', tables)).toBeNull()
  })
})

describe('sqlTablesInQuery', () => {
  it('lists the lesson tables a query names', () => {
    expect(sqlTablesInQuery('SELECT * FROM loans JOIN books ON 1', tables).map((t) => t.name)).toEqual([
      'books',
      'loans',
    ])
  })
})
