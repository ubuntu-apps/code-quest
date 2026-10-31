/**
 * Generates the R course's JSON files (public/content/r) from data/.
 * Run: node scripts/r-curriculum/generate.mjs
 * Then check every answer in R: npm run check:r (or check-in-browser.mjs in the dev app).
 */
import { COURSE } from './data/course.mjs'
import { RCourseGenerator } from './generator.mjs'

await new RCourseGenerator(COURSE).run()
