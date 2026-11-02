// Data structures topic: Dict and set comprehensions. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "dict_set_comprehensions",
  title: "Dict and set comprehensions",
  paragraphs: [
    "Comprehensions aren't just for lists. A **dict comprehension** builds a dictionary in one line: curly braces, and a `key: value` pair at the front, `{key: value for item in items}`.",
    "```\nwords = [\"tea\", \"cake\", \"biscuit\"]\nlengths = {w: len(w) for w in words}\nprint(lengths)   # {'tea': 3, 'cake': 4, 'biscuit': 7}\nsquares = {n: n ** 2 for n in range(1, 4)}\nprint(squares)   # {1: 1, 2: 4, 3: 9}\n```",
    "Most dict comprehensions loop over another dict's `items()` or over two lists joined with `zip`. To change every value, keep the key and work out a new value: `{item: price * 2 for item, price in prices.items()}`.",
    "An `if` at the end filters, exactly as in a list comprehension, so only some pairs make it into the new dict.",
    "```\nstock = {\"apple\": 12, \"pear\": 0, \"plum\": 9, \"fig\": 0}\navailable = {item: n for item, n in stock.items() if n > 0}\nprint(available)   # {'apple': 12, 'plum': 9}\n```",
    "Swapping keys and values is a one-liner: `{value: key for key, value in d.items()}`. Watch out if two keys share a value: a dict can hold each key only once, so the later pair wins and one entry disappears.",
    "A **set comprehension** uses curly braces with a single expression, no colon: `{w.lower() for w in words}`. As with any set, duplicates disappear, so it's a quick way to collect the different values of something.",
    "```\nnames = [\"Ana\", \"ben\", \"Amir\", \"Bea\", \"cleo\"]\ninitials = {name[0].upper() for name in names}\nprint(sorted(initials))   # ['A', 'B', 'C']\n```",
    "Two more details. A dict's `keys()` behave like a set, so `a.keys() & b.keys()` gives the keys two dicts share. And there is no tuple comprehension: round brackets make a *generator*, a list-like thing that produces its items one at a time, so wrap it in `tuple(...)` if you need a tuple.",
  ],
  sandboxCode: "prices = {\"tea\": 2.5, \"cake\": 3.75, \"jam\": 4.0}\nprint({item: price * 2 for item, price in prices.items()})\nprint({item: price for item, price in prices.items() if price < 4})\n\nwords = [\"Red\", \"blue\", \"RED\", \"green\", \"Blue\"]\nprint(sorted({w.lower() for w in words}))",
  sandboxSnippets: [
    snippet("Build a dict", "print({n: n * 10 for n in range(1, 4)})"),
    snippet("From two lists", "names = [\"Ana\", \"Ben\"]\nscores = [91, 78]\nprint({name: score for name, score in zip(names, scores)})"),
    snippet("Filter a dict", "scores = {\"Ana\": 91, \"Ben\": 48, \"Cleo\": 85}\nprint({n: s for n, s in scores.items() if s >= 50})"),
    snippet("Swap keys and values", "codes = {\"NO\": \"Norway\", \"JP\": \"Japan\"}\nprint({country: code for code, country in codes.items()})"),
    snippet("A set comprehension", "text = \"the cat and the hat\"\nprint(sorted({len(w) for w in text.split()}))"),
  ],
  readMore: { label: "Python tutorial: dictionaries", url: "https://docs.python.org/3/tutorial/datastructures.html#dictionaries", source: "Python docs" },
  challenges: [
    task("easy", "Word lengths", {
      prompt: "Set `lengths` to a dict that maps each word to its length, with a dict comprehension.",
      starter: "words = [\"tea\", \"cake\", \"biscuit\"]\n",
      hint: "`{w: len(w) for w in words}`.",
      solution: "words = [\"tea\", \"cake\", \"biscuit\"]\nlengths = {w: len(w) for w in words}",
      tests: [
        ["lengths is right", "lengths == {\"tea\": 3, \"cake\": 4, \"biscuit\": 7}"],
      ],
    }),
    task("easy", "Squares", {
      prompt: "Set `squares` to a dict that maps each number from 1 to 5 to its square.",
      hint: "`{n: n ** 2 for n in range(1, 6)}`.",
      solution: "squares = {n: n ** 2 for n in range(1, 6)}",
      tests: [
        ["squares is right", "squares == {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}"],
      ],
    }),
    task("easy", "Different colours", {
      prompt: "Set `colours` to the set of different colours in `words`, all in lowercase, with a set comprehension.",
      starter: "words = [\"Red\", \"blue\", \"RED\", \"green\", \"Blue\"]\n",
      hint: "Curly braces, no colon: `{w.lower() for w in words}`.",
      solution: "words = [\"Red\", \"blue\", \"RED\", \"green\", \"Blue\"]\ncolours = {w.lower() for w in words}",
      tests: [
        ["colours is right", "colours == {\"red\", \"blue\", \"green\"}"],
      ],
    }),
    task("medium", "A price rise", {
      prompt: "Set `new_prices` to `prices` with every price 10% higher, rounded to 2 decimals.",
      starter: "prices = {\"tea\": 2.5, \"cake\": 3.8, \"jam\": 4.0}\n",
      hint: "Keep each key and work out a new value: `{item: round(price * 1.1, 2) for item, price in prices.items()}`.",
      solution: "prices = {\"tea\": 2.5, \"cake\": 3.8, \"jam\": 4.0}\nnew_prices = {item: round(price * 1.1, 2) for item, price in prices.items()}",
      tests: [
        ["new_prices is right", "new_prices == {\"tea\": 2.75, \"cake\": 4.18, \"jam\": 4.4}"],
      ],
    }),
    task("medium", "In stock", {
      prompt: "Set `available` to only the items in `stock` that have more than 0 left.",
      starter: "stock = {\"apple\": 12, \"pear\": 0, \"plum\": 9, \"fig\": 0}\n",
      hint: "Filter with an `if` at the end: `... for item, n in stock.items() if n > 0}`.",
      solution: "stock = {\"apple\": 12, \"pear\": 0, \"plum\": 9, \"fig\": 0}\navailable = {item: n for item, n in stock.items() if n > 0}",
      tests: [
        ["available is right", "available == {\"apple\": 12, \"plum\": 9}"],
      ],
    }),
    task("medium", "Ages from birth years", {
      prompt: "Set `ages` to a dict mapping each name to their age in 2026, using `zip` and a dict comprehension.",
      starter: "names = [\"Ana\", \"Ben\", \"Cleo\"]\nborn = [1996, 2001, 1985]\n",
      hint: "`{name: 2026 - year for name, year in zip(names, born)}`.",
      solution: "names = [\"Ana\", \"Ben\", \"Cleo\"]\nborn = [1996, 2001, 1985]\nages = {name: 2026 - year for name, year in zip(names, born)}",
      tests: [
        ["ages is right", "ages == {\"Ana\": 30, \"Ben\": 25, \"Cleo\": 41}"],
      ],
    }),
    task("hard", "The other way round", {
      prompt: "Set `code_for` to `countries` with the keys and values swapped.",
      starter: "countries = {\"NO\": \"Norway\", \"JP\": \"Japan\", \"KE\": \"Kenya\"}\n",
      hint: "`{name: code for code, name in countries.items()}`.",
      solution: "countries = {\"NO\": \"Norway\", \"JP\": \"Japan\", \"KE\": \"Kenya\"}\ncode_for = {name: code for code, name in countries.items()}",
      tests: [
        ["code_for is right", "code_for == {\"Norway\": \"NO\", \"Japan\": \"JP\", \"Kenya\": \"KE\"}"],
      ],
    }),
    task("hard", "Initials", {
      prompt: "Set `initials` to the set of different first letters of the names, in capitals.",
      starter: "names = [\"Ana\", \"ben\", \"Amir\", \"Bea\", \"cleo\"]\n",
      hint: "`{name[0].upper() for name in names}`.",
      solution: "names = [\"Ana\", \"ben\", \"Amir\", \"Bea\", \"cleo\"]\ninitials = {name[0].upper() for name in names}",
      tests: [
        ["initials is right", "initials == {\"A\", \"B\", \"C\"}"],
      ],
    }),
    task("expert", "Count the letters", {
      prompt: "Set `counts` to a dict mapping each different letter of `word` to how often it appears, in one comprehension.",
      starter: "word = \"banana\"\n",
      hint: "Loop over the different letters, `set(word)`, and use `word.count(ch)` for the value.",
      solution: "word = \"banana\"\ncounts = {ch: word.count(ch) for ch in set(word)}",
      tests: [
        ["counts is right", "counts == {\"b\": 1, \"a\": 3, \"n\": 2}"],
      ],
    }),
    task("expert", "Both shops", {
      prompt: "Set `combined` to the total stock of every item that **both** shops sell. Loop over the keys they share.",
      starter: "shop_a = {\"apple\": 5, \"pear\": 2, \"fig\": 7}\nshop_b = {\"pear\": 4, \"fig\": 1, \"kiwi\": 3}\n",
      hint: "The shared keys are `shop_a.keys() & shop_b.keys()`. For each, add the two amounts.",
      solution: "shop_a = {\"apple\": 5, \"pear\": 2, \"fig\": 7}\nshop_b = {\"pear\": 4, \"fig\": 1, \"kiwi\": 3}\ncombined = {item: shop_a[item] + shop_b[item] for item in shop_a.keys() & shop_b.keys()}",
      tests: [
        ["combined is right", "combined == {\"pear\": 6, \"fig\": 8}"],
      ],
    }),
  ],
  questions: [
    mc("What does `{n: n * 10 for n in range(2)}` give?", ["`{0: 0, 1: 10}`", "`[0, 10]`", "`{0, 10}`", "`{1: 10, 2: 20}`"], 0, "`key: value` in braces builds a dictionary, one pair per item."),
    mc("How does a set comprehension differ from a dict comprehension?", ["It uses square brackets", "It has no colon: one expression, not a key and a value", "It can't filter", "There is no difference"], 1, "With a colon, the braces build a dict; with one expression and no colon, they build a set."),
    mc("Which keeps only the pairs with a positive value?", ["`{k: v > 0 for k, v in d.items()}`", "`{k: v for k in d if v > 0}`", "`[k for k, v in d.items() if v > 0]`", "`{k: v for k, v in d.items() if v > 0}`"], 3, "Loop over `.items()` to get both key and value, then filter with an `if` at the end."),
    mc("What happens when you swap keys and values and two keys share a value?", ["A `KeyError`", "Both are kept", "The later pair wins and one entry disappears", "The dict becomes a list"], 2, "Keys must be unique, so when two old keys share a value, the later one overwrites the earlier."),
    qShort("What is `len({w.lower() for w in [\"A\", \"a\", \"B\"]})`? (a number)", "2", "After `.lower()` the words are `a`, `a` and `b`, and a set keeps only `a` and `b`."),
    mc("What does `(x for x in range(3))` make?", ["A tuple", "A generator", "A list", "A set"], 1, "Round brackets make a generator expression, which yields values one at a time."),
    mc("What does `a.keys() & b.keys()` give?", ["The keys both dicts have", "All the keys", "The values", "An error"], 0, "`.keys()` views behave like sets, so `&` gives the keys in both."),
    mc("What is `{w: len(w) for w in [\"hi\", \"hey\"]}[\"hey\"]`?", ["`2`", "`\"hey\"`", "A `KeyError`", "`3`"], 3, "The comprehension maps each word to its length, and \"hey\" has 3 letters."),
    mc("What is `{x % 3 for x in range(10)}`?", ["`{0, 1, 2, ..., 9}`", "`{3, 6, 9}`", "`{0, 1, 2}`", "`[0, 1, 2]`"], 2, "Remainders when dividing by 3 can only be 0, 1 or 2, and a set keeps each once."),
    mc("Where does the filtering `if` go in a dict comprehension?", ["At the end", "Before the key", "Between the key and the value", "It isn't allowed"], 0, "As in a list comprehension, the filter goes after the `for` part."),
  ],
})
