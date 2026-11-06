/**
 * Generates the JavaScript course's JSON files (public/content/javascript) from data/: with the
 * answer options of multiple-choice questions shuffled and the questions' `check` (only the
 * checker uses it) left out, as set in src/features/languages/javascript/language.json.
 * Run: node scripts/javascript-curriculum/generate.mjs
 * Then check every answer: npm run check:content -- --language javascript
 */
import language from '../../src/features/languages/javascript/language.json' with { type: 'json' }
import { CourseGenerator } from '../course-kit/CourseGenerator.mjs'
import { COURSE } from './data/course.mjs'
import { JavaScriptProtection } from './protection.mjs'

await new CourseGenerator({ language, course: COURSE, protection: new JavaScriptProtection() }).run()
