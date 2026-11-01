"""Runs SQL challenge checks and lesson SQL for the content checker (SqlChecker.mjs), on SQLite
through the app's own worker helpers (argv[1]).
"""
import json, sys
helpers = sys.argv[1]
exec(helpers, globals())
data = json.load(sys.stdin)

def lit(v):
    if v is None:
        return "NULL"
    if isinstance(v, str):
        return "'" + v.replace("'", "''") + "'"
    return repr(v)

def ident(name):
    return '"' + name.replace('"', '""') + '"'

def last_result(setup, sql):
    con = _cq_sql_db(setup)
    try:
        return _cq_sql_last_rows(_cq_sql_exec(con, sql))
    finally:
        con.close()

def typed_variant(case):
    # The solution's result typed in as fixed values: a learner who copied the answer table.
    try:
        res = last_result(case["setup"], case["solution"])
    except Exception:
        return None
    if res is None:
        return None
    cols, rows = res
    if not rows:
        return None
    first = "SELECT " + ", ".join(lit(v) + " AS " + ident(c) for v, c in zip(rows[0], cols))
    rest = ["SELECT " + ", ".join(lit(v) for v in r) for r in rows[1:]]
    return "\nUNION ALL\n".join([first] + rest) + ";"

results = []
for case in data["cases"]:
    out = {"variants": {}}
    variants = dict(case["variants"])
    typed = typed_variant(case)
    if typed is not None:
        variants["typed"] = typed
    for name, code in variants.items():
        try:
            raw = json.loads(_cq_sql_tests(code, case["setup"], case["alt"], case["solution"], case["ordered"], json.dumps(case["checks"])))
            tests = raw["tests"]
            err = raw.get("sqlError") or (raw["error"] and {"message": raw["error"].strip().splitlines()[-1]})
            passed = not err and len(tests) > 0 and all(t["passed"] for t in tests)
            detail = err["message"] if err else "; ".join(t["label"] + ": " + str(t.get("detail", "")) for t in tests if not t["passed"])
        except BaseException as e:
            passed, detail = False, repr(e)
        out["variants"][name] = {"passed": passed, "detail": detail}
    try:
        main = last_result(case["setup"], case["solution"])
        alt = last_result(case["alt"], case["solution"]) if case["alt"].strip() else None
        out["mainRows"] = None if main is None else len(main[1])
        out["altSame"] = main is not None and alt is not None and sorted(map(repr, main[1])) == sorted(map(repr, alt[1]))
        # Ties in the sort: add a random tie-breaker to the ORDER BY and run it a few times.
        out["ties"] = False
        if case["ordered"]:
            import re as _re
            sol = case["solution"]
            m = list(_re.finditer(r"\border\s+by\b", sol, _re.I))
            if m:
                start = m[-1].end()
                end_m = _re.search(r"\b(limit|offset)\b|;", sol[start:], _re.I)
                end = start + end_m.start() if end_m else len(sol)
                shuffled = sol[:end].rstrip() + ", random()" + (" " if end_m else "") + sol[end:]
                for setup in [case["setup"], case["alt"]]:
                    if not setup.strip():
                        continue
                    con = _cq_sql_db(setup)
                    try:
                        plain = _cq_sql_last_rows(_cq_sql_exec(con, sol))
                        for _ in range(8):
                            other = _cq_sql_last_rows(_cq_sql_exec(con, shuffled))
                            if plain and other and plain[1] != other[1]:
                                out["ties"] = True
                                break
                    finally:
                        con.close()
    except BaseException:
        out["mainRows"], out["altSame"] = None, False
    results.append(out)

runs = []
for run in data["runs"]:
    raw = json.loads(_cq_sql_run(run["sql"], run["setup"]))
    runs.append(raw["sqlError"]["message"] if raw.get("sqlError") else None)

json.dump({"cases": results, "runs": runs}, sys.stdout)
