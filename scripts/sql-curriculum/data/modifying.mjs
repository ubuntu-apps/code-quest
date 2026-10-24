// Changing data: lessons in order. Each lesson lives in its own file under modifying/.
import insert from './modifying/insert.mjs'
import insertMany from './modifying/insert-many.mjs'
import update from './modifying/update.mjs'
import updateExpressions from './modifying/update-expressions.mjs'
import updateOtherTables from './modifying/update-other-tables.mjs'
import del from './modifying/delete.mjs'
import transactions from './modifying/transactions.mjs'
import upserts from './modifying/upserts.mjs'
import returning from './modifying/returning.mjs'
import acrossTables from './modifying/across-tables.mjs'

export const modifyingTopics = [
  insert,
  insertMany,
  update,
  updateExpressions,
  updateOtherTables,
  del,
  transactions,
  upserts,
  returning,
  acrossTables,
]
