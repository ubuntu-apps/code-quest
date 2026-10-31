// Reshaping and combining data: stages in order, then the side quests. Each stage lives in its own file under reshaping/.
import matrices from './reshaping/matrices.mjs'
import applyMargins from './reshaping/apply-margins.mjs'
import splitCombine from './reshaping/split-combine.mjs'
import stacking from './reshaping/stacking.mjs'
import joiningKeys from './reshaping/joining-keys.mjs'
import wideLong from './reshaping/wide-long.mjs'
import setsMatch from './reshaping/sets-match.mjs'
import tablesFrames from './reshaping/tables-frames.mjs'
import projectQuizLeague from './reshaping/project-quiz-league.mjs'
import projectMarketStalls from './reshaping/project-market-stalls.mjs'
import projectWeatherStations from './reshaping/project-weather-stations.mjs'

export const reshapingTopics = [
  matrices,
  applyMargins,
  splitCombine,
  stacking,
  joiningKeys,
  wideLong,
  setsMatch,
  tablesFrames,
  projectQuizLeague,
  projectMarketStalls,
  projectWeatherStations,
]
