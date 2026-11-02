/**
 * Writes the Python course (public/content/python). On top of the shared steps
 * (../course-kit/CourseGenerator.mjs) it adds `--only <sectionId>` to write one section,
 * lists every section in the index (even without lessons yet), and removes files from the
 * old naming. Its side quests are each section's `projects` (data/course.mjs), and its
 * "other values" checks are in protection.mjs.
 */
import { readdir, unlink } from 'node:fs/promises'
import { resolve } from 'node:path'
import language from '../../src/features/languages/python/language.json' with { type: 'json' }
import { CourseGenerator } from '../course-kit/CourseGenerator.mjs'
import { PythonProtection } from './protection.mjs'

export class PythonCourseGenerator extends CourseGenerator {
  /**
   * @param {object[]} course data/course.mjs
   * @param {{ only?: string | null }} [options] Write just this section (the index lists them all).
   */
  constructor(course, { only = null } = {}) {
    // language.json's `course`: lessons are called "topics".
    super({ language, course, protection: new PythonProtection() })
    if (only && !course.some((s) => s.sectionId === only)) {
      throw new Error(`Unknown section "${only}". Known: ${course.map((s) => s.sectionId).join(', ')}`)
    }
    this.only = only
  }

  /** Every section is listed, even without lessons. */
  indexSections() {
    return this.course
  }

  sectionsToWrite() {
    return this.course.filter((s) => !this.only || s.sectionId === this.only)
  }

  indexExtras() {
    return {}
  }

  /** Removes section files from the old naming (`section_1.json`). */
  async afterWrite() {
    for (const name of await readdir(this.outDir)) {
      if (/^section_[a-z0-9]+\.json$/.test(name)) {
        await unlink(resolve(this.outDir, name))
        console.log(`Removed ${name}`)
      }
    }
    console.log('Done.')
  }
}
