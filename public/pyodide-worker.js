/* CodeQuest Python worker.
 *
 * Runs Pyodide off the main thread so a learner's infinite loop can never
 * freeze the app: the page enforces a time limit and simply terminates this
 * worker (and starts a fresh one) when code runs too long or the learner
 * presses Stop.
 *
 * Learner code is passed to the Python helpers below as function arguments,
 * never pasted into Python source, so no quoting or escaping can break it.
 * Every run gets a brand-new namespace, so variables from an earlier run or
 * lesson never leak into the next one. Printed output is capped and streamed
 * to the page in chunks ('output' messages), so a run that times out still
 * shows what it printed. A failed test reports the expected and actual values
 * when it is an `a == b` comparison.
 *
 * scripts/check-curriculum.mjs runs lesson content through these same helpers.
 */

var pyodideReady = null

var PY_HELPERS = [
  'import ast, io, os, re, sys, json, time, tempfile, traceback, builtins',
  '',
  '# Printed text beyond this is dropped, so a print loop can\'t exhaust memory.',
  '_CQ_OUTPUT_LIMIT = 100_000',
  '',
  'class _CqOutput(io.TextIOBase):',
  '    """Captures printed text, caps its size, and streams it to the page in chunks."""',
  '',
  '    def __init__(self, on_output=None):',
  '        self._parts = []',
  '        self._size = 0',
  '        self._pending = []',
  '        self._pending_size = 0',
  '        self._last_flush = time.monotonic()',
  '        self._on_output = on_output',
  '        self.truncated = False',
  '',
  '    def writable(self):',
  '        return True',
  '',
  '    def write(self, s):',
  '        s = str(s)',
  '        if self.truncated:',
  '            return len(s)',
  '        text = s',
  '        room = _CQ_OUTPUT_LIMIT - self._size',
  '        if len(s) > room:',
  '            text = s[:room] + "\\n[Output stopped: your code printed more than 100,000 characters.]\\n"',
  '            self.truncated = True',
  '        self._parts.append(text)',
  '        self._size += len(text)',
  '        self._pending.append(text)',
  '        self._pending_size += len(text)',
  '        if self.truncated or self._pending_size > 8192 or time.monotonic() - self._last_flush > 0.25:',
  '            self.flush()',
  '        return len(s)',
  '',
  '    def flush(self):',
  '        if self._pending and self._on_output is not None:',
  '            try:',
  '                self._on_output("".join(self._pending))',
  '            except Exception:',
  '                pass',
  '        self._pending = []',
  '        self._pending_size = 0',
  '        self._last_flush = time.monotonic()',
  '',
  '    def getvalue(self):',
  '        return "".join(self._parts)',
  '',
  'def _cq_make_input(lines, out):',
  '    queue = list(lines)',
  '    def _cq_input(prompt=""):',
  '        out.write(str(prompt))',
  '        if not queue:',
  '            raise EOFError("input() needs a value: type one line per input() call in the Input box, then run again.")',
  '        value = queue.pop(0)',
  '        out.write(value + "\\n")',
  '        return value',
  '    return _cq_input',
  '',
  'def _cq_fresh_ns(stdin_text, out):',
  '    ns = {"__name__": "__main__", "__builtins__": builtins}',
  '    ns["input"] = _cq_make_input(stdin_text.splitlines(), out)',
  '    return ns',
  '',
  'def _cq_error_text():',
  '    return traceback.format_exc()',
  '',
  '# Importing these takes seconds on a slow phone, so it happens before a run\'s time limit starts.',
  '_CQ_PREIMPORT = ("numpy", "pandas")',
  '',
  'def _cq_preimport(src):',
  '    for name in _CQ_PREIMPORT:',
  '        if name in src and name not in sys.modules:',
  '            try:',
  '                __import__(name)',
  '            except Exception:',
  '                pass',
  '',
  'def _cq_run(src, stdin_text, on_output=None):',
  '    buf = _CqOutput(on_output)',
  '    old_out, old_in = sys.stdout, sys.stdin',
  '    sys.stdout = buf',
  '    sys.stdin = io.StringIO(stdin_text)',
  '    ns = _cq_fresh_ns(stdin_text, buf)',
  '    result = None',
  '    error = None',
  '    try:',
  '        try:',
  '            code = compile(src, "<sandbox>", "eval")',
  '        except SyntaxError:',
  '            code = None',
  '        if code is not None:',
  '            result = eval(code, ns, ns)',
  '        else:',
  '            exec(compile(src, "<sandbox>", "exec"), ns, ns)',
  '    except BaseException:',
  '        error = _cq_error_text()',
  '    finally:',
  '        buf.flush()',
  '        sys.stdout, sys.stdin = old_out, old_in',
  '    out = buf.getvalue()',
  '    if error is None and result is not None:',
  '        # Like the Python prompt: a lone expression shows its repr (\'hi\', not hi).',
  '        out = out + repr(result) + "\\n"',
  '    return json.dumps({"output": out, "error": error})',
  '',
  'def _cq_tests(user, setup, tests_json, stdin_text):',
  '    # Each check runs in its own empty folder, so files from earlier runs can\'t change the result.',
  '    home = os.getcwd()',
  '    os.chdir(tempfile.mkdtemp(prefix="cq-check-"))',
  '    try:',
  '        return _cq_tests_here(user, setup, tests_json, stdin_text)',
  '    finally:',
  '        os.chdir(home)',
  '',
  'def _cq_short_repr(value):',
  '    try:',
  '        text = repr(value)',
  '    except Exception:',
  '        text = "<" + type(value).__name__ + ">"',
  '    return text if len(text) <= 300 else text[:297] + "..."',
  '',
  'def _cq_display_code(code):',
  '    # Tests write __import__(\'json\') so they work whatever the learner imported; show plain json.',
  '    return re.sub(r"__import__\\([\'\\"]([\\w.]+)[\'\\"]\\)", r"\\1", code)',
  '',
  'def _cq_describe_error(e):',
  '    if isinstance(e, SystemExit):',
  '        return "Your code called exit(), which stops the whole program. Return a value instead."',
  '    text = str(e)',
  '    return type(e).__name__ + (": " + text if text else "")',
  '',
  'def _cq_check(assertion, ns):',
  '    """Runs one test. Returns (passed, detail); detail explains a failure."""',
  '    tree = ast.parse(assertion, mode="eval")',
  '    body = tree.body',
  '    if isinstance(body, ast.Compare) and len(body.ops) == 1 and isinstance(body.ops[0], ast.Eq):',
  '        # Evaluate each side once (as `a == b` would), so a failure can show both values.',
  '        actual = eval(compile(ast.Expression(body.left), "<challenge_assert>", "eval"), ns, ns)',
  '        expected = eval(compile(ast.Expression(body.comparators[0]), "<challenge_assert>", "eval"), ns, ns)',
  '        if bool(actual == expected):',
  '            return True, None',
  '        return False, "Expected " + _cq_short_repr(expected) + ", got " + _cq_short_repr(actual)',
  '    if bool(eval(compile(tree, "<challenge_assert>", "eval"), ns, ns)):',
  '        return True, None',
  '    return False, "This check is false: " + _cq_display_code(assertion)',
  '',
  'def _cq_tests_here(user, setup, tests_json, stdin_text):',
  '    tests = json.loads(tests_json)',
  '    buf = _CqOutput()',
  '    ns = _cq_fresh_ns(stdin_text, buf)',
  '    old_out, old_in = sys.stdout, sys.stdin',
  '    sys.stdin = io.StringIO(stdin_text)',
  '    try:',
  '        if setup.strip():',
  '            exec(compile(setup, "<challenge_setup>", "exec"), ns, ns)',
  '        sys.stdout = buf',
  '        try:',
  '            exec(compile(user, "<challenge_user>", "exec"), ns, ns)',
  '        finally:',
  '            sys.stdout = old_out',
  '    except BaseException:',
  '        sys.stdout, sys.stdin = old_out, old_in',
  '        return json.dumps({"tests": [], "error": _cq_error_text()})',
  '    sys.stdin = old_in',
  '    ns["_cq_stdout"] = buf.getvalue()',
  '    results = []',
  '    for t in tests:',
  '        try:',
  '            ok, detail = _cq_check(t["assertion"], ns)',
  '        except BaseException as e:',
  '            ok, detail = False, _cq_describe_error(e)',
  '        result = {"id": t["id"], "label": t["label"], "passed": ok}',
  '        if not ok:',
  '            result["detail"] = detail',
  '        results.append(result)',
  '    return json.dumps({"tests": results, "error": None})',
].join('\n')

