// Subqueries and sets: lessons in order. Each lesson lives in its own file under subqueries/.
import scalar from './subqueries/scalar.mjs'
import inSubquery from './subqueries/in-subquery.mjs'
import correlated from './subqueries/correlated.mjs'
import exists from './subqueries/exists.mjs'
import fromSubquery from './subqueries/from-subquery.mjs'
import union from './subqueries/union.mjs'
import intersectExcept from './subqueries/intersect-except.mjs'
import withCte from './subqueries/with-cte.mjs'
import severalCtes from './subqueries/several-ctes.mjs'
import topPerGroup from './subqueries/top-per-group.mjs'

export const subqueriesTopics = [
  scalar,
  inSubquery,
  correlated,
  exists,
  fromSubquery,
  union,
  intersectExcept,
  withCte,
  severalCtes,
  topPerGroup,
]
