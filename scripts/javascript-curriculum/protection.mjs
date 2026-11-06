/**
 * JavaScript's protection against typed-in answers. For now it's in each challenge's tests:
 * `avoids('8760')` makes sure a result is worked out rather than typed in. Later quests call
 * the learner's functions with other inputs in their tests. This only removes `typedOk`, which
 * is for the content checker.
 */
import { TypedInProtection } from '../course-kit/TypedInProtection.mjs'

export class JavaScriptProtection extends TypedInProtection {
  protect({ typedOk, ...challenge }) {
    void typedOk
    return challenge
  }
}
