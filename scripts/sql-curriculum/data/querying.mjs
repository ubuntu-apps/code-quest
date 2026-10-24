// Querying a table: lessons in order. Each lesson lives in its own file under querying/.
import firstQuery from './querying/first-query.mjs'
import selectColumns from './querying/select-columns.mjs'
import whereBasics from './querying/where-basics.mjs'
import andOrNot from './querying/and-or-not.mjs'
import inBetween from './querying/in-between.mjs'
import likePatterns from './querying/like-patterns.mjs'
import nullValues from './querying/null-values.mjs'
import orderBy from './querying/order-by.mjs'
import limitDistinct from './querying/limit-distinct.mjs'
import calculatedColumns from './querying/calculated-columns.mjs'

export const queryingTopics = [
  firstQuery,
  selectColumns,
  whereBasics,
  andOrNot,
  inBetween,
  likePatterns,
  nullValues,
  orderBy,
  limitDistinct,
  calculatedColumns,
]
