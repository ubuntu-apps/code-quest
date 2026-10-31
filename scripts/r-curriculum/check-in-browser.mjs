/**
 * Checks the R course in real R (webR), the same way the app runs it. There is no R on
 * the build machines, so this runs in the browser, in the dev app:
 *
 *   1. npm run dev, and open the app.
 *   2. In the browser console:
 *        const { checkR } = await import('/code-quest/scripts/r-curriculum/check-in-browser.mjs')
 *        await checkR()            // or checkR('first_steps') for one quest
 *
 * For every challenge, the solution must pass and the starter code must not. Every sandbox
 * sample must run without an error (unless its label says it shows one), and every gate
 * question with a `check` must give the output or error it claims.
 */
import { COURSE } from './data/course.mjs'
import { runRCode, runRChallengeTests } from '../../src/features/curriculum/rSandbox.ts'

/** A sample meant to show an error says so in a comment, such as `# Run it and read the error`. */
const showsError = (code) => /#.*\berror\b/i.test(code)

export async function checkR(sectionId) {
  const problems = []
  let challenges = 0
  let questions = 0
  const sections = COURSE.filter((s) => s.topics.length > 0 && (!sectionId || s.sectionId === sectionId))
  for (const section of sections) {
    for (const topic of section.topics) {
      const where = `${section.sectionId}/${topic.id}`
      const samples = [['sandbox', topic.sandboxCode], ...(topic.sandboxSnippets ?? []).map((s) => [s.label, s.code])]
      for (const [label, code] of samples) {
        const run = await runRCode(code)
        if (run.error && !showsError(code)) problems.push(`${where} sample "${label}": ${run.error.detail}`)
        else if (!run.error && showsError(code)) problems.push(`${where} sample "${label}" should show an error but runs`)
      }
      for (const c of topic.challenges) {
        challenges += 1
        // Shows where a long or stuck check has got to: globalThis.cqCheckProgress
        globalThis.cqCheckProgress = `${where} "${c.title}"`
        const tests = c.validation.tests
        const good = await runRChallengeTests(c.solution, c.validation.setupCode, tests)
        if (!good.passed) {
          const why = good.error ? good.error.detail : good.tests.filter((t) => !t.passed).map((t) => `${t.label}: ${t.detail}`).join('; ')
          problems.push(`${where} "${c.title}": the solution fails (${why}). Output: ${good.output}`)
        }
        const start = await runRChallengeTests(c.starterCode ?? '', c.validation.setupCode, tests)
        if (start.passed) problems.push(`${where} "${c.title}": the starter code already passes`)
      }
      for (const q of topic.questions) {
        if (!q.check) continue
        questions += 1
        const run = await runRCode(q.check.code)
        if (q.check.error !== undefined) {
          const message = run.error?.detail ?? ''
          if (!message.includes(q.check.error)) {
            problems.push(`${where} question "${q.prompt}": expected an error with "${q.check.error}", got ${run.error ? `"${message}"` : `output "${run.output}"`}`)
          }
        } else if (run.error) {
          problems.push(`${where} question "${q.prompt}": error ${run.error.detail}`)
        } else if (run.output.trim() !== q.check.output) {
          problems.push(`${where} question "${q.prompt}": expected "${q.check.output}", got "${run.output.trim()}"`)
        }
      }
    }
  }
  const summary = `${challenges} challenges and ${questions} checked questions: ${problems.length ? `${problems.length} problem(s)` : 'all good'}`
  console.log(summary)
  for (const p of problems) console.warn(p)
  return { summary, problems }
}
