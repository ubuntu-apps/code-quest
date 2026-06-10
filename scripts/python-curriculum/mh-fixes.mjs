import { efmFixes } from './mh-fixes-partial-efm.mjs'
import { odFixes } from './mh-fixes-partial-od.mjs'
import { projectsMhFixes } from './mh-fixes-partial-projects.mjs'

/** @type {Record<string, Record<string, string | { validation: string, extra?: string }>>} */
export const MH_FIXES = {
  ...efmFixes,
  ...odFixes,
  ...projectsMhFixes,
}
