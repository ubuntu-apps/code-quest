/** Writes the SQL course (public/content/sql): the shared steps, plus each lesson's database. */
import language from '../../src/features/languages/sql/language.json' with { type: 'json' }
import { CourseGenerator } from '../course-kit/CourseGenerator.mjs'

export class SqlCourseGenerator extends CourseGenerator {
  constructor(course) {
    super({ id: language.id, title: language.label, course, unit: 'lessons' })
  }

  /** The tables the lesson's queries run on: `{ setupSql, altSetupSql, tables }`. */
  levelExtras(topic) {
    return { database: topic.database }
  }
}
