// Types, text and factors: stages in order, then the side quests. Each stage lives in its own file under types/.
import types from './types/types.mjs'
import converting from './types/converting.mjs'
import ifelse from './types/ifelse.mjs'
import factors from './types/factors.mjs'
import counting from './types/counting.mjs'
import cut from './types/cut.mjs'
import textTools from './types/text-tools.mjs'
import findReplace from './types/find-replace.mjs'
import dates from './types/dates.mjs'
import lists from './types/lists.mjs'
import projectSurvey from './types/project-survey.mjs'
import projectLibraryLoans from './types/project-library-loans.mjs'
import projectSignupSheet from './types/project-messy-names.mjs'

export const typesTopics = [
  types,
  converting,
  ifelse,
  factors,
  counting,
  cut,
  textTools,
  findReplace,
  dates,
  lists,
  projectSurvey,
  projectLibraryLoans,
  projectSignupSheet,
]
