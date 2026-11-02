/**
 * Keeps learners' saved progress safe when the generated course content changes.
 * Shared by the Python, SQL and R generators. See also check-lesson-ids.mjs.
 *
 * Saved progress for a challenge carries a fingerprint of the challenge (its title and
 * checks; see src/features/curriculum/progress/progressFingerprint.ts). When the checks change, the
 * app drops the learner's solved mark, because the exercise may have changed. When the
 * change is only a fix (a typo in an expected value, a test that was too strict), add
 * `keepProgress: true` to the challenge in the data file. The generator then compares the
 * new challenge with the one in the JSON it is about to replace and, if the checks changed,
 * lists the old fingerprint in `acceptedFingerprints`, so learners keep their progress.
 * Accepted fingerprints are carried forward from the previous JSON every time, so the flag
 * can be removed again after the release.
 */
import { existsSync, readFileSync } from 'node:fs'

/**
 * The challenge's checks as the app sees them: the app reads content through its Zod
 * schemas, which put an object's keys in schema order. Keep this in step with
 * `validationSchema` in src/features/curriculum/content/curriculumSchemas.ts.
 */
function appValidation(validation) {
  const out = {}
  for (const key of ['mode', 'pattern', 'needles', 'expected', 'setupCode', 'tests', 'ordered']) {
    if (validation?.[key] === undefined) continue
    out[key] =
      key === 'tests'
        ? validation.tests.map((t) => ({ id: t.id, label: t.label, assertion: t.assertion }))
        : validation[key]
  }
  return out
}

/** Same as challengeFingerprint() in src/features/curriculum/progress/progressFingerprint.ts. */
export function challengeFingerprint(challenge) {
  const text = JSON.stringify([challenge.title, appValidation(challenge.validation)])
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36)
}

/** The section file currently on disk (the version learners have), or null. */
export function readPreviousSection(path) {
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

/** Every challenge in the previous files, by id. */
export function previousChallenges(...files) {
  const byId = new Map()
  for (const file of files) {
    for (const level of file?.levels ?? []) {
      for (const ch of level.challenges ?? []) byId.set(ch.id, ch)
    }
  }
  return byId
}

/** The challenge's id under one of its lesson's former ids (`hello-x` for `first_program-x`). */
function formerChallengeIds(level, id) {
  return (level.formerIds ?? [])
    .filter((oldId) => id.startsWith(`${level.id}-`))
    .map((oldId) => oldId + id.slice(level.id.length))
}

/**
 * Applies `keepProgress` to a generated section file, in place, and removes the flag.
 * `previous` is a map from previousChallenges(). Returns the ids of challenges whose
 * fixed checks now keep learners' progress.
 */
export function applyKeepProgress(file, previous) {
  const kept = []
  for (const level of file.levels) {
    level.challenges = level.challenges.map((ch) => {
      const { keepProgress, ...rest } = ch
      delete rest.acceptedFingerprints
      const before =
        previous.get(ch.id) ?? formerChallengeIds(level, ch.id).map((id) => previous.get(id)).find(Boolean)
      const accepted = [...(before?.acceptedFingerprints ?? [])]
      if (keepProgress && before) {
        const oldPrint = challengeFingerprint(before)
        if (oldPrint !== challengeFingerprint(rest) && !accepted.includes(oldPrint)) {
          accepted.push(oldPrint)
          kept.push(ch.id)
        }
      }
      return accepted.length > 0 ? { ...rest, acceptedFingerprints: accepted } : rest
    })
  }
  return kept
}
