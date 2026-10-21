#!/usr/bin/env python3
"""Suggests extra checks for challenges whose answer can be typed in as fixed values.

For each Python challenge where "the starter code plus the solution's final values typed
in" passes every test, this finds other starting values for the variables the starter
code sets (or the answers a challenge types for input()), runs the solution with them,
and keeps a variation when the result changes. The new checks are verified: the solution
must pass them and the typed-in answer must fail them.

Writes data/variations.json, which generate.mjs turns into checks like
    _cq_rerun({"temperature": 12}, "is_hot") == False

The other values keep the original's shape: numbers in text move by one (2026-10-17 ->
2027-11-18), words and list items are reordered or dropped, categories come from what
the solution compares with (other day names, say), and real words replace single words.
Decimals are compared rounded. Read the result before committing: an entry can be
written or corrected by hand and marked "locked": true on its first variation, and
this script then leaves it alone.

Usage: python3 scripts/python-curriculum/make-variations.py <section_id> [<section_id> ...]
       (merges into data/variations.json; entries for other sections are kept), then
       node scripts/python-curriculum/generate.mjs and npm run check:content.
"""
import ast
import copy
import builtins
import io
import json
import os
import re
import signal
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
CONTENT = os.path.join(ROOT, "public", "content", "python")
OUT = os.path.join(HERE, "data", "variations.json")


def worker_helpers():
    js = (
        "const s=require('fs').readFileSync(process.argv[1],'utf8');"
        "const m=s.match(/var PY_HELPERS = (\\[[\\s\\S]*?\\])\\.join\\('\\\\n'\\)/);"
        "process.stdout.write(new Function('return '+m[1])().join('\\n'))"
    )
    return subprocess.run(["node", "-e", js, os.path.join(ROOT, "public", "pyodide-worker.js")],
                          capture_output=True, text=True, check=True).stdout


exec(worker_helpers(), globals())


class Timeout(Exception):
    pass


def _alarm(signum, frame):
    raise Timeout()


signal.signal(signal.SIGALRM, _alarm)
HOME = os.getcwd()
REAL_OUT = sys.stdout


def run(code, setup, values=None):
    """Runs code like a check (optionally with other starting values). Returns (ns, error)."""
    os.chdir(tempfile.mkdtemp(prefix="cq-var-"))
    buf = io.StringIO()
    ns = _cq_fresh_ns("", buf)
    ns["_cq_source"] = code
    old = sys.stdout, sys.stderr, sys.stdin
    sys.stdin = io.StringIO("")
    try:
        signal.alarm(5)
        tree, left = _cq_rerun_code(code, values or {})
        if setup.strip():
            sys.stdout = sys.stderr = io.StringIO()
            exec(compile(setup, "<setup>", "exec"), ns, ns)
        if any(n not in ns for n in left):
            return None, "missing"
        ns.update(copy.deepcopy(left))
        sys.stdout = sys.stderr = buf
        exec(compile(tree, "<code>", "exec"), ns, ns)
        ns["_cq_stdout"] = "\n".join(line.rstrip() for line in buf.getvalue().strip().splitlines())
        ns["_cq_raw_stdout"] = buf.getvalue()
        return ns, None
    except BaseException as e:  # noqa: BLE001
        return None, repr(e)
    finally:
        signal.alarm(0)
        sys.stdout, sys.stderr, sys.stdin = old
        os.chdir(HOME)


def tests_pass(code, setup, tests):
    os.chdir(tempfile.mkdtemp(prefix="cq-var-"))
    saved = sys.stdout
    sys.stdout = io.StringIO()
    try:
        signal.alarm(15)
        raw = json.loads(_cq_tests(code, setup, json.dumps(tests), ""))
        return raw["error"] is None and raw["tests"] and all(t["passed"] for t in raw["tests"]), raw
    except Timeout:
        return False, None
    finally:
        signal.alarm(0)
        sys.stdout = saved
        os.chdir(HOME)


