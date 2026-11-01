/**
 * Checks the R course in real R (webR), the same way the app runs it, in the dev app: the same
 * checks as `npm run check:content` (scripts/content-check), with the app's own R runtime.
 *
 *   1. npm run dev, and open the app.
 *   2. In the browser console:
 *        const { checkR } = await import('/code-quest/scripts/r-curriculum/check-in-browser.mjs')
 *        await checkR()            // or checkR('first_steps') for one quest
 *
 * globalThis.cqCheckProgress shows where a long check has got to.
 */
import { COURSE } from './data/course.mjs'
import { ContentChecker } from '../content-check/ContentChecker.mjs'
import { FetchContentSource } from '../content-check/ContentSource.mjs'
import { RChecker } from '../content-check/RChecker.mjs'
import { languagePack } from '../../src/features/languages/index.ts'

export async function checkR(sectionId) {
  let rChecker = null
  const webR = await languagePack('r').runtime()
  const checker = new ContentChecker({
    source: new FetchContentSource(import.meta.env?.BASE_URL ?? '/code-quest/'),
    checkers: {
      r: (spec) =>
        (rChecker = new RChecker(spec, webR, COURSE, (where) => {
          globalThis.cqCheckProgress = where
        })),
    },
    // Everything counts here, typed-in answers included.
    config: { strictTypedIn: ['r'] },
    allStrict: true,
    language: 'r',
    section: sectionId ? `r/${sectionId}` : null,
  })
  const report = await checker.run()
  const challenges = report.sections.reduce((n, s) => n + s.challenges, 0)
  const problems = report.problems.map((issue) => report.format(issue))
  const summary = `${challenges} challenges and ${rChecker?.checkedQuestions ?? 0} checked questions: ${problems.length ? `${problems.length} problem(s)` : 'all good'}`
  console.log(summary)
  for (const p of problems) console.warn(p)
  return { summary, problems }
}
