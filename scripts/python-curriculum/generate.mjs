/**
 * Generates the Python course's JSON files (public/content/python) from data/.
 * Run: node scripts/python-curriculum/generate.mjs [--only <sectionId>]
 *
 * --only data_and_apis   regenerate just that section (other JSON files are left alone)
 */
import { COURSE } from './data/course.mjs'
import { PythonCourseGenerator } from './generator.mjs'

const args = process.argv.slice(2)
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null
await new PythonCourseGenerator(COURSE, { only }).run()
