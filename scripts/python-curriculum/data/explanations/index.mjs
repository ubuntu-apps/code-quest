// Quiz explanations, by topic id. See any section file here for the format.
import fundamentals from './fundamentals.mjs'
import control_flow from './control_flow.mjs'
import data_structures from './data_structures.mjs'
import functions from './functions.mjs'
import error_handling from './error_handling.mjs'
import file_handling from './file_handling.mjs'
import modules_and_packages from './modules_and_packages.mjs'
import object_oriented from './object_oriented.mjs'
import data_and_apis from './data_and_apis.mjs'
import projects from './projects.mjs'

export const EXPLANATIONS = {
  ...fundamentals,
  ...control_flow,
  ...data_structures,
  ...functions,
  ...error_handling,
  ...file_handling,
  ...modules_and_packages,
  ...object_oriented,
  ...data_and_apis,
  ...projects,
}
