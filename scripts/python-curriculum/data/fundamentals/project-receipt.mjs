// Fundamentals project: Receipt calculator. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, qShort, snippet, task, typedInput } from '../_builders.mjs'

export default makeProject("hard", {
  id: "proj_receipt_calculator",
  title: "Receipt calculator",
  paragraphs: [
    "The biggest program in Fundamentals: a receipt for a café order. It asks for an item, its price, the quantity and a tip percentage, then prints a neatly aligned receipt. It uses every lesson so far.",
    "When the user types `Latte`, `4.5`, `3` and `20`, the finished program shows (the first four lines are the questions and answers):",
    "```\nItem: Latte\nPrice: 4.5\nQuantity: 3\nTip %: 20\n------------------------\n3 x Latte          13.50\nTip (20%)           2.70\n------------------------\nTotal              16.20\n```",
    "Every receipt line is 24 characters wide: a label left-aligned in 16 characters, then an amount right-aligned in 8 characters with 2 decimals. In an f-string, that's `f\"{label:<16}{amount:>8.2f}\"`. The dashed lines are `\"-\" * 24`.",
    "Read the price as a float and the quantity and tip as ints. The subtotal is price times quantity, the tip is the subtotal times the tip percentage divided by 100, and the total is the subtotal plus the tip.",
    "As before, build it in steps; the last challenge puts everything together. Type four answers in the Input box to try the sandbox.",
  ],
  sandboxCode: "item = input(\"Item: \")\nprice = float(input(\"Price: \"))\nquantity = int(input(\"Quantity: \"))\nsubtotal = price * quantity\nlabel = f\"{quantity} x {item}\"\nprint(f\"{label:<16}{subtotal:>8.2f}\")",
  sandboxSnippets: [
    snippet("Aligned columns", "print(f\"{'3 x Latte':<16}{13.5:>8.2f}\")\nprint(f\"{'Total':<16}{16.2:>8.2f}\")\nprint(\"-\" * 24)"),
    snippet("Tip maths", "subtotal = 13.5\ntip_percent = 20\ntip = subtotal * tip_percent / 100\nprint(tip, subtotal + tip)"),
  ],
  challenges: [
    task("easy", "Read the order", {
      prompt: "Ask `Item: `, `Price: ` and `Quantity: ` (in that order), storing the answers in `item` (text), `price` (a float) and `quantity` (an int). The check types `Latte`, `4.5` and `3`.",
      hint: "Three `input` calls. Wrap the price in `float(...)` and the quantity in `int(...)`.",
      solution: "item = input(\"Item: \")\nprice = float(input(\"Price: \"))\nquantity = int(input(\"Quantity: \"))",
      setup: typedInput("Latte", "4.5", "3"),
      tests: [
        ["item is Latte", "item == \"Latte\""],
        ["price is 4.5", "price == 4.5"],
        ["quantity is the int 3", "quantity == 3 and isinstance(quantity, int)"],
      ],
    }),
    task("easy", "The subtotal", {
      prompt: "Set `subtotal` to the price times the quantity.",
      starter: "price = 4.5\nquantity = 3\n",
      hint: "`subtotal = price * quantity`.",
      solution: "price = 4.5\nquantity = 3\nsubtotal = price * quantity",
      tests: [
        ["subtotal is 13.5", "subtotal == 13.5"],
      ],
    }),
    task("medium", "Add the tip", {
      prompt: "Set `tip` to `tip_percent` percent of the subtotal, and `total` to the subtotal plus the tip.",
      starter: "subtotal = 13.5\ntip_percent = 20\n",
      hint: "`tip = subtotal * tip_percent / 100`, then `total = subtotal + tip`.",
      solution: "subtotal = 13.5\ntip_percent = 20\ntip = subtotal * tip_percent / 100\ntotal = subtotal + tip",
      tests: [
        ["tip is 2.7", "abs(tip - 2.7) < 1e-9"],
        ["total is 16.2", "abs(total - 16.2) < 1e-9"],
      ],
    }),
    task("medium", "One receipt line", {
      prompt: "Set `line` to `label` left-aligned in 16 characters followed by `amount` right-aligned in 8 characters with 2 decimals. It should be `3 x Latte          13.50`.",
      starter: "label = \"3 x Latte\"\namount = 13.5\n",
      hint: "`line = f\"{label:<16}{amount:>8.2f}\"`.",
      solution: "label = \"3 x Latte\"\namount = 13.5\nline = f\"{label:<16}{amount:>8.2f}\"",
      tests: [
        ["line is 24 characters", "len(line) == 24"],
        ["line is right", "line == \"3 x Latte          13.50\""],
      ],
    }),
    task("hard", "Print the receipt", {
      prompt: "All the values are ready. Print the five receipt lines exactly as in the lesson: a dashed line, the item line, the tip line, another dashed line and the total.",
      starter: "item = \"Latte\"\nquantity = 3\nsubtotal = 13.5\ntip_percent = 20\ntip = 2.7\ntotal = 16.2\n",
      hint: "Build each label first, such as `f\"{quantity} x {item}\"` and `f\"Tip ({tip_percent}%)\"`, then print it with the amount using `:<16` and `:>8.2f`.",
      solution: "item = \"Latte\"\nquantity = 3\nsubtotal = 13.5\ntip_percent = 20\ntip = 2.7\ntotal = 16.2\nprint(\"-\" * 24)\nitem_label = f\"{quantity} x {item}\"\ntip_label = f\"Tip ({tip_percent}%)\"\nprint(f\"{item_label:<16}{subtotal:>8.2f}\")\nprint(f\"{tip_label:<16}{tip:>8.2f}\")\nprint(\"-\" * 24)\nprint(f\"{'Total':<16}{total:>8.2f}\")",
      tests: [
        ["Prints the receipt", "_cq_stdout.strip().splitlines() == ['------------------------', '3 x Latte          13.50', 'Tip (20%)           2.70', '------------------------', 'Total              16.20']"],
      ],
    }),
    task("hard", "The whole program", {
      prompt: "Put it all together: ask `Item: `, `Price: `, `Quantity: ` and `Tip %: `, do the maths, and print the receipt. The check types `Muffin`, `2.25`, `4` and `10`.",
      hint: "Combine the earlier steps in order: read, process (subtotal, tip, total), then print the five receipt lines.",
      solution: "item = input(\"Item: \")\nprice = float(input(\"Price: \"))\nquantity = int(input(\"Quantity: \"))\ntip_percent = int(input(\"Tip %: \"))\n\nsubtotal = price * quantity\ntip = subtotal * tip_percent / 100\ntotal = subtotal + tip\n\nitem_label = f\"{quantity} x {item}\"\ntip_label = f\"Tip ({tip_percent}%)\"\nprint(\"-\" * 24)\nprint(f\"{item_label:<16}{subtotal:>8.2f}\")\nprint(f\"{tip_label:<16}{tip:>8.2f}\")\nprint(\"-\" * 24)\nprint(f\"{'Total':<16}{total:>8.2f}\")",
      setup: typedInput("Muffin", "2.25", "4", "10"),
      tests: [
        ["Prints the receipt", "_cq_stdout.strip().splitlines()[-5:] == ['------------------------', '4 x Muffin          9.00', 'Tip (10%)           0.90', '------------------------', 'Total               9.90']"],
      ],
    }),
  ],
  questions: [
    mc("Why read the quantity with `int()` but the price with `float()`?", ["Quantities are whole numbers, but prices can have decimals","`int()` is faster","`float()` can't read whole numbers","There is no reason"], 0),
    mc("What does `f\"{'Tea':<6}|\"` give?", ["`   Tea|`", "`Tea   |`", "`Tea|`", "`Tea      |`"], 1),
    mc("How many characters long is `f\"{2.7:>8.2f}\"`?", ["`4`","`8`","`6`","`2`"], 1),
    mc("What is a 20% tip on 13.50?", ["`0.27`","`27.00`","`2.70`","`20.00`"], 2),
    mc("What does `\"-\" * 24` give?", ["`\"-24\"`","An error","One dash","24 dashes"], 3),
    qShort("What does `f\"{9.9:.2f}\"` show?", "9.90"),
  ],
})
