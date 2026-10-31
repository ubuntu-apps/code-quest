/**
 * The R side of challenge checks, shared by the app (rSandbox.ts) and the content checkers
 * (scripts/r-curriculum/check-*.mjs), so a check runs the same way everywhere. No imports
 * apart from types, so Node can load this file directly.
 */
import type { RuntimeAssertionTest } from './types'

/** Separates the learner's output from the test results in a check's output. */
const TESTS_MARKER = '<<codequest-tests>>'

/** Clears variables left by earlier runs, so each run starts fresh, like a new R session. */
export const CLEAR_GLOBALS = 'rm(list = ls(envir = globalenv(), all.names = TRUE), envir = globalenv())'

function escapeRDoubleQuoted(input: string): string {
  return input.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function testsToRList(tests: RuntimeAssertionTest[]): string {
  const items = tests.map(
    (t) =>
      `list(id="${escapeRDoubleQuoted(t.id)}", label="${escapeRDoubleQuoted(t.label)}", assertion="${escapeRDoubleQuoted(t.assertion)}")`,
  )
  return `list(${items.join(', ')})`
}

export interface RTestLine {
  id: string
  label: string
  passed: boolean
  detail?: string
}

/** The R code that runs the learner's code, then each test, and prints the results after a marker. */
export function challengeWrapper(userCode: string, setupCode: string | undefined, tests: RuntimeAssertionTest[]): string {
  const safeSetup = escapeRDoubleQuoted(setupCode ?? '')
  const safeUser = escapeRDoubleQuoted(userCode)
  const testsLiteral = testsToRList(tests)
  return `
local({
  # The learner's code runs in its own environment, which sees R's functions but not
  # variables left in the global environment by the sandbox.
  env <- new.env(parent = parent.env(globalenv()))
  setup <- "${safeSetup}"
  user <- "${safeUser}"
  tests <- ${testsLiteral}
  if (nzchar(trimws(setup))) {
    eval(parse(text = setup), envir = env)
  }
  # Tests can look at the code itself (to check a function was used) and at its output.
  env$._cq_code <- user
  # ._cq_rerun(): runs the learner's code again with the starter's data swapped for other
  # data, and the solution the same way, and compares the named results (and the output).
  # It catches answers typed in as fixed values. A learner who rewrote the starter lines
  # can't be rerun, so that passes.
  env$._cq_rerun <- function(starter, alt, solution, vars, output = FALSE) {
    swap <- function(code) {
      if (nzchar(starter) && grepl(starter, code, fixed = TRUE)) return(sub(starter, alt, code, fixed = TRUE))
      s <- strsplit(starter, "\n", fixed = TRUE)[[1]]
      a <- strsplit(alt, "\n", fixed = TRUE)[[1]]
      if (length(s) != length(a)) return(NULL)
      changed <- FALSE
      for (i in seq_along(s)) {
        if (s[i] != a[i] && nzchar(trimws(s[i])) && grepl(s[i], code, fixed = TRUE)) {
          code <- sub(s[i], a[i], code, fixed = TRUE)
          changed <- TRUE
        }
      }
      if (changed) code else NULL
    }
    run <- function(src) {
      e <- new.env(parent = parent.env(globalenv()))
      out <- tryCatch(suppressWarnings(suppressMessages(capture.output({
        for (expr in parse(text = src)) {
          res <- withVisible(eval(expr, envir = e))
          if (res$visible) print(res$value)
        }
      }))), error = function(err) NULL)
      list(env = e, out = out)
    }
    mine_code <- swap(._cq_code)
    if (is.null(mine_code)) return(TRUE)
    theirs <- run(swap(solution))
    mine <- run(mine_code)
    if (is.null(mine$out) || is.null(theirs$out)) return(FALSE)
    for (v in vars) {
      if (!exists(v, envir = mine$env, inherits = FALSE) || !exists(v, envir = theirs$env, inherits = FALSE)) return(FALSE)
      a <- get(v, envir = mine$env)
      b <- get(v, envir = theirs$env)
      same <- if (is.data.frame(a) && is.data.frame(b)) {
        identical(names(a), names(b)) && isTRUE(all.equal(as.list(a), as.list(b), check.attributes = FALSE))
      } else {
        identical(a, b) || isTRUE(all.equal(a, b, check.attributes = FALSE))
      }
      if (!same) return(FALSE)
    }
    if (output && !identical(mine$out, theirs$out)) return(FALSE)
    TRUE
  }
  environment(env$._cq_rerun) <- env
  # Like the console: every top-level value is printed unless it is assigned.
  env$._cq_stdout <- paste(capture.output({
    for (expr in parse(text = user)) {
      res <- withVisible(eval(expr, envir = env))
      if (res$visible) print(res$value)
    }
  }), collapse = "\\n")
  cat(env$._cq_stdout, "\\n${TESTS_MARKER}\\n", sep = "")
  lines <- character(length(tests))
  for (i in seq_along(tests)) {
    t <- tests[[i]]
    passed <- FALSE
    detail <- ""
    tryCatch({
      # A failed check shows just its label; an error inside it (such as a variable the
      # learner hasn't made yet, "object 'total' not found") is shown as the reason.
      passed <- isTRUE(eval(parse(text = t$assertion), envir = env))
    }, error = function(e) {
      passed <<- FALSE
      detail <<- conditionMessage(e)
    })
    status <- if (passed) "PASS" else "FAIL"
    lines[i] <- paste0(t$id, "\\t", status, "\\t", detail)
  }
  cat(paste(lines, collapse = "\\n"))
  invisible(NULL)
})
`
}

/** Splits a check's output into what the learner's code printed and the test results. */
export function parseChallengeOutput(
  text: string,
  tests: RuntimeAssertionTest[],
): { passed: boolean; tests: RTestLine[]; output: string } {
  const result = { output: text }
  const markerAt = result.output.lastIndexOf(TESTS_MARKER)
  const learnerOutput = markerAt >= 0 ? result.output.slice(0, markerAt).replace(/\n+$/, '') : ''
  const parsed = result.output
    .slice(markerAt >= 0 ? markerAt + TESTS_MARKER.length : 0)
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [id, status, ...detailParts] = line.split('\t')
      const passed = status === 'PASS'
      const detail = detailParts.join('\t').trim()
      const test = tests.find((t) => t.id === id)
      return {
        id: id ?? 'unknown',
        label: test?.label ?? id ?? 'Check',
        passed,
        detail: passed ? undefined : detail || undefined,
      }
    })

  return {
    passed: parsed.length > 0 && parsed.every((t) => t.passed),
    tests: parsed,
    output: learnerOutput,
  }

}
