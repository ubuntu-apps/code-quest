/**
 * Writes the R course (public/content/r): the shared steps, with the answer options of
 * multiple-choice questions shuffled, and the fields only the checker uses (`typedOk`,
 * `check`) left out.
 */
import language from '../../src/features/languages/r/language.json' with { type: 'json' }
import { CourseGenerator } from '../course-kit/CourseGenerator.mjs'

export class RCourseGenerator extends CourseGenerator {
  static SHUFFLE_CHOICES = true

  constructor(course) {
    super({ id: language.id, title: language.label, course, unit: 'stages' })
  }

  buildChallenge(topic, { typedOk: _typedOk, ...challenge }) {
    return super.buildChallenge(topic, challenge)
  }

  buildQuestion(topic, { check: _check, ...question }, index) {
    return super.buildQuestion(topic, question, index)
  }
}
