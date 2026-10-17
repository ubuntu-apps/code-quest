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
import collectionsModule from './data-structures/collections-data.mjs'
import { functionsTopics } from './functions.mjs'
import { errorHandlingTopics } from './error-handling.mjs'
import { fileHandlingTopics } from './file-handling.mjs'
import pathlibTopic from './file-handling/pathlib-data.mjs'
import { modulesTopics } from './modules.mjs'
import { oopTopics } from './oop.mjs'
import { dataApisTopics } from './data-apis.mjs'
import { projectsTopics } from './projects.mjs'

const allTopics = new Map(
  [
    ...fundamentalsTopics,
    ...controlFlowTopics,
    ...dataStructuresTopics,
    collectionsModule,
    ...functionsTopics,
    ...errorHandlingTopics,
    ...fileHandlingTopics,
    pathlibTopic,
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
    topics: topics(
      'comparison_operators',
      'boolean_logic',
      'if_elif_else',
      'match_case',
      'while_loops',
      'for_loops',
      'range_function',
      'break_continue',
      'nested_loops',
      'loop_patterns',
    ),
  },
  {
    sectionId: 'data_structures',
    filename: 'data_structures.json',
    title: 'Data structures',
    topics: topics(
      'lists',
      'slicing_indexing',
      'tuples',
      'dictionaries',
      'sets',
      'iterating_collections',
      'list_comprehensions',
      'dict_set_comprehensions',
      'nested_structures',
      'collections_data',
      'choosing_structures',
    ),
  },
  {
    sectionId: 'functions',
    filename: 'functions.json',
    title: 'Functions',
    topics: topics(
      'defining_functions',
      'parameters_arguments',
      'return_values',
      'default_parameters',
      'keyword_arguments',
      'scope_globals',
      'docstrings_hints',
      'lambda_functions',
      'args_kwargs',
      'recursion',
    ),
  },
  {
    sectionId: 'error_handling',
    filename: 'error_handling.json',
    title: 'Errors and exceptions',
    topics: topics(
      'try_except',
      'multiple_except',
      'else_finally',
      'exception_hierarchy',
      'raising_exceptions',
      'custom_exceptions',
      'assertions',
      'defensive_programming',
      'debugging',
      'logging_basics',
    ),
  },
  {
    sectionId: 'file_handling',
    filename: 'file_handling.json',
    title: 'Files',
    topics: topics(
      'opening_files',
      'with_statement',
      'reading_files',
      'writing_files',
      'appending',
      'file_paths',
      'pathlib_data',
      'text_vs_binary',
      'file_errors',
    ),
  },
  {
    sectionId: 'modules_and_packages',
    filename: 'modules_and_packages.json',
    title: 'Modules and packages',
    topics: topics(
      'import_statements',
      'stdlib_overview',
      'random_module',
      'creating_modules',
      'name_main',
      'packages',
      'pip_venv',
      'organizing_projects',
    ),
  },
  {
    sectionId: 'object_oriented',
    filename: 'object_oriented.json',
    title: 'Classes and objects',
    topics: topics(
      'classes_basics',
      'methods',
      'encapsulation',
      'properties',
      'dunder_methods',
      'inheritance',
      'polymorphism',
      'dataclasses',
      'special_methods_adv',
      'oop_design',
    ),
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
    title: 'Capstone projects',
    // Easiest first. The unit converter is left out: Fundamentals has its own.
    topics: topics(
      'password_generator',
      'cli_guess_game',
      'quiz_app',
      'todo_list',
      'contact_book',
      'expense_tracker',
      'weather_cli',
      'web_scraper_basics',
      'capstone_planning',
    ),
  },
]
