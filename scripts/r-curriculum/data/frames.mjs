// Data frames: stages in order, then the side quests. Each stage lives in its own file under frames/.
import looking from './frames/looking.mjs'
import making from './frames/making.mjs'
import columns from './frames/columns.mjs'
import brackets from './frames/brackets.mjs'
import filtering from './frames/filtering.mjs'
import sortingRows from './frames/sorting-rows.mjs'
import summaryNa from './frames/summary-na.mjs'
import combining from './frames/combining.mjs'
import projectBikeTrips from './frames/project-bike-trips.mjs'
import projectCafeOrders from './frames/project-cafe-orders.mjs'
import projectGardenPlots from './frames/project-garden-plots.mjs'

export const framesTopics = [
  looking,
  making,
  columns,
  brackets,
  filtering,
  sortingRows,
  summaryNa,
  combining,
  projectBikeTrips,
  projectCafeOrders,
  projectGardenPlots,
]
