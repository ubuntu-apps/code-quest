"""Works out what quiz code gives, and runs Python "Try it" blocks, for the content checker
(PythonChecker.mjs and SqlChecker.mjs), with the app's own worker helpers (argv[1]).
"""
import builtins, io, json, os, signal, sys, tempfile
helpers = sys.argv[1]
exec(helpers, globals())
data = json.load(sys.stdin)
result_channel = sys.stdout
class Timeout(Exception):
    pass
def on_alarm(signum, frame):
    raise Timeout()
has_alarm = hasattr(signal, "alarm")
if has_alarm:
    signal.signal(signal.SIGALRM, on_alarm)
home = os.getcwd()

def isolated(fn):
    # Fresh folder, no keyboard, output captured, and a time limit.
    buf = io.StringIO()
    old_out, old_err, old_input = sys.stdout, sys.stderr, builtins.input
    sys.stdout = sys.stderr = buf
    builtins.input = lambda *a: "1"
    os.chdir(tempfile.mkdtemp(prefix="cq-quiz-"))
    try:
        if has_alarm:
            signal.alarm(5)
        return fn(buf)
    finally:
        if has_alarm:
            signal.alarm(0)
        sys.stdout, sys.stderr, builtins.input = old_out, old_err, old_input
        os.chdir(home)

def py_values(prelude, expr):
    def run(buf):
        ns = {"__name__": "__main__"}
        if prelude:
            exec(compile(prelude, "<prelude>", "exec"), ns)
        start = len(buf.getvalue())
        try:
            code = compile(expr, "<question>", "eval")
        except SyntaxError:
            exec(compile(expr, "<question>", "exec"), ns)
            return [buf.getvalue()[start:].rstrip("\n")]
        value = eval(code, ns)
        printed = buf.getvalue()[start:].rstrip("\n")
        values = [repr(value), str(value)]
        return ([printed] if printed else []) + values
    try:
        return isolated(run)
    except BaseException:
        return None

def sql_values(setup, sql):
    try:
        con = _cq_sql_db(setup)
        try:
            res = _cq_sql_last_rows(_cq_sql_exec(con, sql))
        finally:
            con.close()
    except BaseException:
        return None
    if not res:
        return None
    cols, rows = res
    if len(rows) == 1 and len(cols) == 1:
        v = rows[0][0]
        return ["NULL" if v is None else str(v), repr(v), "'" + str(v) + "'"]
    return None

def try_block(code, folder):
    def run(buf):
        os.chdir(folder)
        exec(compile(code, "<try it>", "exec"), {"__name__": "__main__"})
        return None
    try:
        return isolated(run)
    except Timeout:
        return "timed out"
    except BaseException as e:
        return type(e).__name__ + ": " + str(e)[:160]

out = {"quiz": [], "tries": []}
for case in data["quiz"]:
    out["quiz"].append(py_values(case["prelude"], case["expr"]) if case["lang"] == "python" else sql_values(case["setup"], case["expr"]))
# A lesson's blocks share a folder, like the app's sandbox, which keeps files between runs.
folders = {}
for t in data["tries"]:
    folder = folders.setdefault(t["lesson"], tempfile.mkdtemp(prefix="cq-try-"))
    out["tries"].append(try_block(t["code"], folder))
json.dump(out, result_channel)
