/**
 * Checks the R course in real R (webR), the same way the app runs it, in the dev app:
 *
 *   1. npm run dev, and open the app.
 *   2. In the browser console:
 *        const { checkR } = await import('/code-quest/scripts/r-curriculum/check-in-browser.mjs')
 *        await checkR()            // or checkR('first_steps') for one quest
 *
 * The checks are in check-core.mjs; CI runs the same ones in Node (check-node.mjs).
 * globalThis.cqCheckProgress shows where a long check has got to.
 */
import { COURSE } from './data/course.mjs'
import { createChecker } from './check-core.mjs'
import { runRCode, runRChallengeTests } from '../../src/features/curriculum/rSandbox.ts'

const checkCourse = createChecker({ runRCode, runRChallengeTests })

export async function checkR(sectionId) {
  const result = await checkCourse(COURSE, sectionId, (where) => {
    globalThis.cqCheckProgress = where
  })
  console.log(result.summary)
  for (const p of result.problems) console.warn(p)
  return result
}
