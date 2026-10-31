// Statistics: stages in order, then the side quests. Each stage lives in its own file under statistics/.
import randomSamples from './statistics/random-samples.mjs'
import normalDistribution from './statistics/normal-distribution.mjs'
import correlation from './statistics/correlation.mjs'
import confidenceIntervals from './statistics/confidence-intervals.mjs'
import oneSampleT from './statistics/one-sample-t.mjs'
import twoSampleT from './statistics/two-sample-t.mjs'
import chiSquared from './statistics/chi-squared.mjs'
import linearRegression from './statistics/linear-regression.mjs'
import projectCoins from './statistics/project-coins.mjs'
import projectTrial from './statistics/project-trial.mjs'
import projectIcecream from './statistics/project-icecream.mjs'

export const statisticsTopics = [
  randomSamples,
  normalDistribution,
  correlation,
  confidenceIntervals,
  oneSampleT,
  twoSampleT,
  chiSquared,
  linearRegression,
  projectCoins,
  projectTrial,
  projectIcecream,
]
