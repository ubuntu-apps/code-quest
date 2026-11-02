/**
 * Makes sure the course JSON in public/content matches its data files: runs every course's
 * generator, then fails if that changed anything. The app only ever reads the JSON, so a data
 * file edited without regenerating would never reach learners.
 *
 *   npm run check:generated     (npm run check, and so CI, runs this too)
 *
 * To fix a failure, regenerate the course it names and commit the JSON:
 *   node scripts/<course>-curriculum/generate.mjs
 */
import { execFileSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trimEnd()

try {
  git('rev-parse', '--is-inside-work-tree')
} catch {
  console.log('Not a git checkout: skipping the check that the course JSON is up to date.')
  process.exit(0)
}

// Changes already in the folder are the author's own; only what the generators change counts.
const before = git('status', '--porcelain', '--', 'public/content')

const generators = readdirSync(resolve(root, 'scripts'))
  .filter((name) => name.endsWith('-curriculum'))
  .map((name) => `scripts/${name}/generate.mjs`)
for (const generator of generators) {
  try {
    execFileSync(process.execPath, [generator], { cwd: root, stdio: 'pipe' })
  } catch (error) {
    console.error(`${generator} failed:\n${error.stderr?.toString() || error.message}`)
    process.exit(1)
  }
}

const after = git('status', '--porcelain', '--', 'public/content')
if (after !== before) {
  const changed = after
    .split('\n')
    .filter((line) => line && !before.split('\n').includes(line))
    .map((line) => `  ${line.slice(3)}`)
  console.error(
    [
      'The course JSON is out of date with its data files. Regenerating changed:',
      ...changed,
      '',
      'Regenerate (node scripts/<course>-curriculum/generate.mjs) and commit public/content.',
    ].join('\n'),
  )
  process.exit(1)
}
console.log(`Course JSON is up to date (${generators.length} courses regenerated, nothing changed).`)
