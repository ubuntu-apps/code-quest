// Joining tables: lessons in order. Each lesson lives in its own file under joins/.
import keys from './joins/keys.mjs'
import innerJoin from './joins/inner-join.mjs'
import aliases from './joins/aliases.mjs'
import filterSort from './joins/filter-sort.mjs'
import joinAggregate from './joins/join-aggregate.mjs'
import leftJoin from './joins/left-join.mjs'
import unmatched from './joins/unmatched.mjs'
import threeTables from './joins/three-tables.mjs'
import selfJoin from './joins/self-join.mjs'
import manyToMany from './joins/many-to-many.mjs'

export const joinsTopics = [
  keys,
  innerJoin,
  aliases,
  filterSort,
  joinAggregate,
  leftJoin,
  unmatched,
  threeTables,
  selfJoin,
  manyToMany,
]
