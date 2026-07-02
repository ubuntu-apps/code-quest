/** Hint and solution text for Python Control Flow challenges (by topic id, in challenge order). */
export const CONTROL_FLOW_HELP = {
  if_elif_else: [
    {
      hint: 'Use if with x > 0 and print the string inside the block.',
      solution: 'x = 5\nif x > 0:\n    print("positive")',
    },
    {
      hint: 'Zero is falsy in Python, so the else branch runs.',
      solution: 'n = 0\nif n:\n    print("yes")\nelse:\n    print("no")',
    },
    {
      hint: 'Add an elif branch that checks v == 2.',
      solution: 'v = 2\nif v == 1:\n    print("one")\nelif v == 2:\n    print("two")',
    },
    {
      hint: 'Compare name to the string "Ada" with ==.',
      solution: 'name = "Ada"\nif name == "Ada":\n    print("Hi Ada")',
    },
    {
      hint: 'Nest the comparison inside if a < b.',
      solution: 'a, b = 1, 2\nif a < b:\n    print("ok")',
    },
    {
      hint: 'Use if score >= 70 for Pass, else for Fail.',
      solution: 'score = 74\nif score >= 70:\n    print("Pass")\nelse:\n    print("Fail")',
    },
    {
      hint: 'Chain if/elif for 1 and 2, else for everything else.',
      solution: 'x = 3\nif x == 1:\n    print("one")\nelif x == 2:\n    print("two")\nelse:\n    print("other")',
    },
    {
      hint: 'A non-empty list is truthy; use if lst: to check.',
      solution: 'lst = [1]\nif lst:\n    print("has items")',
    },
    {
      hint: 'An empty string is falsy; if not s: detects it.',
      solution: 's = ""\nif not s:\n    print("empty")',
    },
    {
      hint: 'Python allows chained comparisons like 13 <= age <= 19.',
      solution: 'age = 15\nif 13 <= age <= 19:\n    print("teen")',
    },
  ],
  boolean_logic: [
    {
      hint: 'and returns True only when both sides are True.',
      solution: 'r = True and False',
    },
    {
      hint: 'or returns True when at least one side is True.',
      solution: 'r = False or True',
    },
    {
      hint: 'not flips the boolean value.',
      solution: 'r = not False',
    },
    {
      hint: 'Use in to test substring membership; pick a letter not in "cat".',
      solution: 'ok = "b" in "cat"',
    },
    {
      hint: 'Both comparisons must be True for and to return True.',
      solution: 'flag = 5 > 1 and 10 > 5',
    },
    {
      hint: 'Parentheses control order: or runs before and here.',
      solution: 'x = (True or False) and True',
    },
    {
      hint: 'De Morgan: not (a and b) is True when at least one operand is False.',
      solution: 'a, b = True, False\nr = not (a and b)',
    },
    {
      hint: '== compares values; two empty lists are equal but not the same object.',
      solution: 'x = [] == []',
    },
    {
      hint: 'any() returns True if at least one item is truthy.',
      solution: 'r = any([0, 0, 3])',
    },
    {
      hint: 'all() returns True only when every item is truthy.',
      solution: 'r = all([1, 2, 3])',
    },
  ],
  comparison_operators: [
    {
      hint: 'Wrap the equality comparison in parentheses and assign to eq.',
      solution: 'eq = (5 == 5)',
    },
    {
      hint: '!= is True when the values differ.',
      solution: 'ne = (1 != 2)',
    },
    {
      hint: 'Assign the result of 3 < 10 to r.',
      solution: 'r = 3 < 10',
    },
    {
      hint: 'Strings compare in lexicographic (alphabetical) order.',
      solution: 'r = "apple" < "banana"',
    },
    {
      hint: 'Chained comparisons like 1 < 2 < 3 are valid Python.',
      solution: 'r = 1 < 2 < 3',
    },
    {
      hint: '>= means greater than or equal to.',
      solution: 'r = 5 >= 5',
    },
    {
      hint: 'sorted(nums) always equals itself for the same list.',
      solution: 'nums = [3, 1, 2]\nr = sorted(nums) == sorted(nums)',
    },
    {
      hint: 'None == None evaluates to True.',
      solution: 'r = None == None',
    },
    {
      hint: 'Float rounding makes 0.1 + 0.2 slightly different from 0.3.',
      solution: 'r = 0.1 + 0.2 == 0.3',
    },
    {
      hint: 'min(4, 9) returns 4, so the comparison is True.',
      solution: 'r = min(4, 9) == 4',
    },
  ],
  while_loops: [
    {
      hint: 'Decrement n inside the loop so it eventually stops.',
      solution: 'n = 2\nwhile n > 0:\n    print(n)\n    n -= 1',
    },
    {
      hint: 'Add i to total each iteration and increment i until i > 3.',
      solution: 'total = 0\ni = 1\nwhile i <= 3:\n    total += i\n    i += 1',
    },
    {
      hint: 'Double x while it stays below 8; stop before the next doubling.',
      solution: 'x = 1\nwhile x < 8:\n    x *= 2',
    },
    {
      hint: 'Increment c until it reaches 5.',
      solution: 'c = 0\nwhile c < 5:\n    c += 1',
    },
    {
      hint: 'Append i to lst and increment i until i reaches 3.',
      solution: 'lst = []\ni = 0\nwhile i < 3:\n    lst.append(i)\n    i += 1',
    },
    {
      hint: 'Use while True with break when i equals 3.',
      solution: 'i = 0\nfound = False\nwhile True:\n    i += 1\n    if i == 3:\n        found = True\n        break',
    },
    {
      hint: 'Apply one Collatz step: odd n becomes 3*n+1 (5 → 16).',
      solution: 'n = 5\nn = n // 2 if n % 2 == 0 else 3 * n + 1',
    },
    {
      hint: 'Euclid\'s algorithm: swap a,b until b becomes 0.',
      solution: 'a, b = 12, 8\nwhile b:\n    a, b = b, a % b',
    },
    {
      hint: 'while False never enters the loop body.',
      solution: 'ran = 0\nwhile False:\n    ran = 1',
    },
    {
      hint: 'Set choice to "q" inside the loop so it exits after one pass.',
      solution: 'choice = ""\nwhile choice != "q":\n    choice = "q"',
    },
  ],
  for_loops: [
    {
      hint: 'Loop over the list and print each element.',
      solution: 'for x in [1, 2, 3]:\n    print(x)',
    },
    {
      hint: 'Increment total once per character in the string.',
      solution: 'total = 0\nfor c in "ab":\n    total += 1',
    },
    {
      hint: 'Add each number to s in the loop.',
      solution: 's = 0\nfor n in [1, 2, 3, 4]:\n    s += n',
    },
    {
      hint: 'enumerate gives index i and value x; the last i for two items is 1.',
      solution: 'for i, x in enumerate(["a", "b"]):\n    pass',
    },
    {
      hint: 'Append n when n % 2 == 0 for n in range(5).',
      solution: 'ev = []\nfor n in range(5):\n    if n % 2 == 0:\n        ev.append(n)',
    },
    {
      hint: 'Two nested range(2) loops run 2 × 2 = 4 times.',
      solution: 'c = 0\nfor i in range(2):\n    for j in range(2):\n        c += 1',
    },
    {
      hint: 'zip pairs elements; break after the first pair gives s = 1 + 3.',
      solution: 'for a, b in zip([1, 2], [3, 4]):\n    s = a + b\n    break',
    },
    {
      hint: 'for/else runs else when the loop finishes without break.',
      solution: 'done = False\nfor x in []:\n    pass\nelse:\n    done = True',
    },
    {
      hint: 'Iterating a dict yields its keys by default.',
      solution: 'for k in {"a": 1}:\n    pass',
    },
    {
      hint: 'reversed() iterates from last to first; break after first gives x = 3.',
      solution: 'for x in reversed([1, 2, 3]):\n    break',
    },
  ],
  range_function: [
    {
      hint: 'range(5) produces 0 through 4; wrap in list() to see values.',
      solution: 'r = list(range(5))',
    },
    {
      hint: 'range(2, 5) starts at 2 and stops before 5.',
      solution: 'r = list(range(2, 5))',
    },
    {
      hint: 'The third argument is the step: 0, 3, 6, 9.',
      solution: 'r = list(range(0, 10, 3))',
    },
    {
      hint: 'sum() adds all numbers from range(1, 6).',
      solution: 's = sum(range(1, 6))',
    },
    {
      hint: 'Use a negative step to count down: range(5, 0, -1).',
      solution: 'r = list(range(5, 0, -1))',
    },
    {
      hint: 'len(range(10)) counts how many numbers the range produces.',
      solution: 'n = len(range(10))',
    },
    {
      hint: 'When start equals stop, range is empty.',
      solution: 'r = list(range(3, 3))',
    },
    {
      hint: 'Step -2 counts down by twos from 10.',
      solution: 'r = list(range(10, 0, -2))',
    },
    {
      hint: 'Square each index i from range(3).',
      solution: 'sq = []\nfor i in range(3):\n    sq.append(i * i)',
    },
    {
      hint: 'range(3) is a range object, not a list.',
      solution: 't = type(range(3))',
    },
  ],
  break_continue: [
    {
      hint: 'Break when i reaches 3 before counting that iteration.',
      solution: 'c = 0\nfor i in range(10):\n    if i == 3:\n        break\n    c += 1',
    },
    {
      hint: 'Use continue to skip one number; skipping 4 from 1..5 leaves sum 11.',
      solution: 's = 0\nfor i in range(1, 6):\n    if i == 4:\n        continue\n    s += i',
    },
    {
      hint: 'Break as soon as you find a value greater than 5.',
      solution: 'found = None\nfor x in [2, 7, 4]:\n    if x > 5:\n        found = x\n        break',
    },
    {
      hint: 'continue skips even numbers; append only odds.',
      solution: 'o = []\nfor i in range(1, 6):\n    if i % 2 == 0:\n        continue\n    o.append(i)',
    },
    {
      hint: 'break exits a while True loop immediately.',
      solution: 'ok = False\nwhile True:\n    ok = True\n    break',
    },
    {
      hint: 'break inside the inner loop only; outer still runs twice.',
      solution: 'outer = 0\nfor i in range(2):\n    outer += 1\n    for j in range(5):\n        break',
    },
    {
      hint: 'Trial division: if n % d == 0, n is not prime — break early.',
      solution: 'n = 17\nprime = True\nfor d in range(2, int(n ** 0.5) + 1):\n    if n % d == 0:\n        prime = False\n        break',
    },
    {
      hint: 'continue skips spaces when counting characters.',
      solution: 'c = 0\nfor ch in "a b":\n    if ch == " ":\n        continue\n    c += 1',
    },
    {
      hint: 'Without break, for/else runs the else clause.',
      solution: 'ran = False\nfor x in [1]:\n    pass\nelse:\n    ran = True',
    },
    {
      hint: 'Start idx at -1; break only when the target is found.',
      solution: 'idx = -1\nfor i, x in enumerate([1, 2, 3]):\n    if x == 9:\n        idx = i\n        break',
    },
  ],
  nested_loops: [
    {
      hint: 'Multiply outer and inner loop counts: 2 × 3 = 6.',
      solution: 'c = 0\nfor i in range(2):\n    for j in range(3):\n        c += 1',
    },
    {
      hint: 'Print only when i == 0 to get the first row of pairs.',
      solution: 'for i in range(2):\n    for j in range(2):\n        if i == 0:\n            print(f"{i},{j}")',
    },
    {
      hint: 'Append 2 * x for each x in range(4).',
      solution: 'row = []\nfor x in range(4):\n    row.append(2 * x)',
    },
    {
      hint: 'Loop over each row, then each value in the row.',
      solution: 'm = [[1, 2], [3, 4]]\ns = 0\nfor row in m:\n    for v in row:\n        s += v',
    },
    {
      hint: 'Print i asterisks on line i using "*" * i.',
      solution: 'for i in range(1, 4):\n    print("*" * i)',
    },
    {
      hint: 'Use i < j to avoid duplicate pairs; 2 + 3 equals 5.',
      solution: 'pair = None\nnums = [1, 2, 3]\nfor i, a in enumerate(nums):\n    for j, b in enumerate(nums):\n        if i < j and a + b == 5:\n            pair = (a, b)',
    },
    {
      hint: 'Transpose: row c gets m[r][c] for each row r.',
      solution: 'm = [[1, 2], [3, 4]]\nt = [[m[r][c] for r in range(2)] for c in range(2)]',
    },
    {
      hint: 'One bubble pass means a single swap; break after fixing the first pair.',
      solution: 'a = [3, 1, 2]\nfor i in range(len(a) - 1):\n    if a[i] > a[i + 1]:\n        a[i], a[i + 1] = a[i + 1], a[i]\n        break',
    },
    {
      hint: 'Count every cell in a 3×4 grid with nested loops.',
      solution: 'n = 0\nfor r in range(3):\n    for c in range(4):\n        n += 1',
    },
    {
      hint: 'Set a flag in the inner loop, then break the outer loop too.',
      solution: 'stopped = False\nfor i in range(5):\n    for j in range(5):\n        stopped = True\n        break\n    if stopped:\n        break',
    },
  ],
  match_case: [
    {
      hint: 'match compares the value; case 1 runs when it equals 1.',
      solution: 'match 1:\n    case 1:\n        x = "one"',
    },
    {
      hint: 'case _ is the wildcard that matches anything.',
      solution: 'match 0:\n    case _:\n        y = "def"',
    },
    {
      hint: 'Use | to match multiple alternatives in one case.',
      solution: 'match "a":\n    case "a" | "b":\n        ok = True',
    },
    {
      hint: 'List patterns capture elements into variables x and y.',
      solution: 'match [1, 2]:\n    case [x, y]:\n        s = x + y',
    },
    {
      hint: 'Add if x > 0 as a guard on the case pattern.',
      solution: 'n = 5\nmatch n:\n    case x if x > 0:\n        pos = True',
    },
    {
      hint: 'case 1 | 2 | 3 matches any of those literals.',
      solution: 'match 3:\n    case 1 | 2 | 3:\n        hit = True',
    },
    {
      hint: 'Tuple patterns bind captured values to variables.',
      solution: 'match (1, "x"):\n    case (1, s):\n        v = s',
    },
    {
      hint: 'case _ matches any value, including strings.',
      solution: 'done = False\nmatch "hi":\n    case _:\n        done = True',
    },
    {
      hint: 'None matches case _ since no specific case exists.',
      solution: 'match None:\n    case _:\n        t = "nil"',
    },
    {
      hint: '*rest captures remaining list elements; h is the first item.',
      solution: 'match [1, 2, 3]:\n    case [h, *rest]:\n        head = h',
    },
  ],
  loop_patterns: [
    {
      hint: 'Increment a counter for each item in the list.',
      solution: 'c = 0\nfor _ in [1, 2, 3]:\n    c += 1',
    },
    {
      hint: 'Track the largest value seen so far in the loop.',
      solution: 'm = float("-inf")\nfor x in [3, 9, 2]:\n    if x > m:\n        m = x',
    },
    {
      hint: 'Append items that pass the condition x > 0.',
      solution: 'p = []\nfor x in [-1, 2, -3, 4]:\n    if x > 0:\n        p.append(x)',
    },
    {
      hint: 'Build a new list with each element doubled.',
      solution: 'd = []\nfor x in [1, 2, 3]:\n    d.append(x * 2)',
    },
    {
      hint: 'Use enumerate and break when you find the target value.',
      solution: 'i = -1\nfor j, v in enumerate([2, 5, 7]):\n    if v == 5:\n        i = j\n        break',
    },
    {
      hint: 'Increment c each time x equals 2.',
      solution: 'c = 0\nfor x in [1, 2, 2, 3]:\n    if x == 2:\n        c += 1',
    },
    {
      hint: 'Sum all values, then divide by len(nums) for the average.',
      solution: 'nums = [2, 4, 6]\ns = 0\nfor n in nums:\n    s += n\navg = s / len(nums)',
    },
    {
      hint: 'Check divisibility by 3 and 5 separately and concatenate strings.',
      solution: 'n = 15\nout = ""\nif n % 3 == 0:\n    out += "Fizz"\nif n % 5 == 0:\n    out += "Buzz"',
    },
    {
      hint: 'Prepend each item to build the list in reverse order.',
      solution: 'r = []\nfor x in [1, 2, 3]:\n    r = [x] + r',
    },
    {
      hint: 'Compare all unique pairs with nested loops and track the max sum.',
      solution: 'best = 0\na = [1, 4, 2]\nfor i in range(len(a)):\n    for j in range(i + 1, len(a)):\n        best = max(best, a[i] + a[j])',
    },
  ],
}

/** @param {string} topicId @param {number} index */
export function helpFor(topicId, index) {
  const items = CONTROL_FLOW_HELP[topicId]
  if (!items?.[index]) {
    throw new Error(`Missing help for ${topicId} challenge index ${index}`)
  }
  return items[index]
}
