/**
 * Generates R curriculum section JSON files.
 * Run: node scripts/r-curriculum/generate.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSection } from './helpers.mjs'
import { sections } from './curriculum.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, '../../public/content/r')

await mkdir(outDir, { recursive: true })

let totalTopics = 0

for (const section of sections) {
  const file = buildSection(section)
  totalTopics += file.levels.length
  const path = resolve(outDir, section.filename)
  await writeFile(path, `${JSON.stringify(file, null, 2)}\n`, 'utf8')
  console.log(`Wrote ${section.filename} (${file.levels.length} topics)`)
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
console.log(`Wrote index.json (${sections.length} sections, ${totalTopics} topics total)`)
console.log('Done.')
