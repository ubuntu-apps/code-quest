/**
 * Writes the R course (public/content/r): the shared steps, with the answer options of
 * multiple-choice questions shuffled, the "Works with other data too" test added
 * (protection.mjs), and the fields only the checker uses (`typedOk`, `check`) left out.
 */
import language from '../../src/features/languages/r/language.json' with { type: 'json' }
import { CourseGenerator } from '../course-kit/CourseGenerator.mjs'
import { RProtection } from './protection.mjs'

export class RCourseGenerator extends CourseGenerator {
  static SHUFFLE_CHOICES = true

  constructor(course) {
    super({ id: language.id, title: language.label, course, unit: 'stages', protection: new RProtection() })
  }

  buildQuestion(topic, { check: _check, ...question }, index) {
    return super.buildQuestion(topic, question, index)
  }
}
