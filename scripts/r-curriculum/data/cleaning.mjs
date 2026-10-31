// Cleaning data: stages in order, then the side quests. Each stage lives in its own file under cleaning/.
import readingCsv from './cleaning/reading-csv.mjs'
import columnNames from './cleaning/column-names.mjs'
import numbersAsText from './cleaning/numbers-as-text.mjs'
import cleaningText from './cleaning/cleaning-text.mjs'
import recoding from './cleaning/recoding.mjs'
import duplicates from './cleaning/duplicates.mjs'
import missingStrategies from './cleaning/missing-strategies.mjs'
import datesFromText from './cleaning/dates-from-text.mjs'
import projectClub from './cleaning/project-club.mjs'
import projectSales from './cleaning/project-sales.mjs'
import projectSensors from './cleaning/project-sensors.mjs'

export const cleaningTopics = [
  readingCsv,
  columnNames,
  numbersAsText,
  cleaningText,
  recoding,
  duplicates,
  missingStrategies,
  datesFromText,
  projectClub,
  projectSales,
  projectSensors,
]
