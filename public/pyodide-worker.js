/* CodeQuest Python worker.
 *
 * Runs Pyodide off the main thread so a learner's infinite loop can never
 * freeze the app: the page enforces a time limit and simply terminates this
 * worker (and starts a fresh one) when code runs too long or the learner
 * presses Stop.
 *
 * Learner code is handed to Python as data (a Python dict built with
 * pyodide.toPy), never pasted into Python source, so no quoting or escaping
 * can break it. Every run gets a brand-new namespace, so variables from an
 * earlier run or lesson never leak into the next one.
 */

var pyodideReady = null

var PY_HELPERS = [
  'import io, sys, json, traceback, builtins',
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
  'def _cq_run(src, stdin_text):',
  '    buf = io.StringIO()',
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
  '        sys.stdout, sys.stdin = old_out, old_in',
  '    out = buf.getvalue()',
  '    if error is None and result is not None:',
  '        out = out + str(result) + "\\n"',
  '    return json.dumps({"output": out, "error": error})',
  '',
  'def _cq_tests(user, setup, tests_json, stdin_text):',
  '    tests = json.loads(tests_json)',
  '    buf = io.StringIO()',
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
  '            ok = bool(eval(compile(t["assertion"], "<challenge_assert>", "eval"), ns, ns))',
  '            if ok:',
  '                results.append({"id": t["id"], "label": t["label"], "passed": True})',
  '            else:',
  '                results.append({"id": t["id"], "label": t["label"], "passed": False,',
  '                                "detail": "Assertion returned False: " + t["assertion"]})',
  '        except Exception as e:',
  '            results.append({"id": t["id"], "label": t["label"], "passed": False, "detail": str(e)})',
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

self.onmessage = async function (event) {
  var msg = event.data || {}
  if (msg.type === 'init') {
    try {
      await loadRuntime(msg.cdnBase)
      self.postMessage({ type: 'ready' })
    } catch (err) {
      self.postMessage({ type: 'load-error', message: String((err && err.message) || err) })
    }
    return
  }

  var pyodide
  try {
    pyodide = await loadRuntime(msg.cdnBase)
  } catch (err) {
    self.postMessage({ id: msg.id, type: 'crash', message: String((err && err.message) || err) })
    return
  }

  // "Download for offline": fetch every package the lessons import, without running anything.
  if (msg.type === 'preload') {
    try {
      await pyodide.loadPackagesFromImports(msg.code || '')
      self.postMessage({ id: msg.id, type: 'result', payload: { ok: true } })
    } catch (err) {
      self.postMessage({ id: msg.id, type: 'crash', message: String((err && err.message) || err) })
    }
    return
  }

  // Some modules ship as separate Pyodide packages (sqlite3, pandas, numpy, ...).
  // Download the ones this code imports before running it. The page's run time
  // limit starts only after this, when we post 'started'.
  var source = msg.type === 'run' ? msg.code : (msg.setupCode || '') + '\n' + (msg.userCode || '')
  try {
    await pyodide.loadPackagesFromImports(source)
  } catch (err) {
    self.postMessage({
      id: msg.id,
      type: 'crash',
      message:
        'Could not download a Python package this code needs. Check your internet connection and try again. (' +
        String((err && err.message) || err) +
        ')',
    })
    return
  }
  self.postMessage({ id: msg.id, type: 'started' })

  try {
    var raw
    if (msg.type === 'run') {
      raw = callPy(pyodide, '_cq_run', [msg.code, msg.stdin || ''])
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
    self.postMessage({ id: msg.id, type: 'crash', message: String((err && err.message) || err) })
  }
}