function loadRuntime(cdnBase) {
  if (!pyodideReady) {
    pyodideReady = (async function () {
      importScripts(cdnBase + 'pyodide.js')
      var pyodide = await self.loadPyodide({ indexURL: cdnBase })
      await pyodide.runPythonAsync(PY_HELPERS)
      return pyodide
    })()
  }
  return pyodideReady
}

function callPy(pyodide, name, args) {
  var fn = pyodide.globals.get(name)
  try {
    return fn.apply(null, args)
  } finally {
    fn.destroy()
  }
}

function errorText(err) {
  return String((err && err.message) || err)
}

self.onmessage = async function (event) {
  var msg = event.data || {}
  if (msg.type === 'init') {
    try {
      await loadRuntime(msg.cdnBase)
      self.postMessage({ type: 'ready' })
    } catch (err) {
      self.postMessage({ type: 'load-error', message: errorText(err) })
    }
    return
  }

  var pyodide
  try {
    pyodide = await loadRuntime(msg.cdnBase)
  } catch (err) {
    self.postMessage({ id: msg.id, type: 'crash', message: errorText(err) })
    return
  }

  // Some modules ship as separate Pyodide packages (sqlite3, pandas, numpy, ...).
  // Download the ones this code imports before running it. The page's run time
  // limit starts only after this, when we post 'started'.
  var source =
    msg.type === 'run' || msg.type === 'preload'
      ? msg.code || ''
      : (msg.setupCode || '') + '\n' + (msg.userCode || '')
  var announced = false
  try {
    await pyodide.loadPackagesFromImports(source, {
      messageCallback: function (text) {
        // Pyodide reports "Loading pandas, numpy, ..." only when it really downloads something.
        if (!announced && /^Loading /.test(String(text))) {
          announced = true
          self.postMessage({ id: msg.id, type: 'loading-packages' })
        }
      },
    })
  } catch (err) {
    self.postMessage({ id: msg.id, type: 'package-error', message: errorText(err) })
    return
  }

  // "Download for offline": the packages are now cached; nothing to run.
  if (msg.type === 'preload') {
    self.postMessage({ id: msg.id, type: 'result', payload: { ok: true } })
    return
  }

  try {
    callPy(pyodide, '_cq_preimport', [source])
  } catch (err) {
    // Not fatal: the run imports the module itself (and reports any error).
  }

  self.postMessage({ id: msg.id, type: 'started' })

  try {
    var raw
    if (msg.type === 'run') {
      var onOutput = function (text) {
        self.postMessage({ id: msg.id, type: 'output', text: String(text) })
      }
      raw = callPy(pyodide, '_cq_run', [msg.code, msg.stdin || '', onOutput])
    } else if (msg.type === 'tests') {
      raw = callPy(pyodide, '_cq_tests', [
        msg.userCode,
        msg.setupCode || '',
        JSON.stringify(msg.tests || []),
        msg.stdin || '',
      ])
    } else {
      throw new Error('Unknown request: ' + msg.type)
    }
    self.postMessage({ id: msg.id, type: 'result', payload: JSON.parse(raw) })
  } catch (err) {
    // A JavaScript-level failure (Python errors are returned as data above).
    // The page replaces this worker, since Pyodide may be unusable now.
    self.postMessage({ id: msg.id, type: 'crash', message: errorText(err) })
  }
}
