import { completeFromList, type CompletionContext, type CompletionSource } from '@codemirror/autocomplete'
import { EditorLanguage, type SuggestionContext } from '../EditorLanguage'
import { isSqlKeyword, sqlTableFor, sqlTablesInQuery } from './sqlTables'

export class SqlEditorLanguage extends EditorLanguage {
  /**
   * SQL suggestions, depending on where the cursor is:
   * - after `books.` or an alias such as `b.`: that table's columns;
   * - right after FROM, JOIN, INTO, UPDATE or TABLE: the lesson's tables first;
   * - anywhere else: the columns of the tables the query already uses first, then the
   *   other table and column names, names already typed, and SQL's keywords and functions.
   * Like Python's, they start from the second letter of a word (or straight after a dot).
   */
  completionSource({ extraNames, sqlTables }: SuggestionContext): CompletionSource {
    const sqlWords = completeFromList(this.words)
    return async (context: CompletionContext) => {
      const doc = context.state.doc.toString()
      const tables = sqlTables()

      const dotted = context.matchBefore(/[A-Za-z_]\w*\.\w*/)
      if (dotted) {
        const text = context.state.sliceDoc(dotted.from, dotted.to)
        const qualifier = text.slice(0, text.indexOf('.'))
        const table = sqlTableFor(qualifier, doc, tables)
        if (!table) return null
        return {
          from: dotted.from + qualifier.length + 1,
          options: table.columns.map((label) => ({ label, type: 'property', detail: table.name })),
          validFor: /^\w*$/,
        }
      }

      const word = context.matchBefore(/\w+/)
      const from = word ? word.from : context.pos
      const wantsTable = /\b(from|join|into|update|table)\s+$/i.test(context.state.sliceDoc(0, from))
      if (!context.explicit && !wantsTable && (!word || word.to - word.from < 2)) return null
      if (!context.explicit && wantsTable && !word) return null

      const typed = doc.match(/[A-Za-z_]\w+/g) ?? []
      const current = word ? context.state.sliceDoc(word.from, word.to) : ''
      return this.merge(
        [
          { options: wantsTable ? tables.map((t) => ({ label: t.name, type: 'class', detail: 'table' })) : [], boost: 4 },
          ...sqlTablesInQuery(doc, tables).map((table) => ({
            options: table.columns.map((label) => ({ label, type: 'property', detail: table.name })),
            boost: 3,
          })),
          { options: extraNames().map((label) => ({ label, type: 'variable' })), boost: 2 },
          {
            options: [...new Set(typed)]
              .filter((name) => name !== current && !isSqlKeyword(name))
              .map((label) => ({ label, type: 'variable' })),
            boost: 1,
          },
          { options: (await sqlWords(context))?.options, boost: 0 },
        ],
        from,
        /^\w*$/,
        (label) => label.toLowerCase(),
      )
    }
  }
}
