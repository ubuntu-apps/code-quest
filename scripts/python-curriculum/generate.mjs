/**
 * Generates Python curriculum section JSON files.
 * Run: node scripts/python-curriculum/generate.mjs
 */
import { readdir, unlink, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildLevel, buildSection, challenge, mcq, shortText } from './helpers.mjs'
import { fundamentalsTopics } from './data/fundamentals.mjs'
import { controlFlowTopics } from './data/control-flow.mjs'
import { dataStructuresTopics } from './data/data-structures.mjs'
import { functionsTopics } from './data/functions.mjs'
import { modulesTopics } from './data/modules.mjs'
import { fileHandlingTopics } from './data/file-handling.mjs'
import { errorHandlingTopics } from './data/error-handling.mjs'
import { oopTopics } from './data/oop.mjs'
import { dataApisTopics } from './data/data-apis.mjs'
import { projectsTopics } from './data/projects.mjs'
import { sectionProjectsFor } from './data/section-projects.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, '../../public/content/python')

const SECTIONS = [
  { sectionId: 'fundamentals', filename: 'fundamentals.json', title: 'Fundamentals', topics: fundamentalsTopics },
  { sectionId: 'control_flow', filename: 'control_flow.json', title: 'Control Flow', topics: controlFlowTopics },
  { sectionId: 'data_structures', filename: 'data_structures.json', title: 'Data Structures', topics: dataStructuresTopics },
  { sectionId: 'functions', filename: 'functions.json', title: 'Functions', topics: functionsTopics },
  { sectionId: 'modules_and_packages', filename: 'modules_and_packages.json', title: 'Modules and Packages', topics: modulesTopics },
  { sectionId: 'file_handling', filename: 'file_handling.json', title: 'File Handling', topics: fileHandlingTopics },
  { sectionId: 'error_handling', filename: 'error_handling.json', title: 'Error Handling', topics: errorHandlingTopics },
  { sectionId: 'object_oriented', filename: 'object_oriented.json', title: 'Object Oriented', topics: oopTopics },
  { sectionId: 'data_and_apis', filename: 'data_and_apis.json', title: 'Data and APIs', topics: dataApisTopics },
  { sectionId: 'projects', filename: 'projects.json', title: 'Projects', topics: projectsTopics },
]

function finalizeTopic(topic) {
  return {
    ...topic,
    challenges: topic.challengeSpecs.map(challenge),
    questions: topic.questionSpecs.map((q) =>
      q.type === 'mcq' ? mcq(q.prompt, q.choices, q.correct) : shortText(q.prompt, q.expected),
    ),
  }
}

for (const section of SECTIONS) {
  const sectionProjects = section.sectionId === 'projects' ? [] : sectionProjectsFor(section.sectionId)
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
