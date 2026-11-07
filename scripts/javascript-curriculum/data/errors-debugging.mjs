// Errors and debugging: stages in order, then the easy, medium and hard side quests. Each lives in its own file under errors-debugging/.
import readingErrors from './errors-debugging/reading-errors.mjs'
import debugging from './errors-debugging/debugging.mjs'
import tryCatch from './errors-debugging/try-catch.mjs'
import throwStage from './errors-debugging/throw.mjs'
import errorObjects from './errors-debugging/error-objects.mjs'
import finallyStage from './errors-debugging/finally.mjs'
import checkingInput from './errors-debugging/checking-input.mjs'
import optionalChaining from './errors-debugging/optional-chaining.mjs'
import reportingErrors from './errors-debugging/reporting-errors.mjs'
import testingCode from './errors-debugging/testing-code.mjs'
import safeInput from './errors-debugging/project-safe-input.mjs'
import formValidator from './errors-debugging/project-form-validator.mjs'
import safeCalculator from './errors-debugging/project-safe-calculator.mjs'

export const errorsDebuggingTopics = [readingErrors, debugging, tryCatch, throwStage, errorObjects, finallyStage, checkingInput, optionalChaining, reportingErrors, testingCode, safeInput, formValidator, safeCalculator]
