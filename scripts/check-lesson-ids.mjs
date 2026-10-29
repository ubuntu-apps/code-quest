/**
 * Makes sure no published lesson id disappears.
 *
 * Learners' progress is saved under the course id and the lesson id
 * (`codequest:progress:python:first_program`), and challenge and question ids start
 * with the lesson id. Renaming a lesson without telling the app would silently lose
 * everything learners did in it, including passed quizzes. lesson-ids.json lists every
 * lesson id that has ever been published; this check fails when one of them is no longer
 * a lesson and isn't in some lesson's `formerIds` either.
 *
 *   node scripts/check-lesson-ids.mjs            check (CI runs this through npm run check)
 *   node scripts/check-lesson-ids.mjs --update   add new lesson ids to lesson-ids.json
 *
 * To rename a lesson: change its `id` in the data file and add the old one to its
 * `formerIds`, e.g. `formerIds: ['hello']`, then regenerate. The app moves learners'
 * progress over (src/features/curriculum/levelRenames.ts). Never remove an id from
 * lesson-ids.json.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const contentDir = resolve(here, '../public/content')
const registryPath = resolve(here, 'lesson-ids.json')
const update = process.argv.includes('--update')

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))

/** Each course's lessons: current ids, and former id → current id. */
function readCourses() {
  const courses = new Map()
  for (const lang of readJson(resolve(contentDir, 'index.json')).languages) {
    const langDir = dirname(resolve(contentDir, lang.path))
    const index = readJson(resolve(contentDir, lang.path))
    const current = new Set()
    const former = new Map()
    const problems = []
    for (const section of index.sections) {
      for (const level of readJson(resolve(langDir, section.path)).levels) {
        if (current.has(level.id)) problems.push(`two lessons use the id "${level.id}"`)
        current.add(level.id)
        for (const oldId of level.formerIds ?? []) {
          if (former.has(oldId)) problems.push(`"${oldId}" is a former id of both "${former.get(oldId)}" and "${level.id}"`)
          former.set(oldId, level.id)
        }
      }
    }
    for (const [oldId, newId] of former) {
      if (current.has(oldId)) problems.push(`"${oldId}" is a former id of "${newId}" but is also a lesson's current id`)
    }
    courses.set(lang.id, { current, former, problems })
  }
  return courses
}

const courses = readCourses()
const registry = readJson(registryPath)
const errors = []
const added = []

for (const [courseId, published] of Object.entries(registry.courses)) {
  const course = courses.get(courseId)
  if (!course) {
    errors.push(
      `Course "${courseId}" is no longer in public/content/index.json. Progress is saved under the course id, so renaming or removing a course loses learners' progress.`,
    )
    continue
  }
  for (const problem of course.problems) errors.push(`${courseId}: ${problem}`)
  for (const id of published) {
    if (course.current.has(id) || course.former.has(id)) continue
    errors.push(
      `${courseId}: the published lesson "${id}" is gone. If it was renamed, add formerIds: ['${id}'] to the renamed lesson and regenerate, so learners keep their progress.`,
    )
  }
}

for (const [courseId, course] of courses) {
  const published = new Set(registry.courses[courseId] ?? [])
  const fresh = [...course.current].filter((id) => !published.has(id))
  if (fresh.length === 0) continue
  if (update) {
    registry.courses[courseId] = [...(registry.courses[courseId] ?? []), ...fresh]
    added.push(...fresh.map((id) => `${courseId}/${id}`))
  } else {
    errors.push(
      `${courseId}: new lessons not yet in scripts/lesson-ids.json: ${fresh.join(', ')}. Run "npm run lesson-ids:update" and commit the file.`,
    )
  }
}

if (update && added.length > 0) {
  writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`, 'utf8')
  console.log(`Added ${added.length} lesson id(s) to scripts/lesson-ids.json: ${added.join(', ')}`)
}

if (errors.length > 0) {
  console.error('Lesson id check failed:\n')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}
const total = Object.values(registry.courses).reduce((sum, ids) => sum + ids.length, 0)
console.log(`Lesson ids OK: ${total} published lessons in ${Object.keys(registry.courses).length} courses are all still reachable.`)