def literal_ok(value):
    try:
        back = eval(repr(value), {})  # noqa: S307
        return type(back) is type(value) and back == value
    except Exception:  # noqa: BLE001
        return False


def assertion_names(tests):
    names = set()
    for t in tests:
        try:
            names.update(n.id for n in ast.walk(ast.parse(t["assertion"], mode="eval")) if isinstance(n, ast.Name))
        except SyntaxError:
            pass
    return names


def typed_code(starter, ns, names):
    lines = []
    for name in sorted(names):
        if name.startswith("_") or name not in ns or hasattr(builtins, name):
            continue
        if literal_ok(ns[name]):
            lines.append(name + " = " + repr(ns[name]))
    if not lines:
        return None
    code = starter + "\n" + "\n".join(lines) + "\n"
    if ns.get("_cq_raw_stdout"):
        code += "print(" + repr(ns["_cq_raw_stdout"]) + ", end='')\n"
    return code


def top_assigns(code):
    """Top-level `name = <literal>` lines: name -> value (first one), plus assignment counts."""
    first, counts = {}, {}
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return first, counts
    for node in ast.walk(tree):
        targets = []
        if isinstance(node, ast.Assign):
            targets = [t for t in node.targets]
        elif isinstance(node, (ast.AugAssign, ast.AnnAssign)):
            targets = [node.target]
        elif isinstance(node, (ast.For, ast.comprehension)):
            targets = [node.target]
        for t in targets:
            for n in ast.walk(t):
                if isinstance(n, ast.Name):
                    counts[n.id] = counts.get(n.id, 0) + 1
    for node in tree.body:
        if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
            try:
                value = ast.literal_eval(node.value)
            except Exception:  # noqa: BLE001
                continue
            first.setdefault(node.targets[0].id, value)
    return first, counts


def uniq(values, original):
    seen, out = [repr(original)], []
    for v in values:
        if repr(v) not in seen and literal_ok(v):
            seen.append(repr(v))
            out.append(v)
    return out


def number_like(s):
    try:
        float(s)
        return True
    except ValueError:
        return False


# Constants in the solution, such as the day names a match statement checks for, or the
# limits an if compares with. Set per challenge by suggest().
SOLUTION_STRINGS, SOLUTION_NUMBERS = [], []


def compared_constants(code):
    """Constants the code compares a value with: "Saturday" in `day == "Saturday"`, the
    items of `day in ("Sat", "Sun")`, `case "rock":`, or 90 in `score >= 90`."""
    found = []
    for node in ast.walk(ast.parse(code)):
        if isinstance(node, ast.Compare):
            sides = [node.left] + node.comparators
            for op, left, right in zip(node.ops, sides, sides[1:]):
                if isinstance(op, (ast.In, ast.NotIn)):
                    if not isinstance(left, ast.Constant) and isinstance(right, (ast.Tuple, ast.List, ast.Set)):
                        found += [e.value for e in right.elts if isinstance(e, ast.Constant)]
                else:
                    for a, b in ((left, right), (right, left)):
                        if isinstance(a, ast.Constant) and not isinstance(b, ast.Constant):
                            found.append(a.value)
        elif isinstance(node, ast.MatchValue) and isinstance(node.value, ast.Constant):
            found.append(node.value.value)
    return found


WORDS = ["garden", "rocket", "level", "planet", "kiwi"]


def word_like(original, index):
    """A real word in the same case style as `original`."""
    word = WORDS[index % len(WORDS)]
    if original.isupper():
        return word.upper()
    if original[:1].isupper():
        return word.capitalize()
    return word


def bump_digits(text, step):
    """Each run of digits moved by `step`, keeping its width: 2026-10-17 -> 2027-11-18."""
    def change(m):
        n = int(m.group()) + step
        if n < 0:
            return m.group()
        # The width is kept, so fixed-width formats like dates stay valid (10 -> 09).
        return str(n).zfill(len(m.group()))
    return re.sub(r"[0-9]+", change, text)


