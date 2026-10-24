// Summarising data: lessons in order. Each lesson lives in its own file under aggregation/.
import countRows from './aggregation/count-rows.mjs'
import sumAvg from './aggregation/sum-avg.mjs'
import groupBy from './aggregation/group-by.mjs'
import groupExpressions from './aggregation/group-expressions.mjs'
import groupSeveral from './aggregation/group-several.mjs'
import having from './aggregation/having.mjs'
import distinctConcat from './aggregation/distinct-concat.mjs'
import conditionalTotals from './aggregation/conditional-totals.mjs'
import carefulTotals from './aggregation/careful-totals.mjs'
import summaryReports from './aggregation/summary-reports.mjs'

export const aggregationTopics = [
  countRows,
  sumAvg,
  groupBy,
  groupExpressions,
  groupSeveral,
  having,
  distinctConcat,
  conditionalTotals,
  carefulTotals,
  summaryReports,
]
