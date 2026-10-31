// Summarising data: stages in order, then the side quests. Each stage lives in its own file under summarising/.
import counts from './summarising/counts.mjs'
import centre from './summarising/centre.mjs'
import spread from './summarising/spread.mjs'
import tapply from './summarising/tapply.mjs'
import aggregate from './summarising/aggregate.mjs'
import twoWay from './summarising/two-way.mjs'
import outliers from './summarising/outliers.mjs'
import report from './summarising/report.mjs'
import projectClassResults from './summarising/project-class-results.mjs'
import projectSeedlingTrial from './summarising/project-seedling-trial.mjs'
import projectDeliveryTimes from './summarising/project-delivery-times.mjs'

export const summarisingTopics = [
  counts,
  centre,
  spread,
  tapply,
  aggregate,
  twoWay,
  outliers,
  report,
  projectClassResults,
  projectSeedlingTrial,
  projectDeliveryTimes,
]
