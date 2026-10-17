// Data structures project: Inventory tracker. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, qShort, snippet, task, typedInput } from '../_builders.mjs'

export default makeProject("hard", {
  id: "proj_inventory_tracker",
  title: "Inventory tracker",
  paragraphs: [
    "Build a small stock-keeping program for a shop. It keeps an **inventory**, a dict mapping each item to how many are in stock, and understands typed commands until the user types `quit`. It brings together everything from this section and the last: dicts, lists, sorting, `split()`, a `while True` loop and `if`/`elif`.",
    "The commands: `add ITEM QTY` adds stock and prints `Added 5 apple`. `remove ITEM QTY` takes stock away and prints `Removed 2 apple`, or `Not enough apple` (changing nothing) when there isn't enough; an item that reaches 0 is deleted. `show` prints every item in alphabetical order, like `apple: 3`, or `Empty` when there's nothing. `quit` prints `Bye!` and stops, and anything else prints `Unknown command`.",
    "A session looks like this (the lines starting with `>` are what the user typed):",
    "```\n> add apple 5\nAdded 5 apple\n> add pear 2\nAdded 2 pear\n> remove pear 3\nNot enough pear\n> remove apple 2\nRemoved 2 apple\n> show\napple: 3\npear: 2\n> quit\nBye!\n```",
    "`command.split()` breaks a command into its parts: `\"add apple 5\".split()` is `[\"add\", \"apple\", \"5\"]`, so `parts[0]` is the action and the quantity needs `int()`. Check the number of parts before using them, so a short command such as `add apple` prints `Unknown command` instead of crashing.",
    "Build it in steps: read a command, add stock, remove stock safely, show the stock, a low-stock warning, and finally the whole program. To try the sandbox, type one command per line in the Input box.",
  ],
  sandboxCode: "inventory = {}\nwhile True:\n    parts = input(\"> \").split()\n    if parts[0] == \"quit\":\n        print(\"Bye!\")\n        break\n    if parts[0] == \"add\":\n        item, qty = parts[1], int(parts[2])\n        inventory[item] = inventory.get(item, 0) + qty\n    print(inventory)",
  sandboxSnippets: [
    snippet("Split a command", "parts = \"add apple 5\".split()\nprint(parts, parts[0], int(parts[2]))\naction, item, qty = parts\nprint(action, item, qty)"),
    snippet("Add with get", "inventory = {\"apple\": 3}\nfor item, qty in [(\"apple\", 5), (\"pear\", 2)]:\n    inventory[item] = inventory.get(item, 0) + qty\nprint(inventory)"),
    snippet("Delete at zero", "inventory = {\"apple\": 2, \"pear\": 4}\ninventory[\"apple\"] -= 2\nif inventory[\"apple\"] == 0:\n    del inventory[\"apple\"]\nprint(inventory)"),
  ],
  challenges: [
    task("easy", "Read a command", {
      prompt: "Split `command` into `action`, `item` and `qty`, with `qty` as an int.",
      starter: "command = \"add apple 5\"\n",
      hint: "Unpack the split: `action, item, qty = command.split()`, then `qty = int(qty)`.",
      solution: "command = \"add apple 5\"\naction, item, qty = command.split()\nqty = int(qty)",
      tests: [
        ["action is add", "action == \"add\""],
        ["item is apple", "item == \"apple\""],
        ["qty is the number 5", "qty == 5 and isinstance(qty, int)"],
      ],
    }),
    task("easy", "Add stock", {
      prompt: "Apply both deliveries to `inventory`: add the quantity to an item already in stock, or add the item if it's new.",
      starter: "inventory = {\"apple\": 3}\ndeliveries = [(\"apple\", 5), (\"pear\", 2)]\n",
      hint: "For each `item, qty` in `deliveries`: `inventory[item] = inventory.get(item, 0) + qty`.",
      solution: "inventory = {\"apple\": 3}\ndeliveries = [(\"apple\", 5), (\"pear\", 2)]\nfor item, qty in deliveries:\n    inventory[item] = inventory.get(item, 0) + qty",
      tests: [
        ["inventory is right", "inventory == {\"apple\": 8, \"pear\": 2}"],
      ],
    }),
    task("medium", "Remove stock safely", {
      prompt: "Apply the removals in order. If there isn't enough of an item, print `Not enough <item>` and change nothing; delete an item when it reaches 0.",
      starter: "inventory = {\"apple\": 8, \"pear\": 2}\nremovals = [(\"apple\", 3), (\"pear\", 5), (\"pear\", 2)]\n",
      hint: "For each removal: `if inventory.get(item, 0) < qty:` print the message; otherwise subtract, then `del inventory[item]` if it is 0.",
      solution: "inventory = {\"apple\": 8, \"pear\": 2}\nremovals = [(\"apple\", 3), (\"pear\", 5), (\"pear\", 2)]\nfor item, qty in removals:\n    if inventory.get(item, 0) < qty:\n        print(f\"Not enough {item}\")\n    else:\n        inventory[item] -= qty\n        if inventory[item] == 0:\n            del inventory[item]",
      tests: [
        ["inventory is right", "inventory == {\"apple\": 5}"],
        ["Says there were not enough pears", "_cq_stdout.strip() == \"Not enough pear\""],
      ],
    }),
    task("medium", "Show the stock", {
      prompt: "Print every item in alphabetical order, like `apple: 5`, then `Total: 21` with the number of things in stock.",
      starter: "inventory = {\"pear\": 2, \"apple\": 5, \"fig\": 14}\n",
      hint: "Loop over `sorted(inventory)` for the item lines; the total is `sum(inventory.values())`.",
      solution: "inventory = {\"pear\": 2, \"apple\": 5, \"fig\": 14}\nfor item in sorted(inventory):\n    print(f\"{item}: {inventory[item]}\")\nprint(f\"Total: {sum(inventory.values())}\")",
      tests: [
        ["Prints the stock and the total", "_cq_stdout.strip().splitlines() == [\"apple: 5\", \"fig: 14\", \"pear: 2\", \"Total: 21\"]"],
      ],
    }),
    task("hard", "Low stock", {
      prompt: "Print `Low stock: ` followed by the items with fewer than 5 in stock, sorted and separated by commas (`Low stock: kiwi, pear`), or `Low stock: none` when there aren't any.",
      starter: "inventory = {\"pear\": 2, \"apple\": 5, \"kiwi\": 1, \"fig\": 14}\n",
      hint: "Collect them with `sorted(item for item, n in inventory.items() if n < 5)`. `\", \".join(low)` joins them; an empty list is falsy.",
      solution: "inventory = {\"pear\": 2, \"apple\": 5, \"kiwi\": 1, \"fig\": 14}\nlow = sorted(item for item, n in inventory.items() if n < 5)\nif low:\n    print(\"Low stock: \" + \", \".join(low))\nelse:\n    print(\"Low stock: none\")",
      tests: [
        ["Prints the low stock", "_cq_stdout.strip() == \"Low stock: kiwi, pear\""],
      ],
    }),
    task("expert", "The inventory tracker", {
      prompt: "Write the whole program from the lesson: read commands with `input(\"> \")` until `quit`, handling `add`, `remove`, `show` and unknown commands exactly as described. The check types `add apple 5`, `add pear 2`, `remove pear 3`, `remove apple 2`, `show`, `sell fig 1`, `add apple` and `quit`.",
      hint: "`while True:` with `parts = input(\"> \").split()`. Check `parts[0]` with `if`/`elif`; for `add` and `remove`, also check `len(parts) == 3` so a short command falls through to `else`.",
      solution: "inventory = {}\nwhile True:\n    parts = input(\"> \").split()\n    if not parts:\n        continue\n    action = parts[0]\n    if action == \"quit\":\n        print(\"Bye!\")\n        break\n    elif action == \"show\":\n        if not inventory:\n            print(\"Empty\")\n        for item in sorted(inventory):\n            print(f\"{item}: {inventory[item]}\")\n    elif action == \"add\" and len(parts) == 3:\n        item, qty = parts[1], int(parts[2])\n        inventory[item] = inventory.get(item, 0) + qty\n        print(f\"Added {qty} {item}\")\n    elif action == \"remove\" and len(parts) == 3:\n        item, qty = parts[1], int(parts[2])\n        if inventory.get(item, 0) < qty:\n            print(f\"Not enough {item}\")\n        else:\n            inventory[item] -= qty\n            if inventory[item] == 0:\n                del inventory[item]\n            print(f\"Removed {qty} {item}\")\n    else:\n        print(\"Unknown command\")",
      setup: typedInput("add apple 5", "add pear 2", "remove pear 3", "remove apple 2", "show", "sell fig 1", "add apple", "quit"),
      tests: [
        ["Handles every command", "[l for l in _cq_stdout.strip().splitlines() if not l.startswith(\"> \")] == [\"Added 5 apple\", \"Added 2 pear\", \"Not enough pear\", \"Removed 2 apple\", \"apple: 3\", \"pear: 2\", \"Unknown command\", \"Unknown command\", \"Bye!\"]"],
        ["Ends with 3 apples and 2 pears", "inventory == {\"apple\": 3, \"pear\": 2}"],
      ],
    }),
  ],
  questions: [
    mc("What is `\"remove pear 3\".split()`?", ["`\"remove\", \"pear\", \"3\"`", "`[\"remove\", \"pear\", \"3\"]`", "`[\"remove pear 3\"]`", "`(\"remove\", \"pear\", 3)`"], 1),
    mc("Why check `len(parts) == 3` before using `parts[2]`?", ["So a short command doesn't raise an `IndexError`", "It makes the program faster", "`split` needs it", "To sort the parts"], 0),
    mc("Why use `inventory.get(item, 0)` when removing?", ["To add the item", "To sort the inventory", "So an item that isn't in stock counts as 0 instead of raising a `KeyError`", "It deletes the item"], 2),
    mc("Which loop keeps reading commands until `quit`?", ["`for command in input():`", "`while command:` with no input", "`for _ in range(10):`", "`while True:` with a `break` on `quit`"], 3),
    mc("How do you print the items in alphabetical order?", ["Loop over `sorted(inventory)`", "Loop over `inventory.values()`", "Use `inventory.sort()`", "Dicts are always alphabetical"], 0),
    qShort("What does `\", \".join([\"kiwi\", \"pear\"])` give?", "kiwi, pear"),
  ],
})
