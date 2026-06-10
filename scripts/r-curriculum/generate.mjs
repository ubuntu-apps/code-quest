/**
 * Generates R curriculum section JSON files.
 * Run: node scripts/r-curriculum/generate.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSection, finalizeTopic } from './helpers.mjs'
import { sections } from './curriculum.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, '../../public/content/r')

await mkdir(outDir, { recursive: true })

let totalTopics = 0
let totalChallenges = 0

for (const section of sections) {
  const file = buildSection({
    ...section,
    topics: section.topics.map((topic) => finalizeTopic(topic, section.sectionId)),
  })
  totalTopics += file.levels.length
  totalChallenges += file.levels.reduce((sum, level) => sum + level.challenges.length, 0)
  const path = resolve(outDir, section.filename)
  await writeFile(path, `${JSON.stringify(file, null, 2)}\n`, 'utf8')
  console.log(`Wrote ${section.filename} (${file.levels.length} topics, ${file.levels[0]?.challenges.length ?? 0} challenges each)`)
}

const languageIndex = {
  id: 'r',
  title: 'R',
  sections: sections.map((section) => ({
    id: section.sectionId,
    title: section.title,
    path: section.filename,
  })),
}

await writeFile(resolve(outDir, 'index.json'), `${JSON.stringify(languageIndex, null, 2)}\n`, 'utf8')
console.log(`Wrote index.json (${sections.length} sections, ${totalTopics} topics, ${totalChallenges} challenges total)`)
console.log('Done.')
