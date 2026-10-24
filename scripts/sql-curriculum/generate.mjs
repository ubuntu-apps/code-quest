/**
 * Generates the SQL course's JSON files (public/content/sql) from data/.
 * Run: node scripts/sql-curriculum/generate.mjs
 * Then check them with real SQLite: node scripts/check-curriculum.mjs --section sql/querying
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { COURSE } from './data/course.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, '../../public/content/sql')

function buildLevel(topic) {
  const challengeIds = new Set()
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
    // Stable ids (topic + position) so regenerating keeps learners' saved progress.
    challenges: topic.challenges.map((c, i) => {
      const id = `${topic.id}_ch${i + 1}`
      challengeIds.add(id)
      return { id, ...c }
    }),
    test: {
      passingScorePercent: 70,
      questions: topic.questions.map((q, i) => {
        if (!q.explanation) throw new Error(`${topic.id} question ${i + 1} has no explanation`)
        return { id: `${topic.id}_q${i + 1}`, ...q }
      }),
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
