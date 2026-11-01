/**
 * Generates the R course's JSON files (public/content/r) from data/: with the answer options of
 * multiple-choice questions shuffled and the questions' `check` (only the checker uses it) left
 * out, as set in src/features/languages/r/language.json, and the "Works with other data too"
 * test added (protection.mjs).
 * Run: node scripts/r-curriculum/generate.mjs
 * Then check every answer in R: npm run check:r (or check-in-browser.mjs in the dev app).
 */
import language from '../../src/features/languages/r/language.json' with { type: 'json' }
import { CourseGenerator } from '../course-kit/CourseGenerator.mjs'
import { COURSE } from './data/course.mjs'
import { RProtection } from './protection.mjs'

await new CourseGenerator({ language, course: COURSE, protection: new RProtection() }).run()