def candidates(v):
    """Other values shaped like v (same kind of text, numbers nearby), most natural first."""
    if isinstance(v, bool):
        return [not v]
    if isinstance(v, int):
        near = [v + 1, v - 1, v + 5, v * 2]
        limits = [c + d for c in SOLUTION_NUMBERS if isinstance(c, int) for d in (0, -1, 1)]
        # The limits the solution compares with come first: they catch `>` written for `>=`.
        out = limits + near + [3, 10, 17, 42, 100]
        # Stay in range: no 0 or 1 for something like a number to test for being prime.
        if v >= 2:
            out = [x for x in out if x >= 2]
        elif v > 0:
            out = [x for x in out if x > 0]
        return uniq(out, v)
    if isinstance(v, float):
        out = [v + 1.5, v * 2, v / 2, round(v + 0.25, 2), 9.75]
        if v > 0:
            out = [x for x in out if x > 0]
        return uniq(out, v)
    if isinstance(v, str):
        words = v.split()
        if len(words) <= 1 and SOLUTION_STRINGS:
            # A category, like a day name the solution checks for: only its other values.
            return uniq([c for c in SOLUTION_STRINGS if re.search(r"[A-Za-z0-9]", c)], v)
        out = []
        if "," in v:
            # A comma-separated list: reorder its items, not the words.
            parts = v.split(",")
            if len(parts) > 2:
                out += [",".join(parts[1:] + parts[:1]), ",".join(parts[:-1])]
            words = []
        if len(words) > 2:
            out += [" ".join(words[1:] + words[:1]), " ".join(words[::-1]), " ".join(words[:-1]),
                    " ".join(words[:3]), " ".join(words[: len(words) // 2])]
        elif len(words) == 2:
            out += [" ".join(words[::-1])]
        if re.search(r"[0-9]", v):
            out += [bump_digits(v, 1), bump_digits(v, -1)]
        runs = re.findall(r"[A-Za-z]+", v)
        if runs:
            # The first word swapped for a real word of the same case: ana@example.com -> garden@example.com.
            out += [re.sub(r"[A-Za-z]+", word_like(runs[0], k), v, count=1) for k in range(3)]
            out += [v.upper(), v.capitalize(), v.title()]
        return uniq([c for c in out if re.search(r"[A-Za-z0-9]", c)], v)
    if isinstance(v, tuple):
        items = list(v)
        if items and all(isinstance(x, (int, float)) and not isinstance(x, bool) for x in items):
            return uniq([tuple(x + 1 for x in items), tuple(x + 2 for x in items), tuple(x * 2 for x in items)], v)
        return uniq([tuple(candidates(x)[0] if candidates(x) else x for x in items)], v)
    if isinstance(v, (set, frozenset)):
        items = sorted(v, key=repr)
        out = [v - {x} for x in items] + [v | {"kiwi"} if all(isinstance(x, str) for x in v) else v | {99}]
        return uniq([type(v)(x) for x in out], v)
    if isinstance(v, list):
        items = list(v)
        out = []
        numeric = items and all(isinstance(x, (int, float)) and not isinstance(x, bool) for x in items)
        if numeric:
            out += [[x + 3 for x in items], items[1:] + items[:1], items[::-1], items + [max(items) + 5],
                    [x * 2 for x in items], items[:-1]]
        else:
            out += [items[1:] + items[:1], items[::-1], items[:-1], items[1:]]
            if items and all(isinstance(x, str) for x in items):
                out.append([bump_digits(x, 1) if re.search(r"[0-9]", x) else x.upper() for x in items])
        return uniq(out, v)
    if isinstance(v, dict):
        keys, values = list(v), list(v.values())
        out = []
        if values and all(isinstance(x, (int, float)) and not isinstance(x, bool) for x in values):
            # The same numbers moved round to other keys, so a smallest or largest moves too.
            out += [{k: values[(i + 1) % len(values)] for i, k in enumerate(keys)},
                    {k: x + 3 for k, x in v.items()}, {k: x * 2 for k, x in v.items()}]
        out += [{k: v[k] for k in keys[:-1]}, {k: v[k] for k in keys[1:]}, dict(reversed(list(v.items())))]
        return uniq(out, v)
    return []


def answers_candidates(answers):
    out = []
    for i, a in enumerate(answers):
        for c in candidates(a)[:6]:
            changed = list(answers)
            changed[i] = c
            out.append(changed)
    # Every answer changed at once.
    out.append([(candidates(a) or [a])[0] for a in answers])
    return uniq(out, answers)


def label_for(values):
    parts = []
    for k, v in values.items():
        if k == "_cq_answers":
            shown = [a if number_like(a) else '"' + a + '"' for a in v]
            text = shown[0] if len(shown) == 1 else ", ".join(shown[:-1]) + " and " + shown[-1]
            parts.append("you type " + text if len(text) <= 40 else "you type other answers")
        else:
            text = repr(v)
            parts.append(k + " = " + text if len(text) <= 30 else "a different " + k)
    return "Also right when " + " and ".join(parts)


def py_dict(values):
    return "{" + ", ".join(json.dumps(k) + ": " + repr(v) for k, v in values.items()) + "}"


def has_float(value):
    if isinstance(value, float):
        return True
    if isinstance(value, (list, tuple, set, frozenset)):
        return any(has_float(x) for x in value)
    if isinstance(value, dict):
        return any(has_float(x) for x in value.values())
    return False


def assertion_for(values, name, value):
    call = "_cq_rerun(%s, %s)" % (py_dict(values), json.dumps(name))
    if has_float(value):
        # Decimals are compared rounded, so doing the maths in another order still passes.
        return "_cq_round(%s) == _cq_round(%s)" % (call, repr(value))
    return "%s == %s" % (call, repr(value))


def make_tests(variations):
    tests = []
    for i, var in enumerate(variations):
        for name, value in var["expect"].items():
            label = label_for(var["set"]) + (" (%s)" % name if len(var["expect"]) > 1 else "")
            tests.append({"id": "v%d_%s" % (i + 1, name), "label": label,
                          "assertion": assertion_for(var["set"], name, value)})
    return tests


def suggest(ch):
    v = ch["validation"]
    setup = v.get("setupCode") or ""
    # Checks added by an earlier run of this script are left out, so they are worked out afresh.
    tests = [t for t in v["tests"] if not re.match(r"v\d+_", t["id"])]
    solution, starter = ch.get("solution") or "", ch.get("starterCode") or ""
    if not solution.strip():
        return None, "no solution"
    names = assertion_names(tests)
    base, err = run(solution, setup)
    if base is None:
        return None, "solution error " + err
    typed = typed_code(starter, base, names)
    if typed is None or not tests_pass(typed, setup, tests)[0]:
        return None, "fine"

    sol_first, sol_counts = top_assigns(solution)
    compared = compared_constants(solution)
    SOLUTION_STRINGS[:] = [c for c in compared if isinstance(c, str) and re.search(r"[A-Za-z0-9]", c)]
    SOLUTION_NUMBERS[:] = [c for c in compared if isinstance(c, (int, float)) and not isinstance(c, bool)]
    starter_first, _ = top_assigns(starter)
    inputs = {k: val for k, val in starter_first.items()
              if sol_first.get(k, object()) == val and sol_counts.get(k, 0) == 1}
    answers = base.get("_cq_answers") if False else None
    if "_cq_answers = " in setup:
        setup_ns, _ = run("", setup)
        for line in setup.splitlines():
            if line.startswith("_cq_answers = "):
                answers = ast.literal_eval(line[len("_cq_answers = "):])
    # What the tests look at; a starting value counts only if the code changes it (like a
    # list it appends to).
    targets = [n for n in sorted(names) if not n.startswith("_") and n in base
               and not hasattr(builtins, n) and literal_ok(base[n])
               and (n not in inputs or repr(base[n]) != repr(inputs[n]))]
    use_stdout = "_cq_stdout" in names or not targets
    if not inputs and answers is None:
        return None, "no starting values to change"

    options = []
    for name, value in inputs.items():
        options += [{name: c} for c in candidates(value)]
    if len(inputs) > 1:
        firsts = {k: (candidates(val) or [val])[0] for k, val in inputs.items()}
        options.append(firsts)
    if answers is not None:
        options += [{"_cq_answers": a} for a in answers_candidates(answers)]

    def outcome(ns):
        out = {n: ns[n] for n in targets if n in ns and literal_ok(ns[n])}
        if use_stdout and all(n in out and out[n] == base[n] for n in targets):
            out["_cq_stdout"] = ns["_cq_stdout"]
        return out

    base_out = outcome(base)
    chosen = []
    for values in options:
        ns, err = run(solution, setup, values)
        if ns is None:
            continue
        out = outcome(ns)
        if set(out) != set(base_out) and not use_stdout:
            continue
        # Compared with == (as the checks do), so a dict in another order isn't a change.
        changed = [n for n in out if n not in base_out or not (out[n] == base_out[n])]
        if not changed:
            continue
        if any(repr(out) == repr(c["expect"]) for c in chosen):
            continue
        # Name targets only, unless the printed output is all that changes.
        expect = {n: out[n] for n in out if n != "_cq_stdout"} if any(n != "_cq_stdout" for n in changed) else {"_cq_stdout": out["_cq_stdout"]}
        chosen.append({"set": values, "expect": expect})
        if len(chosen) == 2:
            break
    if not chosen:
        return None, "no value changes the result"

    extra = make_tests(chosen)
    ok_sol, raw = tests_pass(solution, setup, tests + extra)
    if not ok_sol:
        return None, "solution fails the new checks: " + json.dumps(raw)[:300]
    if tests_pass(typed, setup, tests + extra)[0]:
        return None, "typed answer still passes"
    return chosen, "ok"


def main():
    sections = sys.argv[1:]
    existing = json.load(open(OUT, encoding="utf-8")) if os.path.exists(OUT) else {}
    report = {}
    for section in sections:
        data = json.load(open(os.path.join(CONTENT, section + ".json"), encoding="utf-8"))
        for level in data["levels"]:
            for ch in level["challenges"]:
                if ch["validation"].get("mode") != "python_tests":
                    continue
                if existing.get(ch["id"], [{}])[0].get("locked"):
                    continue  # Written by hand: kept as it is.
                existing.pop(ch["id"], None)
                chosen, why = suggest(ch)
                if chosen:
                    tests = make_tests(chosen)
                    existing[ch["id"]] = [
                        {"set": {k: repr(v) for k, v in c["set"].items()},
                         "expect": {k: repr(v) for k, v in c["expect"].items()},
                         "tests": [{"label": t["label"], "assertion": t["assertion"]}
                                   for t in tests if t["id"].startswith("v%d_" % (i + 1))]}
                        for i, c in enumerate(chosen)]
                if why != "fine":
                    report.setdefault(why if not why.startswith("solution fails") else "solution fails", []).append(
                        ch["id"] + " " + ch["title"] + ("" if why in ("ok",) else "  [" + why[:200] + "]"))
    ordered = {k: existing[k] for k in sorted(existing)}
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        json.dump(ordered, f, indent=2, ensure_ascii=False)
        f.write("\n")
    for why, items in report.items():
        print("== %s (%d)" % (why, len(items)), file=REAL_OUT)
        for item in items:
            print("  " + item, file=REAL_OUT)


main()
