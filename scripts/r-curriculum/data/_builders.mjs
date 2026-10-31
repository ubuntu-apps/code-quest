/** What R stage files import. The builders themselves are in ../builders.mjs. */
import { RBuilders, rstr } from '../builders.mjs'

export const builders = new RBuilders()
export const {
  makeTopic, makeProject, snippet, mc, qShort, qPattern, code, output, task,
  near, isText, isTexts, isLogical, same, sameFrame, prints, uses, matches, avoids,
} = builders.exports()
export { rstr }

/** Tag for R code: backslashes stay exactly as written. */
export const r = String.raw

/** The R manual most stages point to. */
export const R_INTRO = (section, label) => ({
  label: label ?? 'An Introduction to R',
  url: `https://cran.r-project.org/doc/manuals/r-release/R-intro.html${section ? `#${section}` : ''}`,
  source: 'R manuals',
})
