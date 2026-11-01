/**
 * Writes a course's JSON files (public/content/<course>/) from its lesson data.
 *
 * Each course has a subclass in its folder (python-curriculum/generator.mjs and so on) that
 * says where the files go and overrides the steps it does differently; its generate.mjs is
 * one line: `await new SqlCourseGenerator(COURSE).run()`.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertUnique, challengeId, questionId } from '../curriculum-ids.mjs'
import { applyKeepProgress, previousChallenges, readPreviousSection } from '../progress-safety.mjs'
import { TypedInProtection } from './TypedInProtection.mjs'

export class CourseGenerator {
  /** The share of quiz answers needed to pass a lesson. */
  static PASSING_SCORE_PERCENT = 70

  /** Shuffle each multiple-choice question's options in a fixed order per prompt. */
  static SHUFFLE_CHOICES = false

  /** Every quiz question must say why its answer is right. */
  static EXPLANATION_REQUIRED = true

  /**
   * @param {object} options
   * @param {string} options.id Course id: the folder under public/content and the key of saved progress.
   * @param {string} options.title Course title in its index.json.
   * @param {object[]} options.course Sections in course order: `{ sectionId, title, filename, topics }`.
   * @param {string} [options.unit] What the log calls a lesson ("lessons", "stages").
   * @param {TypedInProtection} [options.protection] Adds the checks that catch typed-in answers.
   */
  constructor({ id, title, course, unit = 'lessons', protection = new TypedInProtection() }) {
    this.id = id
    this.protection = protection
    this.title = title
    this.course = course
    this.unit = unit
    this.outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../public/content', id)
  }

  /** Writes the sections, then the course's index.json. */
  async run() {
    await mkdir(this.outDir, { recursive: true })
    for (const section of this.sectionsToWrite()) await this.writeSection(section)
    await this.writeIndex()
    await this.afterWrite()
  }

  // ---- Steps a course can override ----

  /** The sections to write. Sections without lessons yet are listed as "Coming soon" instead. */
  sectionsToWrite() {
    return this.course.filter((section) => section.topics.length > 0)
  }

  /** The lessons of a section, ready for buildLevel(). */
  topicsOf(section) {
    return section.topics
  }

  levelKind(topic) {
    return topic.kind ?? 'topic'
  }

  /** The heading above the lesson text: its own `introTitle`, else the lesson's title. */
  introTitle(topic) {
    return topic.introTitle ?? topic.title
  }

  /**
   * A challenge as published: its permanent id (see ../curriculum-ids.mjs), then the course's
   * protection against typed-in answers (see TypedInProtection.mjs).
   */
  buildChallenge(topic, challenge) {
    return this.protection.protect({ id: challengeId(topic.id, challenge.title), ...challenge })
  }

  /** A quiz question as published, with its permanent id. */
  buildQuestion(topic, question, index) {
    if (this.constructor.EXPLANATION_REQUIRED && !question.explanation) throw new Error(`${topic.id} question ${index + 1} has no explanation`)
    const published = { id: questionId(topic.id, question.prompt), ...question }
    return this.constructor.SHUFFLE_CHOICES ? this.shuffleChoices(published) : published
  }

  /** Fields after the quiz that only some courses' lessons have (SQL's database). */
  levelExtras(_topic) {
    return {}
  }

  /** Fields after the sections in index.json. */
  indexExtras() {
    return { upcoming: this.course.filter((s) => s.topics.length === 0).map((s) => ({ id: s.sectionId, title: s.title })) }
  }

  /** The sections listed in index.json. */
  indexSections() {
    return this.sectionsToWrite()
  }

  async afterWrite() {}

  // ---- The shared steps ----

  buildLevel(topic) {
    // Permanent ids from the title or prompt (see ../curriculum-ids.mjs), so adding or
    // removing an item doesn't move learners' progress onto another one.
    const challenges = topic.challenges.map((c) => this.buildChallenge(topic, c))
    const questions = topic.questions.map((q, i) => this.buildQuestion(topic, q, i))
    assertUnique(topic.id, challenges.map((c) => c.id), 'challenges')
    assertUnique(topic.id, questions.map((q) => q.id), 'questions')
    return {
      id: topic.id,
      // Ids this lesson had before it was renamed; the app moves saved progress over.
      ...(topic.formerIds?.length ? { formerIds: topic.formerIds } : {}),
      title: topic.title,
      kind: this.levelKind(topic),
      projectDifficulty: topic.projectDifficulty,
      sandboxSnippets: topic.sandboxSnippets,
      intro: {
        title: this.introTitle(topic),
        bodyMarkdown: topic.paragraphs.join('\n\n'),
        sandboxCode: topic.sandboxCode,
        readMore: topic.readMore,
      },
      challenges,
      test: { passingScorePercent: this.constructor.PASSING_SCORE_PERCENT, questions },
      ...this.levelExtras(topic),
    }
  }

  buildSection(section) {
    return { sectionId: section.sectionId, title: section.title, levels: this.topicsOf(section).map((t) => this.buildLevel(t)) }
  }

  async writeSection(section) {
    const file = this.buildSection(section)
    const path = resolve(this.outDir, section.filename)
    // Compare with the version learners have, before it is replaced (see ../progress-safety.mjs).
    for (const id of applyKeepProgress(file, previousChallenges(readPreviousSection(path)))) {
      console.log(`  ${id}: checks changed, learners keep their progress (keepProgress)`)
    }
    await this.writeJson(path, file)
    console.log(`Wrote ${section.filename} (${file.levels.length} ${this.unit})`)
  }

  async writeIndex() {
    const index = {
      id: this.id,
      title: this.title,
      sections: this.indexSections().map((s) => ({ id: s.sectionId, title: s.title, path: s.filename })),
      ...this.indexExtras(),
    }
    await this.writeJson(resolve(this.outDir, 'index.json'), index)
    console.log('Wrote index.json')
  }

  async writeJson(path, value) {
    await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  }

  /**
   * Shuffles a multiple-choice question's options in a fixed order worked out from its
   * prompt, so the right answer isn't always in the same place, whatever order the data
   * file lists them in. The same prompt always gives the same order.
   */
  shuffleChoices(question) {
    if (question.type !== 'mcq') return question
    let state = seedOf(question.prompt)
    const random = () => {
      // mulberry32
      state = (state + 0x6d2b79f5) >>> 0
      let t = state
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
    const labels = question.choices.map((c) => c.label)
    const correct = labels[question.choices.findIndex((c) => c.id === question.correctChoiceId)]
    for (let i = labels.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1))
      ;[labels[i], labels[j]] = [labels[j], labels[i]]
    }
    const ids = 'abcdefgh'
    return { ...question, choices: labels.map((label, i) => ({ id: ids[i], label })), correctChoiceId: ids[labels.indexOf(correct)] }
  }
}

/** FNV-1a of a text, as a seed. */
function seedOf(text) {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}
