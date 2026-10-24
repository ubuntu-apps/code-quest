// Designing tables: lessons in order. Each lesson lives in its own file under design/.
import createTable from './design/create-table.mjs'
import keys from './design/keys.mjs'
import notNullDefault from './design/not-null-default.mjs'
import uniqueCheck from './design/unique-check.mjs'
import foreignKeys from './design/foreign-keys.mjs'
import alterDrop from './design/alter-drop.mjs'
import copyTables from './design/copy-tables.mjs'
import normalisation from './design/normalisation.mjs'
import indexes from './design/indexes.mjs'
import designChoices from './design/design-choices.mjs'

export const designTopics = [
  createTable,
  keys,
  notNullDefault,
  uniqueCheck,
  foreignKeys,
  alterDrop,
  copyTables,
  normalisation,
  indexes,
  designChoices,
]
