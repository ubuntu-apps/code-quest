import { fixes as errorFixes } from './expert-fixes-partial-error.mjs'
import { moduleFixes, oopFixes } from './expert-fixes-partial-modules-oop.mjs'
import { dataApiFixes, fileFixes } from './expert-fixes-partial-data-file.mjs'
import { projectFixes, functionsFixes } from './expert-fixes-partial-projects.mjs'

/** @type {Record<string, Record<string, string>>} */
export const EXPERT_FIXES = {
  'error-handling.mjs': errorFixes,
  'modules.mjs': moduleFixes,
  'oop.mjs': oopFixes,
  'data-apis.mjs': dataApiFixes,
  'file-handling.mjs': fileFixes,
  'projects.mjs': projectFixes,
  'functions.mjs': functionsFixes,
}
