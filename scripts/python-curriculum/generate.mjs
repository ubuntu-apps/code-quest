/**
 * Generates Python curriculum section JSON files.
 * Run: node scripts/python-curriculum/generate.mjs [--only <sectionId>]
 *
 * --only data_and_apis   regenerate just that section (other JSON files are left alone)
 */
import { readdir, unlink, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildLevel, buildSection, challenge, mcq, shortText } from './helpers.mjs'
import { COURSE } from './data/course.mjs'
import { sectionProjectsFor } from './data/section-projects.mjs'

/**
 * Sections that get their "Easy/Medium/Hard project" levels (data/section-projects.mjs).
 * Matches what is live today. The others copy from the Projects section, which still
 * needs rewriting; add a section here once its projects are ready.
 * Note: easy and medium projects must be completed to unlock the next section.
 */
const SECTIONS_WITH_PROJECTS = new Set(['fundamentals', 'control_flow', 'data_structures', 'functions', 'error_handling', 'file_handling', 'modules_and_packages'])

const args = process.argv.slice(2)
const onlySection = args.includes('--only') ? args[args.indexOf('--only') + 1] : null

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, '../../public/content/python')

/** Sections in course order, with their topics (see data/course.mjs). */
const SECTIONS = COURSE

function finalizeTopic(topic) {
  return {
    ...topic,
    challenges: topic.challengeSpecs.map(challenge),
    questions: topic.questionSpecs.map((q) =>
      q.type === 'mcq' ? mcq(q.prompt, q.choices, q.correct) : shortText(q.prompt, q.expected),
    ),
  }
}

if (onlySection && !SECTIONS.some((s) => s.sectionId === onlySection)) {
  throw new Error(`Unknown section "${onlySection}". Known: ${SECTIONS.map((s) => s.sectionId).join(', ')}`)
}

for (const section of SECTIONS) {
  if (onlySection && section.sectionId !== onlySection) continue
  const sectionProjects =
    SECTIONS_WITH_PROJECTS.has(section.sectionId) ? sectionProjectsFor(section.sectionId) : []
  const file = buildSection({
    ...section,
    topics: [...section.topics, ...sectionProjects].map(finalizeTopic),
  })
  const path = resolve(outDir, section.filename)
  await writeFile(path, `${JSON.stringify(file, null, 2)}\n`, 'utf8')
  console.log(`Wrote ${section.filename} (${file.levels.length} topics)`)
}

const languageIndex = {
  id: 'python',
  title: 'Python',
  sections: SECTIONS.map((section) => ({
    id: section.sectionId,
    title: section.title,
    path: section.filename,
  })),
}
await writeFile(resolve(outDir, 'index.json'), `${JSON.stringify(languageIndex, null, 2)}\n`, 'utf8')
console.log('Wrote index.json')

for (const name of await readdir(outDir)) {
  if (/^section_[a-z0-9]+\.json$/.test(name)) {
    await unlink(resolve(outDir, name))
    console.log(`Removed ${name}`)
  }
}

console.log('Done.')
