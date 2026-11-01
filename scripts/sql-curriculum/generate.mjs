/**
 * Generates the SQL course's JSON files (public/content/sql) from data/. Its settings (each
 * lesson's database goes into its level) are in src/features/languages/sql/language.json.
 * Run: node scripts/sql-curriculum/generate.mjs
 * Then check them with real SQLite: npm run check:content -- --section sql/querying
 */
import language from '../../src/features/languages/sql/language.json' with { type: 'json' }
import { CourseGenerator } from '../course-kit/CourseGenerator.mjs'
import { COURSE } from './data/course.mjs'

await new CourseGenerator({ language, course: COURSE }).run()
