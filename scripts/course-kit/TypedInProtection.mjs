/**
 * Protection against answers typed in as fixed values: a learner who copies the expected
 * result (`total = 42`, `SELECT 'Dune' AS title`) instead of working it out.
 *
 * Every course has some. The generator calls `protect()` on each challenge as it is
 * published, so a course can add checks that run the learner's code again with other data:
 * - Python (python-curriculum/protection.mjs): checks found by make-variations.py, which reruns
 *   the solution with other starting values (data/variations.json);
 * - R (r-curriculum/protection.mjs): one "Works with other data too" test, which reruns the
 *   learner's code and the solution on changed starter data and compares them;
 * - SQL needs nothing here: every Check compares the answer with the solution on the lesson's
 *   other rows (`database.altSetupSql`), in the app.
 *
 * The content checker (scripts/content-check) then makes sure it works: the solution must pass
 * and the answer typed in must fail.
 */
export class TypedInProtection {
  /**
   * The challenge as published, with any extra checks. It also removes fields that are only
   * for building the checks.
   * @param {object} challenge With its permanent `id`.
   */
  protect(challenge) {
    return challenge
  }
}
