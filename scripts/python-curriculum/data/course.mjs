/**
 * The Python course layout: its sections in order, and each section's topics in
 * teaching order. Topics are written in the data files; this file only decides
 * where they go, so reordering or moving a topic is a one-line change here.
 *
 * Section and topic IDs are stable (they key learners' progress and URLs), so
 * renaming a section only changes its title.
 */
import { fundamentalsTopics } from './fundamentals.mjs'
import { controlFlowTopics } from './control-flow.mjs'
import { dataStructuresTopics } from './data-structures.mjs'
import { functionsTopics } from './functions.mjs'
import { errorHandlingTopics } from './error-handling.mjs'
import { fileHandlingTopics } from './file-handling.mjs'
import { modulesTopics } from './modules.mjs'
import { oopTopics } from './oop.mjs'
import { dataApisTopics } from './data-apis.mjs'
import { projectsTopics } from './projects.mjs'

const allTopics = new Map(
  [
    ...fundamentalsTopics,
    ...controlFlowTopics,
    ...dataStructuresTopics,
    ...functionsTopics,
    ...errorHandlingTopics,
    ...fileHandlingTopics,
    ...modulesTopics,
    ...oopTopics,
    ...dataApisTopics,
    ...projectsTopics,
  ].map((topic) => [topic.id, topic]),
)

/** The topics with these IDs, in this order. */
function topics(...ids) {
  return ids.map((id) => {
    const topic = allTopics.get(id)
    if (!topic) throw new Error(`course.mjs: unknown topic "${id}"`)
    return topic
  })
}

export const COURSE = [
  {
    sectionId: 'fundamentals',
    filename: 'fundamentals.json',
    title: 'Fundamentals',
    topics: fundamentalsTopics,
  },
  {
    sectionId: 'control_flow',
    filename: 'control_flow.json',
    title: 'Decisions and loops',
    topics: controlFlowTopics,
  },
  {
    sectionId: 'data_structures',
    filename: 'data_structures.json',
    title: 'Data structures',
    topics: dataStructuresTopics,
  },
  {
    sectionId: 'functions',
    filename: 'functions.json',
    title: 'Functions',
    topics: functionsTopics,
  },
  {
    sectionId: 'error_handling',
    filename: 'error_handling.json',
    title: 'Errors and exceptions',
    topics: errorHandlingTopics,
  },
  {
    sectionId: 'file_handling',
    filename: 'file_handling.json',
    title: 'Files',
    topics: fileHandlingTopics,
  },
  {
    sectionId: 'modules_and_packages',
    filename: 'modules_and_packages.json',
    title: 'Modules and packages',
    topics: modulesTopics,
  },
  {
    sectionId: 'object_oriented',
    filename: 'object_oriented.json',
    title: 'Classes and objects',
    topics: oopTopics,
  },
  {
    sectionId: 'data_and_apis',
    filename: 'data_and_apis.json',
    title: 'Data and APIs',
    topics: dataApisTopics,
  },
  {
    sectionId: 'projects',
    filename: 'projects.json',
    title: 'Capstone quest',
    // Easiest first; planning your own project comes last.
    topics: topics(
      'hangman',
      'expense_tracker',
      'tic_tac_toe',
      'markdown_converter',
      'text_adventure',
      'capstone_planning',
    ),
  },
]
