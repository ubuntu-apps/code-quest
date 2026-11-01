"""Runs Python challenge checks for the content checker (PythonChecker.mjs).

Reads cases from stdin: the challenge's setup and tests, and the versions of the code to try
(solution, starter, empty). Adds the solution typed in as fixed values, runs each through the
app's own worker helpers (argv[1]) and prints, per case, whether each version passed.
"""
import json, os, sys, tempfile, signal
helpers = sys.argv[1]
exec(helpers, globals())
cases = json.load(sys.stdin)
# Lesson setup code may print; keep it out of the JSON result channel.
result_channel = sys.stdout
sys.stdout = open(os.devnull, "w")
has_alarm = hasattr(signal, "alarm")
class Timeout(Exception):
    pass
def on_alarm(signum, frame):
    raise Timeout()
if has_alarm:
    signal.signal(signal.SIGALRM, on_alarm)
home = os.getcwd()

def typed_variant(case):
    # The starter code, then every value the tests look at, typed in as the solution leaves
    # it, and the solution's output printed as fixed text: a learner who copied the answer.
    sol = case["variants"].get("solution")
    if not sol:
        return None
    names = set()
    for t in case["tests"]:
        try:
            tree = ast.parse(t["assertion"], mode="eval")
        except SyntaxError:
            continue
        names.update(n.id for n in ast.walk(tree) if isinstance(n, ast.Name))
    os.chdir(tempfile.mkdtemp(prefix="cq-typed-"))
    buf = io.StringIO()
    ns = _cq_fresh_ns("", buf)
    ns["_cq_source"] = sol
    old_out, old_err = sys.stdout, sys.stderr
    try:
        if has_alarm:
            signal.alarm(10)
        if case["setup"].strip():
            sys.stdout = sys.stderr = io.StringIO()
            exec(compile(case["setup"], "<setup>", "exec"), ns, ns)
        sys.stdout = sys.stderr = buf
        exec(compile(sol, "<solution>", "exec"), ns, ns)
    except BaseException:
        return None
    finally:
        if has_alarm:
            signal.alarm(0)
        sys.stdout, sys.stderr = old_out, old_err
        os.chdir(home)
    lines = []
    for name in sorted(names):
        if name.startswith("_") or name not in ns or hasattr(builtins, name):
            continue
        value = ns[name]
        try:
            if type(eval(repr(value))) is not type(value) or eval(repr(value)) != value:
                continue
        except Exception:
            continue
        lines.append(name + " = " + repr(value))
    if not lines:
        return None
    code = case["variants"].get("starter", "") + "\n" + "\n".join(lines) + "\n"
    if buf.getvalue():
        code += "print(" + repr(buf.getvalue()) + ", end='')\n"
    return code

results = []
for case in cases:
    out = {}
    variants = dict(case["variants"])
    typed = typed_variant(case)
    if typed is not None:
        variants["typed"] = typed
    for variant, code in variants.items():
        workdir = tempfile.mkdtemp(prefix="cq-check-")
        os.chdir(workdir)
        try:
            if has_alarm:
                signal.alarm(10)
            raw = json.loads(_cq_tests(code, case["setup"], json.dumps(case["tests"]), ""))
            tests = raw["tests"]
            passed = raw["error"] is None and len(tests) > 0 and all(t["passed"] for t in tests)
            detail = raw["error"].strip().splitlines()[-1] if raw["error"] else "; ".join(
                t["label"] + ": " + str(t.get("detail", "")) for t in tests if not t["passed"])
        except Timeout:
            passed, detail = False, "timed out"
        except BaseException as e:
            passed, detail = False, repr(e)
        finally:
            if has_alarm:
                signal.alarm(0)
            os.chdir(home)
        out[variant] = {"passed": passed, "detail": detail}
    results.append(out)
json.dump(results, result_channel)
