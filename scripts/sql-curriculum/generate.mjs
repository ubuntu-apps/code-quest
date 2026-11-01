/**
 * Generates the SQL course's JSON files (public/content/sql) from data/.
 * Run: node scripts/sql-curriculum/generate.mjs
 * Then check them with real SQLite: npm run check:content -- --section sql/querying
 */
import { COURSE } from './data/course.mjs'
import { SqlCourseGenerator } from './generator.mjs'

await new SqlCourseGenerator(COURSE).run()
