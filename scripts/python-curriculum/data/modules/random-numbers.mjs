// Modules and packages topic: Random numbers. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "random_module",
  title: "Random numbers",
  paragraphs: [
    "Games, quizzes, simulations and test data all need a bit of chance. The `random` module provides it: random numbers, random picks from a list, and shuffling.",
    "```\nimport random\n\nprint(random.randint(1, 6))      # a whole number from 1 to 6, both ends included\nprint(random.random())           # a float from 0.0 up to (not including) 1.0\nprint(random.uniform(1.5, 2.5))  # a float between 1.5 and 2.5\nprint(random.randrange(0, 10, 2))  # like range: 0, 2, 4, 6 or 8\n```",
    "Unlike `range`, `randint(1, 6)` **includes** the top number, so it really does act like a die. For picking from a list there are four tools: `choice` picks one item, `choices` picks several that may repeat, `sample` picks several different ones, and `shuffle` mixes up a list in place.",
    "```\nimport random\n\ncolours = [\"red\", \"green\", \"blue\", \"gold\"]\nprint(random.choice(colours))           # one colour\nprint(random.choices(colours, k=3))     # three picks, repeats allowed\nprint(random.sample(colours, 2))        # two different colours\nrandom.shuffle(colours)                 # changes the list itself\nprint(colours)\n```",
    "`shuffle` changes the list and returns `None`, like `sort`, so `colours = random.shuffle(colours)` throws your list away. `choices` can also weight the options: `random.choices([\"win\", \"lose\"], weights=[1, 9])` picks `\"lose\"` about nine times as often as `\"win\"`.",
    "The numbers aren't truly random. They come from a formula that starts from a **seed**, and the same seed always gives the same sequence. Setting one with `random.seed(...)` makes a \"random\" program repeat exactly, which is just what you want when testing it or sharing a result.",
    "```\nimport random\n\nrandom.seed(42)\nfirst = [random.randint(1, 6) for _ in range(5)]\nrandom.seed(42)\nsecond = [random.randint(1, 6) for _ in range(5)]\nprint(first == second)   # True: same seed, same rolls\n```",
    "Chance is also a way to estimate things. Roll two dice ten thousand times, count how often they match, and the fraction comes out close to the true 1 in 6. This is called a **simulation**: the more trials, the closer the answer.",
    "Because the sequence can be predicted, `random` must never be used for passwords, security codes or anything secret. The `secrets` module is made for that: `secrets.choice(...)` and `secrets.token_hex(8)` use the operating system's unpredictable randomness.",
  ],
  sandboxCode: "import random\n\ndeck = [rank + suit for suit in \"♠♥\" for rank in \"AKQJ\"]\nrandom.shuffle(deck)\nprint(\"Shuffled:\", deck)\nprint(\"Your hand:\", random.sample(deck, 3))\nprint(\"Dice:\", [random.randint(1, 6) for _ in range(5)])",
  sandboxSnippets: [
    snippet("Roll some dice", "import random\nprint([random.randint(1, 6) for _ in range(10)])"),
    snippet("Weighted choice", "import random\nfrom collections import Counter\nspins = random.choices([\"gold\", \"silver\", \"bronze\"], weights=[1, 3, 6], k=1000)\nprint(Counter(spins))"),
    snippet("A repeatable seed", "import random\nrandom.seed(1)\nprint(random.random())\nrandom.seed(1)\nprint(random.random())"),
    snippet("Secret code", "import secrets\nprint(secrets.token_hex(4))\nprint(secrets.choice(\"ABCDEFGHJK\"))"),
  ],
  readMore: { label: "Python docs: random", url: "https://docs.python.org/3/library/random.html", source: "Python docs" },
  challenges: [
    task("easy", "Roll a die", {
      prompt: "Set `roll` to a random whole number from 1 to 6 using `random.randint`.",
      starter: "roll = 0\n",
      hint: "`import random`, then `random.randint(1, 6)`.",
      solution: "import random\n\nroll = random.randint(1, 6)",
      tests: [
        ["roll is 1 to 6", "roll in [1, 2, 3, 4, 5, 6]"],
        ["It came from random", "any(w in _cq_source for w in (\"randint\", \"randrange\", \"choice\"))"],
      ],
    }),
    task("easy", "Pick a winner", {
      prompt: "Set `winner` to a random name from `names`.",
      starter: "names = [\"Ana\", \"Ben\", \"Cy\", \"Dee\"]\n",
      hint: "`random.choice(names)`.",
      solution: "import random\n\nnames = [\"Ana\", \"Ben\", \"Cy\", \"Dee\"]\nwinner = random.choice(names)",
      tests: [
        ["winner is one of the names", "winner in [\"Ana\", \"Ben\", \"Cy\", \"Dee\"]"],
        ["It came from random", "\"choice\" in _cq_source"],
      ],
    }),
    task("easy", "A random fraction", {
      prompt: "Set `chance` to a random float from 0.0 up to 1.0, and `heads` to `True` if `chance` is below 0.5.",
      hint: "`random.random()`, then compare with `0.5`.",
      solution: "import random\n\nchance = random.random()\nheads = chance < 0.5",
      tests: [
        ["chance is between 0 and 1", "isinstance(chance, float) and 0 <= chance < 1"],
        ["heads matches chance", "heads == (chance < 0.5)"],
      ],
    }),
    task("medium", "Where did the cards go?", {
      prompt: "After this runs, `cards` is `None`. Fix it so `cards` ends up shuffled.",
      starter: "import random\n\ncards = [\"A\", \"K\", \"Q\", \"J\", \"10\", \"9\", \"8\", \"7\"]\ncards = random.shuffle(cards)\n",
      hint: "`shuffle` changes the list and returns `None`. Call it on its own line.",
      solution: "import random\n\ncards = [\"A\", \"K\", \"Q\", \"J\", \"10\", \"9\", \"8\", \"7\"]\nrandom.shuffle(cards)",
      setup: "import random\nrandom.seed(1)\n",
      tests: [
        ["Still the same cards", "sorted(cards) == sorted([\"A\", \"K\", \"Q\", \"J\", \"10\", \"9\", \"8\", \"7\"])"],
        ["In a new order", "cards != [\"A\", \"K\", \"Q\", \"J\", \"10\", \"9\", \"8\", \"7\"]"],
      ],
    }),
    task("medium", "Same every time", {
      prompt: "Set the seed to 7, then set `rolls` to a list of five dice rolls (`randint(1, 6)`), so the program gives the same rolls every run.",
      starter: "import random\n",
      hint: "`random.seed(7)` first, then a comprehension of `random.randint(1, 6)`.",
      solution: "import random\n\nrandom.seed(7)\nrolls = [random.randint(1, 6) for _ in range(5)]",
      tests: [
        ["Five rolls", "len(rolls) == 5"],
        ["The rolls for seed 7", "rolls == (__import__(\"random\").seed(7), [__import__(\"random\").randint(1, 6) for _ in range(5)])[1]"],
      ],
    }),
    task("medium", "Flip a coin", {
      prompt: "Define `flip()` that returns `\"heads\"` or `\"tails\"` at random.",
      starter: "import random\n",
      hint: "`random.choice([\"heads\", \"tails\"])`.",
      solution: "import random\n\ndef flip():\n    return random.choice([\"heads\", \"tails\"])",
      tests: [
        ["Only heads or tails", "set(flip() for _ in range(200)) == {\"heads\", \"tails\"}"],
      ],
    }),
    task("hard", "Raffle draw", {
      prompt: "Define `draw(tickets, n)` that returns `n` **different** random tickets, using `random.sample`.",
      starter: "import random\n",
      hint: "`random.sample(tickets, n)` never picks the same item twice.",
      solution: "import random\n\ndef draw(tickets, n):\n    return random.sample(tickets, n)",
      tests: [
        ["Three different winners", "all(len(set(draw(list(range(10)), 3))) == 3 for _ in range(50))"],
        ["Winners come from the tickets", "set(draw([\"a\", \"b\", \"c\", \"d\"], 2)) <= {\"a\", \"b\", \"c\", \"d\"}"],
        ["All of them", "sorted(draw([\"x\", \"y\", \"z\"], 3)) == [\"x\", \"y\", \"z\"]"],
      ],
    }),
    task("hard", "Prize wheel", {
      prompt: "Define `spin()` that returns `\"gold\"`, `\"silver\"` or `\"bronze\"`, with weights 1, 3 and 6, using `random.choices`.",
      starter: "import random\n",
      hint: "`random.choices([...], weights=[1, 3, 6])` returns a list of one; take `[0]`.",
      solution: "import random\n\ndef spin():\n    return random.choices([\"gold\", \"silver\", \"bronze\"], weights=[1, 3, 6])[0]",
      tests: [
        ["Bronze most, gold least", "(lambda c: c[\"bronze\"] > c[\"silver\"] > c[\"gold\"] > 0)(__import__(\"collections\").Counter(spin() for _ in range(3000)))"],
        ["About 10% gold", "(__import__(\"random\").seed(3), abs(sum(spin() == \"gold\" for _ in range(5000)) / 5000 - 0.1) < 0.03)[1]"],
      ],
    }),
    task("expert", "Simulate doubles", {
      prompt: "Define `estimate_doubles(trials)` that rolls two dice `trials` times and returns the fraction of rolls where both dice match.",
      starter: "import random\n",
      hint: "Count the rolls where `random.randint(1, 6) == random.randint(1, 6)`, then divide by `trials`.",
      solution: "import random\n\ndef estimate_doubles(trials):\n    doubles = 0\n    for _ in range(trials):\n        if random.randint(1, 6) == random.randint(1, 6):\n            doubles += 1\n    return doubles / trials",
      tests: [
        ["Close to 1 in 6", "abs(estimate_doubles(20000) - 1 / 6) < 0.02"],
        ["A fraction", "0 <= estimate_doubles(10) <= 1"],
      ],
    }),
    task("expert", "A secret code", {
      prompt: "Define `make_code(length)` that returns a code of `length` characters, each an uppercase letter or digit, chosen with the `secrets` module (not `random`).",
      starter: "import secrets\nimport string\n",
      hint: "`\"\".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(length))`.",
      solution: "import secrets\nimport string\n\ndef make_code(length):\n    allowed = string.ascii_uppercase + string.digits\n    return \"\".join(secrets.choice(allowed) for _ in range(length))",
      tests: [
        ["The right length", "len(make_code(8)) == 8 and make_code(0) == \"\""],
        ["Only letters and digits", "all(c.isupper() or c.isdigit() for c in make_code(50))"],
        ["Different each time", "len({make_code(10) for _ in range(5)}) == 5"],
        ["Uses secrets", "\"secrets.choice\" in _cq_source or \"from secrets import\" in _cq_source"],
      ],
    }),
  ],
  questions: [
    mc("Which numbers can `random.randint(1, 6)` give?", ["0 to 5", "1 to 6", "1 to 5", "0 to 6"], 1, "`randint` includes both ends of the range."),
    mc("What does `random.shuffle(cards)` return?", ["The shuffled list", "A copy of the list", "`None`, it changes the list itself", "The first card"], 2, "`shuffle` reorders the list in place and returns `None`."),
    mc("Which picks several **different** items from a list?", ["`random.sample`", "`random.choices`", "`random.choice`", "`random.shuffle`"], 0, "`sample` picks without replacement, so no item is picked twice."),
    mc("What does `random.seed(42)` do?", ["Picks 42 numbers", "Makes the numbers truly random", "Limits numbers to 42", "Makes the sequence repeat the same way each run"], 3, "A seed sets where the generator starts, so the same seed gives the same numbers."),
    mc("What can `random.random()` return?", ["A float from 0.0 up to, but not including, 1.0", "A whole number", "Any float", "Only 0 or 1"], 0, "`random()` returns a float that can be 0.0 but is always below 1.0."),
    mc("What should you use for a password or security code?", ["`random.choice`", "The `secrets` module", "`random.seed`", "`random.randint`"], 1, "`secrets` uses an unpredictable source of randomness, meant for security."),
    qShort("`random.choices([\"a\", \"b\"], k=4)` returns a list of how many items? (a number)", "4", "`k` sets how many picks to make, and with `choices` the same item can be picked again."),
    mc("What does `weights=[1, 9]` do in `choices([\"win\", \"lose\"], weights=[1, 9])`?", ["Picks 9 items", "Picks \"win\" 9 times as often", "Picks \"lose\" about 9 times as often as \"win\"", "Nothing"], 2, "Weights set how likely each item is: 1 to 9 here."),
    mc("What does this print?\n\n```\nimport random\nrandom.seed(1)\na = random.randint(1, 100)\nrandom.seed(1)\nb = random.randint(1, 100)\nprint(a == b)\n```", ["`False`", "`True`", "Sometimes `True`, sometimes `False`", "An error"], 1, "The same seed starts the same sequence, so the first number after each `seed(1)` is the same. That is how checks test random code."),
    mc("Why aren't `random` numbers truly random?", ["They come from a formula started from a seed", "They are typed in", "They repeat every 10 numbers", "They are always even"], 0, "They are pseudo-random: a formula makes numbers that look random, starting from a seed."),
  ],
})
