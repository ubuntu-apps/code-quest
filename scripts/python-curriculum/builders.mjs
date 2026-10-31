/**
 * Builders for Python lessons: the shared ones (../course-kit/CourseBuilders.mjs) plus
 * `task` and `typedInput`. Lesson files import them from data/_builders.mjs.
 */
import { CourseBuilders } from '../course-kit/CourseBuilders.mjs'

export class PythonBuilders extends CourseBuilders {
  /**
   * A Python challenge graded by running tests in the app's sandbox.
   * `tests` are [label, assertion] pairs, evaluated after the learner's code runs;
   * `_cq_stdout` holds everything it printed. Use `__import__('json')` etc. in
   * assertions so they don't depend on what the learner imported.
   *
   * @param {'easy'|'medium'|'hard'|'expert'} difficulty
   * @param {string} title
   * @param {{ prompt: string, starter?: string, hint: string, solution: string, tests: [string, string][], setup?: string, keepProgress?: boolean }} spec
   */
  task(difficulty, title, { prompt, starter = '', hint, solution, tests, setup = '', keepProgress = false }) {
    return {
      title: this.challengeTitle(difficulty, title),
      promptMarkdown: prompt,
      starterCode: starter,
      hint,
      solution,
      validation: { mode: 'python_tests', setupCode: setup, tests: this._tests(tests) },
      // Fixed checks keep learners' progress (see ../progress-safety.mjs).
      ...(keepProgress ? { keepProgress: true } : {}),
    }
  }

  /**
   * Setup code for challenges that read input: plays the user, so each `input()`
   * call gets the next answer, and the prompt plus answer appear in the output
   * just as they would when someone types them.
   *
   * @param {...string} answers
   */
  typedInput(...answers) {
    return (
      `_cq_answers = [${answers.map((a) => `'${a.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`).join(', ')}]\n` +
      'def input(prompt=""):\n' +
      '    if not _cq_answers:\n' +
      `        raise EOFError("This check only types ${answers.length} answer(s): call input() fewer times.")\n` +
      '    value = _cq_answers.pop(0)\n' +
      '    print(str(prompt) + value)\n' +
      '    return value\n'
    )
  }
}
