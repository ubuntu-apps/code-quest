/**
 * Checks the R course in Node, with the same checks as the dev app's console check
 * (check-core.mjs) and the app's own test harness (src/features/curriculum/rHarness.ts).
 * CI runs it; webR isn't one of the app's dependencies (the app loads it from a CDN), so
 * install it first, at the version in src/runtimeVersions.ts:
 *
 *   npm install --no-save webr@0.4.2
 *   npm run check:r                 # or: node scripts/r-curriculum/check-node.mjs cleaning
 *
 * Exits with code 1 when there are problems.
 */
import { COURSE } from './data/course.mjs'
import { createChecker } from './check-core.mjs'
import { CLEAR_GLOBALS, challengeWrapper, parseChallengeOutput } from '../../src/features/curriculum/rHarness.ts'

let WebR
try {
  ;({ WebR } = await import('webr'))
} catch {
  console.error('webR is not installed. Run: npm install --no-save webr@0.4.2')
  process.exit(2)
}

const webR = new WebR()
await webR.init()

async function conditionText(data) {
  if (typeof data === 'string') return data
  try {
    return await (await data.get('message')).toString()
  } catch {
    return ''
  }
}

/** Runs R code and gives what it printed (with warnings and messages) or its error. */
async function capture(code, options = {}) {
  const shelter = await new webR.Shelter()
  try {
    const { output } = await shelter.captureR(code, { captureStreams: true, captureConditions: true, ...options })
    const errors = output.filter((o) => o.type === 'error').map((o) => String(o.data ?? ''))
    if (errors.length) return { output: '', error: { detail: errors.join('\n') } }
    const lines = []
    for (const item of output) {
      if (item.type === 'stdout') lines.push(String(item.data ?? ''))
      else if (item.type === 'warning') lines.push(`Warning: ${(await conditionText(item.data)).trim()}`)
      else if (item.type === 'message') lines.push((await conditionText(item.data)).replace(/\n$/, ''))
    }
    return { output: lines.join('\n'), error: null }
  } catch (error) {
    return { output: '', error: { detail: error instanceof Error ? error.message : String(error) } }
  } finally {
    shelter.purge()
  }
}

async function runRCode(source) {
  await capture(CLEAR_GLOBALS)
  return capture(source, { withAutoprint: true })
}

async function runRChallengeTests(code, setup, tests) {
  const result = await capture(challengeWrapper(code, setup, tests))
  if (result.error) return { passed: false, tests: [], error: result.error, output: '' }
  return { ...parseChallengeOutput(result.output, tests), error: null }
}

const checkCourse = createChecker({ runRCode, runRChallengeTests })
const { summary, problems } = await checkCourse(COURSE, process.argv[2])
console.log(summary)
for (const p of problems) console.log(`  ${p}`)
webR.close()
process.exit(problems.length ? 1 : 0)
