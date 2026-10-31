/**
 * Generates the R course's JSON files (public/content/r) from data/.
 * Run: node scripts/r-curriculum/generate.mjs
 * Then check every answer in R, in the dev app's console (see check-in-browser.mjs).
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { COURSE } from './data/course.mjs'
import { assertUnique, challengeId, questionId } from '../curriculum-ids.mjs'
import { applyKeepProgress, previousChallenges, readPreviousSection } from '../progress-safety.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, '../../public/content/r')

/** FNV-1a of a text, as a seed. */
function seedOf(text) {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/**
 * Shuffles a multiple-choice question's options in a fixed order worked out from its
 * prompt, so the right answer isn't always in the same place, whatever order the data
 * file lists them in. The same prompt always gives the same order.
 */
function shuffleChoices(question) {
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
  return {
    ...question,
    choices: labels.map((label, i) => ({ id: ids[i], label })),
    correctChoiceId: ids[labels.indexOf(correct)],
  }
}

/** The items, after checking that no two share an id. */
function unique(levelId, what, items) {
  assertUnique(levelId, items.map((item) => item.id), what)
  return items
}

function buildLevel(topic) {
  return {
    id: topic.id,
    // Ids this stage had before it was renamed; the app moves saved progress over.
    ...(topic.formerIds?.length ? { formerIds: topic.formerIds } : {}),
    title: topic.title,
    kind: topic.kind,
    projectDifficulty: topic.projectDifficulty,
    sandboxSnippets: topic.sandboxSnippets,
    intro: {
      title: topic.title,
      bodyMarkdown: topic.paragraphs.join('\n\n'),
      sandboxCode: topic.sandboxCode,
      readMore: topic.readMore,
    },
    // Permanent ids from the title or prompt (see ../curriculum-ids.mjs).
    challenges: unique(
      topic.id,
      'challenges',
      // `typedOk` is for check-in-browser.mjs only.
      topic.challenges.map(({ typedOk: _typedOk, ...c }) => ({ id: challengeId(topic.id, c.title), ...c })),
    ),
    test: {
      passingScorePercent: 70,
      questions: unique(
        topic.id,
        'questions',
        topic.questions.map((q, i) => {
          if (!q.explanation) throw new Error(`${topic.id} question ${i + 1} has no explanation`)
          // `check` is for check-in-browser.mjs only.
          const { check: _check, ...question } = q
          return { id: questionId(topic.id, q.prompt), ...shuffleChoices(question) }
        }),
      ),
    },
  }
}

await mkdir(outDir, { recursive: true })
const written = COURSE.filter((section) => section.topics.length > 0)
for (const section of written) {
  const file = { sectionId: section.sectionId, title: section.title, levels: section.topics.map(buildLevel) }
  const path = resolve(outDir, section.filename)
  // Compare with the version learners have, before it is replaced (see ../progress-safety.mjs).
  for (const id of applyKeepProgress(file, previousChallenges(readPreviousSection(path)))) {
    console.log(`  ${id}: checks changed, learners keep their progress (keepProgress)`)
  }
  await writeFile(path, `${JSON.stringify(file, null, 2)}\n`, 'utf8')
  console.log(`Wrote ${section.filename} (${file.levels.length} stages)`)
}

const index = {
  id: 'r',
  title: 'R',
  sections: written.map((s) => ({ id: s.sectionId, title: s.title, path: s.filename })),
  // Quests without stages yet are listed as "Coming soon".
  upcoming: COURSE.filter((s) => s.topics.length === 0).map((s) => ({ id: s.sectionId, title: s.title })),
}
await writeFile(resolve(outDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf8')
console.log('Wrote index.json')
