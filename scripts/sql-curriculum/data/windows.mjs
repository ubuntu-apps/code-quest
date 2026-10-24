// Window functions: lessons in order. Each lesson lives in its own file under windows/.
import over from './windows/over.mjs'
import partition from './windows/partition.mjs'
import rowNumber from './windows/row-number.mjs'
import rank from './windows/rank.mjs'
import topRows from './windows/top-rows.mjs'
import running from './windows/running.mjs'
import lagLead from './windows/lag-lead.mjs'
import frames from './windows/frames.mjs'
import ntileValues from './windows/ntile-values.mjs'
import namedWindows from './windows/named-windows.mjs'

export const windowsTopics = [
  over,
  partition,
  rowNumber,
  rank,
  topRows,
  running,
  lagLead,
  frames,
  ntileValues,
  namedWindows,
]
