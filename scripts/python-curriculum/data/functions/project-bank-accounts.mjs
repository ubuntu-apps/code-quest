// Functions project: Bank accounts. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeProject("hard", {
  id: "proj_bank_accounts",
  title: "Bank accounts",
  paragraphs: [
    "Build a tiny bank. The accounts live in one dict, mapping each name to a balance, and every operation is a function that takes that dict as its first argument. No globals: whoever calls a function hands it the accounts to work on.",
    "The operations: `open_account(accounts, name, deposit=0)`, `deposit(accounts, name, amount)`, `withdraw(accounts, name, amount)` (refused when there isn't enough money), `transfer(accounts, from_name, to_name, amount)` (built from `withdraw` and `deposit`), and `statement(accounts)`, which returns the accounts as lines of text, richest first.",
    "The last step reads a list of text commands and returns what the bank says back. For example:",
    "```\nopen Ana 100        ->  Opened Ana\nopen Ben            ->  Opened Ben\ntransfer Ana Ben 30 ->  Moved $30.00 from Ana to Ben\nwithdraw Ben 50     ->  Not enough money\nshow                ->  Ana: $70.00\n                        Ben: $30.00\n                        Total: $100.00\n```",
    "It uses everything in this quest: parameters and return values, a default value, functions calling functions, a lambda as a sort key, and passing data in rather than reaching for globals.",
  ],
  sandboxCode: "def open_account(accounts, name, deposit=0):\n    if name in accounts:\n        return False\n    accounts[name] = deposit\n    return True\n\ndef deposit(accounts, name, amount):\n    accounts[name] += amount\n    return accounts[name]\n\nbank = {}\nopen_account(bank, \"Ana\", 100)\nopen_account(bank, \"Ben\")\nprint(deposit(bank, \"Ben\", 25), bank)",
  sandboxSnippets: [
    snippet("Functions change the dict they get", "def add_one(counts, key):\n    counts[key] = counts.get(key, 0) + 1\n\nc = {}\nadd_one(c, \"x\")\nadd_one(c, \"x\")\nprint(c)"),
    snippet("Return True or False", "def can_afford(balance, price):\n    return price <= balance\n\nprint(can_afford(50, 20), can_afford(50, 80))"),
    snippet("Sort by balance, then name", "accounts = {\"Cleo\": 40, \"Ana\": 70, \"Ben\": 40}\nprint(sorted(accounts, key=lambda n: (-accounts[n], n)))"),
  ],
  challenges: [
    task("easy", "Open an account", {
      prompt: "Define `open_account(accounts, name, deposit=0)` that adds `name` with `deposit` as its balance and returns `True`, or returns `False` (and changes nothing) if the name is already taken.",
      hint: "`if name in accounts: return False`. Otherwise `accounts[name] = deposit` and `return True`.",
      solution: "def open_account(accounts, name, deposit=0):\n    if name in accounts:\n        return False\n    accounts[name] = deposit\n    return True\n",
      tests: [
        ["Opens with a deposit", "(lambda b: (open_account(b, \"Ana\", 100), b))({}) == (True, {\"Ana\": 100})"],
        ["Opens with 0 by default", "(lambda b: (open_account(b, \"Ben\"), b))({}) == (True, {\"Ben\": 0})"],
        ["Refuses a taken name", "(lambda b: (open_account(b, \"Ana\", 5), b))({\"Ana\": 100}) == (False, {\"Ana\": 100})"],
      ],
    }),
    task("easy", "Deposit", {
      prompt: "Define `deposit(accounts, name, amount)` that adds `amount` to the account and returns the new balance.",
      hint: "`accounts[name] += amount`, then `return accounts[name]`.",
      solution: "def deposit(accounts, name, amount):\n    accounts[name] += amount\n    return accounts[name]\n",
      tests: [
        ["Returns the new balance", "deposit({\"Ana\": 100}, \"Ana\", 50) == 150"],
        ["Changes the dict", "(lambda b: (deposit(b, \"Ana\", 5), b)[1])({\"Ana\": 1}) == {\"Ana\": 6}"],
      ],
    }),
    task("medium", "Withdraw", {
      prompt: "Define `withdraw(accounts, name, amount)`: if the account has enough, take the money out and return `True`; otherwise change nothing and return `False`.",
      hint: "`if amount > accounts[name]: return False`, then subtract and `return True`.",
      solution: "def withdraw(accounts, name, amount):\n    if amount > accounts[name]:\n        return False\n    accounts[name] -= amount\n    return True\n",
      tests: [
        ["Enough money", "(lambda b: (withdraw(b, \"Ana\", 30), b))({\"Ana\": 100}) == (True, {\"Ana\": 70})"],
        ["Not enough", "(lambda b: (withdraw(b, \"Ana\", 300), b))({\"Ana\": 100}) == (False, {\"Ana\": 100})"],
        ["All of it", "(lambda b: (withdraw(b, \"Ana\", 100), b))({\"Ana\": 100}) == (True, {\"Ana\": 0})"],
      ],
    }),
    task("medium", "Transfer", {
      prompt: "Define `transfer(accounts, from_name, to_name, amount)` using `withdraw` and `deposit`: move the money and return `True`, or return `False` (changing nothing) if `from_name` hasn't enough.",
      starter: "def open_account(accounts, name, deposit=0):\n    if name in accounts:\n        return False\n    accounts[name] = deposit\n    return True\n\ndef deposit(accounts, name, amount):\n    accounts[name] += amount\n    return accounts[name]\n\ndef withdraw(accounts, name, amount):\n    if amount > accounts[name]:\n        return False\n    accounts[name] -= amount\n    return True\n\n",
      hint: "`if not withdraw(...): return False`. Then `deposit(...)` and `return True`.",
      solution: "def open_account(accounts, name, deposit=0):\n    if name in accounts:\n        return False\n    accounts[name] = deposit\n    return True\n\ndef deposit(accounts, name, amount):\n    accounts[name] += amount\n    return accounts[name]\n\ndef withdraw(accounts, name, amount):\n    if amount > accounts[name]:\n        return False\n    accounts[name] -= amount\n    return True\n\ndef transfer(accounts, from_name, to_name, amount):\n    if not withdraw(accounts, from_name, amount):\n        return False\n    deposit(accounts, to_name, amount)\n    return True\n",
      tests: [
        ["A transfer", "(lambda b: (transfer(b, \"Ana\", \"Ben\", 30), b))({\"Ana\": 100, \"Ben\": 0}) == (True, {\"Ana\": 70, \"Ben\": 30})"],
        ["Not enough", "(lambda b: (transfer(b, \"Ben\", \"Ana\", 30), b))({\"Ana\": 100, \"Ben\": 0}) == (False, {\"Ana\": 100, \"Ben\": 0})"],
      ],
    }),
    task("hard", "A statement", {
      prompt: "Define `statement(accounts)` that returns a list of lines: one per account, like `Ana: $70.00`, from the highest balance to the lowest (names A to Z on a tie), then `Total: $100.00`.",
      starter: "def open_account(accounts, name, deposit=0):\n    if name in accounts:\n        return False\n    accounts[name] = deposit\n    return True\n\ndef deposit(accounts, name, amount):\n    accounts[name] += amount\n    return accounts[name]\n\ndef withdraw(accounts, name, amount):\n    if amount > accounts[name]:\n        return False\n    accounts[name] -= amount\n    return True\n\ndef transfer(accounts, from_name, to_name, amount):\n    if not withdraw(accounts, from_name, amount):\n        return False\n    deposit(accounts, to_name, amount)\n    return True\n\n",
      hint: "Sort the names with `key=lambda n: (-accounts[n], n)`. Format with `:.2f`, and add the total line at the end.",
      solution: "def open_account(accounts, name, deposit=0):\n    if name in accounts:\n        return False\n    accounts[name] = deposit\n    return True\n\ndef deposit(accounts, name, amount):\n    accounts[name] += amount\n    return accounts[name]\n\ndef withdraw(accounts, name, amount):\n    if amount > accounts[name]:\n        return False\n    accounts[name] -= amount\n    return True\n\ndef transfer(accounts, from_name, to_name, amount):\n    if not withdraw(accounts, from_name, amount):\n        return False\n    deposit(accounts, to_name, amount)\n    return True\n\ndef statement(accounts):\n    lines = []\n    for name in sorted(accounts, key=lambda n: (-accounts[n], n)):\n        lines.append(f\"{name}: ${accounts[name]:.2f}\")\n    lines.append(f\"Total: ${sum(accounts.values()):.2f}\")\n    return lines\n",
      tests: [
        ["Three accounts", "statement({\"Cleo\": 40, \"Ana\": 70, \"Ben\": 40}) == [\"Ana: $70.00\", \"Ben: $40.00\", \"Cleo: $40.00\", \"Total: $150.00\"]"],
        ["No accounts", "statement({}) == [\"Total: $0.00\"]"],
      ],
    }),
    task("expert", "Run the bank", {
      keepProgress: true,
      prompt: "Define `run(accounts, commands)` that carries out each command and returns the list of replies (see the intro): `open NAME [AMOUNT]`, `deposit NAME AMOUNT` (reply `Ana: $150.00`), `withdraw NAME AMOUNT` (the new balance, or `Not enough money`), `transfer FROM TO AMOUNT`, and `show` (the statement lines). A name that doesn't exist gives `No account NAME`, and anything else `Unknown command`.",
      starter: "def open_account(accounts, name, deposit=0):\n    if name in accounts:\n        return False\n    accounts[name] = deposit\n    return True\n\ndef deposit(accounts, name, amount):\n    accounts[name] += amount\n    return accounts[name]\n\ndef withdraw(accounts, name, amount):\n    if amount > accounts[name]:\n        return False\n    accounts[name] -= amount\n    return True\n\ndef transfer(accounts, from_name, to_name, amount):\n    if not withdraw(accounts, from_name, amount):\n        return False\n    deposit(accounts, to_name, amount)\n    return True\n\ndef statement(accounts):\n    lines = []\n    for name in sorted(accounts, key=lambda n: (-accounts[n], n)):\n        lines.append(f\"{name}: ${accounts[name]:.2f}\")\n    lines.append(f\"Total: ${sum(accounts.values()):.2f}\")\n    return lines\n\n",
      hint: "Split each command into its parts. Check the action with `if`/`elif`; for the money commands, check the names exist before calling your functions, and turn the amount into a float.",
      solution: "def open_account(accounts, name, deposit=0):\n    if name in accounts:\n        return False\n    accounts[name] = deposit\n    return True\n\ndef deposit(accounts, name, amount):\n    accounts[name] += amount\n    return accounts[name]\n\ndef withdraw(accounts, name, amount):\n    if amount > accounts[name]:\n        return False\n    accounts[name] -= amount\n    return True\n\ndef transfer(accounts, from_name, to_name, amount):\n    if not withdraw(accounts, from_name, amount):\n        return False\n    deposit(accounts, to_name, amount)\n    return True\n\ndef statement(accounts):\n    lines = []\n    for name in sorted(accounts, key=lambda n: (-accounts[n], n)):\n        lines.append(f\"{name}: ${accounts[name]:.2f}\")\n    lines.append(f\"Total: ${sum(accounts.values()):.2f}\")\n    return lines\n\ndef run(accounts, commands):\n    output = []\n    for command in commands:\n        parts = command.split()\n        action, args = parts[0], parts[1:]\n        if action == \"open\":\n            amount = float(args[1]) if len(args) > 1 else 0\n            if open_account(accounts, args[0], amount):\n                output.append(f\"Opened {args[0]}\")\n            else:\n                output.append(f\"{args[0]} already exists\")\n        elif action == \"show\":\n            output.extend(statement(accounts))\n        elif action in (\"deposit\", \"withdraw\", \"transfer\"):\n            names = args[:-1]\n            missing = [n for n in names if n not in accounts]\n            if missing:\n                output.append(f\"No account {missing[0]}\")\n                continue\n            amount = float(args[-1])\n            if action == \"deposit\":\n                balance = deposit(accounts, names[0], amount)\n                output.append(f\"{names[0]}: ${balance:.2f}\")\n            elif action == \"withdraw\":\n                if withdraw(accounts, names[0], amount):\n                    output.append(f\"{names[0]}: ${accounts[names[0]]:.2f}\")\n                else:\n                    output.append(\"Not enough money\")\n            elif transfer(accounts, names[0], names[1], amount):\n                output.append(f\"Moved ${amount:.2f} from {names[0]} to {names[1]}\")\n            else:\n                output.append(\"Not enough money\")\n        else:\n            output.append(\"Unknown command\")\n    return output\n",
      tests: [
        ["The intro example", "run({}, [\"open Ana 100\", \"open Ben\", \"transfer Ana Ben 30\", \"withdraw Ben 50\", \"show\"]) == [\"Opened Ana\", \"Opened Ben\", \"Moved $30.00 from Ana to Ben\", \"Not enough money\", \"Ana: $70.00\", \"Ben: $30.00\", \"Total: $100.00\"]"],
        ["Deposits, withdrawals and mistakes", "run({\"Ana\": 100}, [\"deposit Ana 50\", \"withdraw Ana 20\", \"open Ana\", \"deposit Zoe 5\", \"dance\"]) == [\"Ana: $150.00\", \"Ana: $130.00\", \"Ana already exists\", \"No account Zoe\", \"Unknown command\"]"],
      ],
    }),
  ],
  questions: [
    mc("Why does every function take `accounts` as its first argument?", ["Python requires a dict", "So the caller hands over the data and no globals are needed", "To make the names longer", "Dicts can't be global"], 1),
    mc("What does `open_account(bank, \"Ben\")` use as Ben's balance?", ["Nothing: it raises an error", "`None`", "The default, 0", "100"], 2),
    mc("Why build `transfer` from `withdraw` and `deposit`?", ["The rules (like \"not enough money\") live in one place and are reused", "It is shorter to type", "Functions must call other functions", "It is faster"], 0),
    mc("`withdraw` returns `True` or `False`. What does that let the caller do?", ["Nothing", "Print automatically", "Skip the dict", "Decide what to do next, such as reply `Not enough money`"], 3),
    qShort("What does `f\"${70:.2f}\"` give?", "$70.00"),
    mc("What does `key=lambda n: (-accounts[n], n)` sort by?", ["Name only", "Balance from high to low, then name", "Balance from low to high", "The order they were opened"], 1),
  ],
})
