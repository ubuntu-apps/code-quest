/**
 * Writes the Python course (public/content/python). On top of the shared steps
 * (../course-kit/CourseGenerator.mjs) it adds:
 * - each section's side quests (data/section-projects.mjs);
 * - the quiz explanations (data/explanations/), one per question in order;
 * - the extra "other values" checks (protection.mjs);
 * - `--only <sectionId>` to write one section.
 */
import { readdir, unlink } from 'node:fs/promises'
import { resolve } from 'node:path'
import language from '../../src/features/languages/python/language.json' with { type: 'json' }
import { CourseGenerator } from '../course-kit/CourseGenerator.mjs'
import { sectionProjectsFor } from './data/section-projects.mjs'
import { EXPLANATIONS } from './data/explanations/index.mjs'
import { PythonProtection } from './protection.mjs'

/**
 * Sections that get their "Easy/Medium/Hard project" levels (data/section-projects.mjs).
 * Note: easy and medium projects must be completed to unlock the next section.
 */
const SECTIONS_WITH_PROJECTS = new Set(['fundamentals', 'control_flow', 'data_structures', 'functions', 'error_handling', 'file_handling', 'modules_and_packages', 'object_oriented', 'data_and_apis'])

export class PythonCourseGenerator extends CourseGenerator {
  /** Older lessons have no explanations yet. */
  static EXPLANATION_REQUIRED = false

  /**
   * @param {object[]} course data/course.mjs
   * @param {{ only?: string | null }} [options] Write just this section (the index lists them all).
   */
  constructor(course, { only = null } = {}) {
    super({ id: language.id, title: language.label, course, unit: 'topics', protection: new PythonProtection() })
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

  topicsOf(section) {
    const projects = SECTIONS_WITH_PROJECTS.has(section.sectionId) ? sectionProjectsFor(section.sectionId) : []
    return [...section.topics, ...projects]
  }

  buildLevel(topic) {
    // One explanation per quiz question, in order. A count that doesn't match means the
    // quiz changed, so the explanations must be updated too.
    const explanations = EXPLANATIONS[topic.id]
    if (explanations && explanations.length !== topic.questions.length) {
      throw new Error(`${topic.id}: ${explanations.length} quiz explanations for ${topic.questions.length} questions (data/explanations/)`)
    }
    return super.buildLevel(topic)
  }

  /** Explanations come from data/explanations/, and are optional. */
  buildQuestion(topic, question, index) {
    const explanation = EXPLANATIONS[topic.id]?.[index] ?? question.explanation
    return super.buildQuestion(topic, { ...question, explanation: explanation || undefined }, index)
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
