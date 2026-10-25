/**
 * Generates the SQL course's JSON files (public/content/sql) from data/.
 * Run: node scripts/sql-curriculum/generate.mjs
 * Then check them with real SQLite: node scripts/check-curriculum.mjs --section sql/querying
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { COURSE } from './data/course.mjs'
import { assertUnique, challengeId, questionId } from '../curriculum-ids.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, '../../public/content/sql')

/** The items, after checking that no two share an id. */
function unique(levelId, what, items) {
  assertUnique(levelId, items.map((item) => item.id), what)
  return items
}

function buildLevel(topic) {
  return {
    id: topic.id,
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
    // Permanent ids from the title or prompt (see ../curriculum-ids.mjs), so adding or
    // removing an item doesn't move learners' progress onto another one.
    challenges: unique(
      topic.id,
      'challenges',
      topic.challenges.map((c) => {
        return { id: challengeId(topic.id, c.title), ...c }
      }),
    ),
    test: {
      passingScorePercent: 70,
      questions: unique(
        topic.id,
        'questions',
        topic.questions.map((q, i) => {
          if (!q.explanation) throw new Error(`${topic.id} question ${i + 1} has no explanation`)
          return { id: questionId(topic.id, q.prompt), ...q }
        }),
      ),
    },
    database: topic.database,
  }
}

await mkdir(outDir, { recursive: true })
const written = COURSE.filter((section) => section.topics.length > 0)
for (const section of written) {
  const file = { sectionId: section.sectionId, title: section.title, levels: section.topics.map(buildLevel) }
  await writeFile(resolve(outDir, section.filename), `${JSON.stringify(file, null, 2)}\n`, 'utf8')
  console.log(`Wrote ${section.filename} (${file.levels.length} lessons)`)
}

const index = {
  id: 'sql',
  title: 'SQL',
  sections: written.map((s) => ({ id: s.sectionId, title: s.title, path: s.filename })),
  // Sections without lessons yet are listed as "Coming soon".
  upcoming: COURSE.filter((s) => s.topics.length === 0).map((s) => ({ id: s.sectionId, title: s.title })),
}
await writeFile(resolve(outDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf8')
console.log('Wrote index.json')
