// Decisions and loops project: Prime finder. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, qShort, snippet, task, typedInput } from '../_builders.mjs'

export default makeProject("hard", {
  id: "proj_prime_finder",
  title: "Prime finder",
  paragraphs: [
    "A **prime** is a whole number above 1 that divides evenly only by 1 and itself: 2, 3, 5, 7, 11 and so on. 9 isn't prime, because 3 × 3 = 9. Build a program that lists every prime up to a limit the user types. It uses nested loops, `break`, a loop's `else`, and the counting patterns from this quest.",
    "When the user types 50, the finished program shows:",
    "```\nPrimes up to: 50\nPrimes up to 50:\n2 3 5 7 11 13 17 19 23 29 31 37 41 43 47\nFound 15 primes. The largest is 47.\n```",
    "The key test: `n % d == 0` is `True` when `d` divides `n` evenly. To check whether `n` is prime, try every `d` from 2 upwards; as soon as one divides it, `n` isn't prime and you can `break`. If the loop finishes without a `break`, it is. You only need to try divisors up to the square root of `n`, that is while `d * d <= n`, because any bigger divisor pairs with a smaller one you've already tried.",
    "Build it in steps: the divisibility check, reading the limit, a prime test for one number, the faster test, all the primes up to a limit, and finally the whole program. Type a limit in the Input box to try the sandbox.",
  ],
  sandboxCode: "limit = int(input(\"Primes up to: \"))\nfor n in range(2, limit + 1):\n    for d in range(2, n):\n        if n % d == 0:\n            break\n    else:\n        print(n, end=\" \")\nprint()",
  sandboxSnippets: [
    snippet("Does it divide?", "print(12 % 3 == 0)\nprint(12 % 5 == 0)"),
    snippet("Find a divisor", "n = 91\nfor d in range(2, n):\n    if n % d == 0:\n        print(n, \"=\", d, \"x\", n // d)\n        break\nelse:\n    print(n, \"is prime\")"),
    snippet("Up to the square root", "n = 97\nd = 2\nwhile d * d <= n:\n    print(\"trying\", d)\n    d += 1"),
  ],
  challenges: [
    task("easy", "Does it divide?", {
      prompt: "Set `divides` to `True` when `d` divides `n` evenly, and `False` otherwise.",
      starter: "n = 91\nd = 7\n",
      hint: "The remainder is 0 when it divides: `n % d == 0`.",
      solution: "n = 91\nd = 7\ndivides = n % d == 0",
      tests: [
        ["divides is True", "divides is True"],
      ],
    }),
    task("easy", "Read the limit", {
      prompt: "Ask `Primes up to: ` and store the answer in `limit` as a whole number. The check types `30`.",
      hint: "`limit = int(input(\"Primes up to: \"))`.",
      solution: "limit = int(input(\"Primes up to: \"))",
      setup: typedInput("30"),
      tests: [
        ["limit is the number 30", "limit == 30 and isinstance(limit, int)"],
      ],
    }),
    task("medium", "Is it prime?", {
      prompt: "Set `is_prime` to `True` if `n` is prime, by trying every divisor from 2 up to `n - 1`.",
      starter: "n = 91\n",
      hint: "Start with `is_prime = True`. In `for d in range(2, n):`, if `n % d == 0`, set it to `False` and `break`.",
      solution: "n = 91\nis_prime = True\nfor d in range(2, n):\n    if n % d == 0:\n        is_prime = False\n        break",
      tests: [
        ["91 is not prime (7 × 13)", "is_prime is False"],
      ],
    }),
    task("hard", "A faster check", {
      prompt: "Check whether `n` is prime again, but only try divisors while `d * d <= n`, and count the divisors you try in `checks`.",
      starter: "n = 97\nis_prime = True\nchecks = 0\n",
      hint: "Use `d = 2` and `while d * d <= n:`. Add 1 to `checks` each round, `break` on a divisor, and `d += 1` at the end.",
      solution: "n = 97\nis_prime = True\nchecks = 0\nd = 2\nwhile d * d <= n:\n    checks += 1\n    if n % d == 0:\n        is_prime = False\n        break\n    d += 1",
      tests: [
        ["97 is prime", "is_prime is True"],
        ["Tries only 2 to 9", "checks == 8"],
      ],
    }),
    task("hard", "All the primes", {
      prompt: "Build `primes`: the primes up to `limit`, as text with a space between them (`2 3 5 7 11 13 17 19 23 29`).",
      starter: "limit = 30\nprimes = \"\"\n",
      hint: "An outer loop over `range(2, limit + 1)` and the prime check inside it. Use the inner loop's `else:` to add the number when no divisor was found.",
      solution: "limit = 30\nprimes = \"\"\nfor n in range(2, limit + 1):\n    d = 2\n    while d * d <= n:\n        if n % d == 0:\n            break\n        d += 1\n    else:\n        if primes:\n            primes += \" \"\n        primes += str(n)",
      tests: [
        ["primes is right", "primes == \"2 3 5 7 11 13 17 19 23 29\""],
      ],
    }),
    task("expert", "The prime finder", {
      prompt: "The whole program: ask `Primes up to: `, then print `Primes up to 50:`, the primes on one line, and `Found 15 primes. The largest is 47.` The check types `50`.",
      hint: "Count the primes and remember the last one as you build the text. Print the three lines after the loop.",
      solution: "limit = int(input(\"Primes up to: \"))\nprimes = \"\"\ncount = 0\nlargest = 0\nfor n in range(2, limit + 1):\n    d = 2\n    while d * d <= n:\n        if n % d == 0:\n            break\n        d += 1\n    else:\n        if primes:\n            primes += \" \"\n        primes += str(n)\n        count += 1\n        largest = n\nprint(f\"Primes up to {limit}:\")\nprint(primes)\nprint(f\"Found {count} primes. The largest is {largest}.\")",
      setup: typedInput("50"),
      tests: [
        ["Prints the heading", "_cq_stdout.strip().splitlines()[-3] == \"Primes up to 50:\""],
        ["Prints the primes", "_cq_stdout.strip().splitlines()[-2] == \"2 3 5 7 11 13 17 19 23 29 31 37 41 43 47\""],
        ["Prints the summary", "_cq_stdout.strip().splitlines()[-1] == \"Found 15 primes. The largest is 47.\""],
      ],
    }),
  ],
  questions: [
    mc("What does `n % d == 0` tell you?", ["`n` is even", "`d` divides `n` evenly", "`n` is prime", "`d` is bigger than `n`"], 1),
    mc("Is 1 a prime?", ["Yes", "Only in Python", "No, primes start at 2", "It depends on the limit"], 2),
    mc("Why can the check stop once `d * d > n`?", ["Any larger divisor pairs with a smaller one already tried", "Python limits loops", "Bigger numbers are never divisors", "To avoid an error"], 0),
    mc("When does the inner loop's `else:` add the number?", ["After every divisor", "When a divisor was found", "Always", "When the loop ended without `break`, so no divisor was found"], 3),
    qShort("What is `91 % 7`? (a number)", "0"),
    mc("Why `range(2, limit + 1)`?", ["To skip 2", "So the limit itself is included", "Because primes are odd", "range needs three numbers"], 1),
  ],
})
