import type { ChallengeCheckResult, ChallengeTestResult, CodeRunResult, FriendlyCodeError } from '../LanguagePack'
import type { RunMessageSpec } from '../languageSpec'

/**
 * How a language words what its runtime reports (from its language.json): its name, how long
 * code may run, and the messages for a run that went wrong.
 */
export interface RunWording {
  label: string
  runSeconds: number
  tooLong: RunMessageSpec
  stopped?: Partial<RunMessageSpec>
  packageTimeout?: RunMessageSpec
  packageError?: RunMessageSpec
}

/** What a runtime needs from the caller for one run: the wording, and how to report progress. */
export interface RuntimeRunOptions<Status extends string = string> {
  wording: RunWording
  /** Aborting stops this run only. */
  signal?: AbortSignal
  onStatus?: (status: Status) => void
  /** Called with everything printed so far, while the code runs. */
  onOutput?: (outputSoFar: string) => void
}

/**
 * A runtime that runs learners' code (Pyodide in a worker, webR). The subclasses do the
 * running; this class turns what happened into the results every language shares, so a
 * Stop, a run that took too long or a failed download read the same way in every course.
 */
export abstract class CodeRuntime {
  /** The learner pressed Stop. */
  protected stopped({ stopped }: RunWording): FriendlyCodeError {
    return { title: 'Stopped', detail: 'You stopped the code before it finished.', tip: stopped?.tip, errorType: 'Stopped' }
  }

  /** The code ran past the language's time limit (an endless loop, most likely). */
  protected tooLong({ tooLong, runSeconds }: RunWording): FriendlyCodeError {
    return {
      title: tooLong.title,
      detail: tooLong.detail ?? `It was still running after ${runSeconds} seconds, so it was stopped.`,
      tip: tooLong.tip,
      errorType: 'Timeout',
    }
  }

  /** The runtime itself could not be downloaded or started. */
  protected cannotStart({ label }: RunWording): FriendlyCodeError {
    return {
      title: `${label} could not start`,
      detail: `Could not load ${label}. Check your internet connection, or try a newer browser (it needs Safari 16.4+ or a recent Chrome or Firefox).`,
      tip: 'Check your internet connection and try again.',
      errorType: 'RuntimeLoadError',
    }
  }

  /** A package the code imports took too long to download, or failed to. */
  protected packageFailed(wording: RunWording, timedOut: boolean): FriendlyCodeError {
    const message = (timedOut ? wording.packageTimeout : undefined) ?? wording.packageError
    return {
      title: message?.title ?? `Could not download what this ${wording.label} code needs`,
      detail: message?.detail ?? 'The download did not finish.',
      tip: message?.tip ?? 'Check your internet connection and run the code again.',
      errorType: timedOut ? 'PackageTimeout' : 'PackageError',
    }
  }

  /** A Run's result. */
  protected ran(output: string, error: FriendlyCodeError | null = null): CodeRunResult {
    return { output, error }
  }

  /** A Check that could not get as far as the tests. */
  protected failed(error: FriendlyCodeError, output = ''): ChallengeCheckResult {
    return { passed: false, tests: [], error, output }
  }

  /** A Check's result from its tests. A challenge with no tests can't be passed: it would accept any code. */
  protected checked(tests: ChallengeTestResult[], output: string): ChallengeCheckResult {
    return { passed: tests.length > 0 && tests.every((test) => test.passed), tests, error: null, output }
  }
}
