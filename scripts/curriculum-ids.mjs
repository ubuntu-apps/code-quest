/**
 * Permanent ids for challenges and quiz questions, shared by the Python and SQL generators.
 *
 * A challenge's id comes from its lesson and its title (`lists-jump-the-queue`), and a
 * question's from its lesson and a short hash of its prompt (`lists-q-1x2y3z`). Adding,
 * removing or reordering items in a lesson leaves every other id alone, so learners keep
 * their solved challenges, drafts and review history. Changing a title or a prompt makes a
 * new item, which is right: it has become a different exercise.
 *
 * Saved progress from before these ids used `lesson_ch3` and `lesson_q3`; the app moves it
 * over once (src/features/curriculum/idMigration.ts).
 */

/** `Medium: Jump the queue` → `jump-the-queue`. */
export function titleSlug(title) {
  return title
    .replace(/^(Easy|Medium|Hard|Expert): /, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** FNV-1a, 32 bit, in base 36: short and stable. */
function shortHash(text) {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36)
}

export function challengeId(levelId, title) {
  return `${levelId}-${titleSlug(title)}`
}

export function questionId(levelId, prompt) {
  return `${levelId}-q-${shortHash(prompt)}`
}

/** Throws when two items in a lesson would share an id (two challenges with the same title). */
export function assertUnique(levelId, ids, what) {
  const seen = new Set()
  for (const id of ids) {
    if (seen.has(id)) throw new Error(`${levelId}: two ${what} share the id ${id}; give one a different ${what === 'challenges' ? 'title' : 'prompt'}`)
    seen.add(id)
  }
}
