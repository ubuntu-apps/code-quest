// Capstone: A to-do list engine. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, prints, qShort, same, snippet, task, throwsWhen } from '../_builders.mjs'

const TASK = 'class Task {\n  constructor(id, title) {\n    this.id = id\n    this.title = title\n    this.done = false\n    this.tags = []\n    this.due = null\n  }\n  toggle() {\n    this.done = !this.done\n  }\n  toString() {\n    return `[${this.done ? "x" : " "}] ${this.title}`\n  }\n}\n'
const PARSE = 'function parseTask(text) {\n  const tags = [...text.matchAll(/#(\\w+)/g)].map((m) => m[1])\n  const due = text.match(/due:(\\d{4}-\\d{2}-\\d{2})/)?.[1] ?? null\n  const title = text.replace(/#\\w+|due:\\S+/g, "").replace(/\\s+/g, " ").trim()\n  return { title, tags, due }\n}\n'
const LIST = 'class TaskList {\n  constructor() {\n    this.tasks = []\n    this.nextId = 1\n  }\n  add(text) {\n    const { title, tags, due } = parseTask(text)\n    const task = new Task(this.nextId++, title)\n    task.tags = tags\n    task.due = due\n    this.tasks.push(task)\n    return task\n  }\n  find(id) {\n    const task = this.tasks.find((t) => t.id === id)\n    if (!task) throw new Error(`No task ${id}`)\n    return task\n  }\n  remove(id) {\n    this.find(id)\n    this.tasks = this.tasks.filter((t) => t.id !== id)\n  }\n  active() {\n    return this.tasks.filter((t) => !t.done)\n  }\n  completed() {\n    return this.tasks.filter((t) => t.done)\n  }\n}\n'
const BASE = TASK + PARSE + LIST
const SAMPLE = 'const list = new TaskList()\nlist.add("Buy milk #home due:2026-11-10")\nlist.add("Send report #work due:2026-11-12")\nlist.add("Book dentist due:2026-12-01")\nlist.add("Read a book #home")\nlist.find(2).toggle()\n'

export default makeTopic({
  id: 'capstone_tasks',
  title: 'A to-do list engine',
  paragraphs: [
    'Every to-do app has the same engine inside: tasks that can be added, ticked off, tagged, given a due date, saved and shown. In this capstone you build that engine in plain JavaScript, piece by piece. A web page or phone app could then sit on top of it.',
    'It uses most of the course: **classes** for tasks and the list, **regular expressions** to read quick-add text like `Buy milk #home due:2026-11-20`, **array methods** for the views, **JSON** to save and load, and **dates** in `YYYY-MM-DD` text for what is due.',
    '```text\nOverdue\n  [ ] Buy milk #home (2026-11-10)\nToday\n  [x] Send report #work\nLater\n  [ ] Book dentist (2026-12-01)\nNo date\n  [ ] Read a book #home\n```',
    'Each challenge gives you the code built so far, so you can focus on the new piece. Keep the habits from the last quests: small methods that do one thing, data that can be saved as JSON, and the showing kept apart from the logic.',
    'A tip for working on a bigger program: after each piece, try it on a tiny example in the sandbox before moving on. Bugs are easy to find in ten new lines and hard to find in a hundred.',
  ],
  sandboxCode: TASK + '\nconst t = new Task(1, "Water the plants")\nconsole.log(t.toString())\nt.toggle()\nconsole.log(t.toString())',
  sandboxSnippets: [
    snippet('Quick-add text', 'const text = "Buy milk #home #shop due:2026-11-20"\nconsole.log([...text.matchAll(/#(\\w+)/g)].map((m) => m[1]))\nconsole.log(text.match(/due:(\\S+)/)[1])'),
    snippet('Dates as text', 'console.log("2026-11-10" < "2026-11-12", "2026-12-01" > "2026-11-12")'),
  ],
  challenges: [
    task('easy', 'A task', {
      prompt: 'Write `class Task` with a constructor `(id, title)` that sets `id`, `title`, `done` (`false`), `tags` (`[]`) and `due` (`null`), a method `toggle()` that flips `done`, and `toString()` that gives `[ ] TITLE`, or `[x] TITLE` when done.',
      hint: '`return `[${this.done ? "x" : " "}] ${this.title}``.',
      solution: TASK,
      tests: [['A new task', '(() => { const t = new Task(1, "Walk"); return t.id === 1 && t.done === false && t.due === null && Array.isArray(t.tags) && t.toString() === "[ ] Walk" })()'], ['Toggle', '(() => { const t = new Task(1, "Walk"); t.toggle(); const a = t.toString(); t.toggle(); return a === "[x] Walk" && t.done === false })()']],
    }),
    task('easy', 'Read quick-add text', {
      prompt: 'Write `parseTask(text)` that returns `{ title, tags, due }`: the tags are the words after `#` (without it), `due` the date after `due:` (or `null`), and the title is the rest, with single spaces and no spaces at the ends.',
      hint: '`matchAll(/#(\\w+)/g)` for tags, `match(/due:(\\d{4}-\\d{2}-\\d{2})/)` for the date, then remove both from the text with `replace(/#\\w+|due:\\S+/g, "")` and tidy the spaces.',
      solution: PARSE,
      tests: [['Everything', same('parseTask("Buy milk #home due:2026-11-20 #shop")', '{ title: "Buy milk", tags: ["home", "shop"], due: "2026-11-20" }')], ['Just a title', same('parseTask("  Call   Mum ")', '{ title: "Call Mum", tags: [], due: null }')]],
    }),
    task('easy', 'Add tasks', {
      prompt: 'Write `class TaskList` with `tasks` (empty) and `nextId` (1), and `add(text)` that parses the text, makes a `Task` with the next id, sets its `tags` and `due`, adds it and returns it.',
      starter: TASK + PARSE,
      hint: '`const task = new Task(this.nextId++, title)`, then set `tags` and `due`.',
      solution: TASK + PARSE + 'class TaskList {\n  constructor() {\n    this.tasks = []\n    this.nextId = 1\n  }\n  add(text) {\n    const { title, tags, due } = parseTask(text)\n    const task = new Task(this.nextId++, title)\n    task.tags = tags\n    task.due = due\n    this.tasks.push(task)\n    return task\n  }\n}',
      tests: [['Ids go up', '(() => { const l = new TaskList(); const a = l.add("One"); const b = l.add("Two #x"); return a.id === 1 && b.id === 2 && l.tasks.length === 2 && b.tags[0] === "x" && b instanceof Task })()']],
    }),
    task('medium', 'Find and remove', {
      prompt: 'Add `find(id)` (throws `Error("No task ID")` if there is none) and `remove(id)` (also throws for an unknown id) to `TaskList`.',
      starter: TASK + PARSE + 'class TaskList {\n  constructor() {\n    this.tasks = []\n    this.nextId = 1\n  }\n  add(text) {\n    const { title, tags, due } = parseTask(text)\n    const task = new Task(this.nextId++, title)\n    task.tags = tags\n    task.due = due\n    this.tasks.push(task)\n    return task\n  }\n}\n',
      hint: '`find` uses `this.tasks.find`; `remove` calls `this.find(id)` first (so it throws), then filters.',
      solution: BASE.replace('  active() {\n    return this.tasks.filter((t) => !t.done)\n  }\n  completed() {\n    return this.tasks.filter((t) => t.done)\n  }\n', ''),
      tests: [['Find', '(() => { const l = new TaskList(); l.add("A"); l.add("B"); return l.find(2).title === "B" })()'], ['Remove', '(() => { const l = new TaskList(); l.add("A"); l.add("B"); l.remove(1); return l.tasks.map((t) => t.title).join() === "B" })()'], ['Unknown id', throwsWhen('new TaskList().remove(9)', 'No task 9')]],
    }),
    task('medium', 'Views', {
      prompt: 'Add `active()` and `completed()` (the tasks not done and done), and `summary()` giving text like `1 of 4 done`.',
      starter: BASE.replace('  active() {\n    return this.tasks.filter((t) => !t.done)\n  }\n  completed() {\n    return this.tasks.filter((t) => t.done)\n  }\n', ''),
      hint: 'Two `filter`s, and `` `${this.completed().length} of ${this.tasks.length} done` ``.',
      solution: BASE.replace('  completed() {\n    return this.tasks.filter((t) => t.done)\n  }\n', '  completed() {\n    return this.tasks.filter((t) => t.done)\n  }\n  summary() {\n    return `${this.completed().length} of ${this.tasks.length} done`\n  }\n'),
      tests: [['Views', `(() => { ${SAMPLE.replace(/\n/g, '; ')} return list.active().length === 3 && list.completed()[0].title === "Send report" })()`], ['Summary', `(() => { ${SAMPLE.replace(/\n/g, '; ')} return list.summary() === "1 of 4 done" })()`]],
    }),
    task('medium', 'By tag', {
      prompt: 'Write `byTag(list)` that returns an object of tag → the titles of the tasks with that tag, in the order added.',
      starter: BASE + SAMPLE,
      hint: 'Loop over `list.tasks` and their `tags`; push the title into `groups[tag]` (starting with `[]`).',
      solution: BASE + SAMPLE + 'function byTag(list) {\n  const groups = {}\n  for (const t of list.tasks) {\n    for (const tag of t.tags) {\n      groups[tag] = [...(groups[tag] ?? []), t.title]\n    }\n  }\n  return groups\n}',
      tests: [['The sample', same('byTag(list)', '{ home: ["Buy milk", "Read a book"], work: ["Send report"] }')], ['Empty', same('byTag(new TaskList())', '{}')]],
    }),
    task('hard', 'What is overdue', {
      prompt: 'Write `overdue(list, today)` that returns the titles of tasks that are **not done** and have a due date before `today` (`YYYY-MM-DD` text), oldest due date first.',
      starter: BASE + SAMPLE,
      hint: 'Filter on `!t.done && t.due !== null && t.due < today`, sort by `due` with `localeCompare`, map to titles.',
      solution: BASE + SAMPLE + 'function overdue(list, today) {\n  return list.tasks\n    .filter((t) => !t.done && t.due !== null && t.due < today)\n    .toSorted((a, b) => a.due.localeCompare(b.due))\n    .map((t) => t.title)\n}',
      tests: [['12 November', same('overdue(list, "2026-11-12")', '["Buy milk"]')], ['Later', same('overdue(list, "2026-12-25")', '["Buy milk", "Book dentist"]')]],
    }),
    task('hard', 'Save and load', {
      prompt: 'Add `toJSON()` to `TaskList` returning `{ nextId, tasks }` (tasks as plain objects), and a static `fromJSON(text)` that builds a working `TaskList` back from that JSON text, with real `Task` objects.',
      starter: BASE,
      hint: '`toJSON() { return { nextId: this.nextId, tasks: this.tasks.map((t) => ({ ...t })) } }`. In `fromJSON`, parse, make a list, and `Object.assign(new Task(d.id, d.title), d)` for each task.',
      solution: BASE.replace('  active() {', '  toJSON() {\n    return { nextId: this.nextId, tasks: this.tasks.map((t) => ({ ...t })) }\n  }\n  static fromJSON(text) {\n    const data = JSON.parse(text)\n    const list = new TaskList()\n    list.nextId = data.nextId\n    list.tasks = data.tasks.map((d) => Object.assign(new Task(d.id, d.title), d))\n    return list\n  }\n  active() {'),
      tests: [['Round trip', `(() => { ${SAMPLE.replace(/\n/g, '; ')} const back = TaskList.fromJSON(JSON.stringify(list)); return back instanceof TaskList && back.tasks.length === 4 && back.tasks[1] instanceof Task && back.tasks[1].done === true && back.tasks[0].due === "2026-11-10" && back.find(4).tags[0] === "home" })()`], ['Ids carry on', `(() => { ${SAMPLE.replace(/\n/g, '; ')} const back = TaskList.fromJSON(JSON.stringify(list)); return back.add("New").id === 5 })()`]],
    }),
    task('expert', 'Undo', {
      prompt: 'Write `class UndoableList extends TaskList` that remembers the state before every `add`, `remove` and `toggle(id)` (a new method that toggles a task), and has `undo()`, which goes back one step (and does nothing if there is nothing to undo). Save states as JSON text.',
      starter: BASE,
      hint: 'Keep `this.history = []`. A `snapshot()` pushes `JSON.stringify({ nextId: this.nextId, tasks: this.tasks })`. Call it at the start of `add`, `remove` and `toggle`. `undo()` pops the last one and rebuilds `nextId` and `tasks` (as `Task`s) from it.',
      solution: BASE + 'class UndoableList extends TaskList {\n  constructor() {\n    super()\n    this.history = []\n  }\n  snapshot() {\n    this.history.push(JSON.stringify({ nextId: this.nextId, tasks: this.tasks }))\n  }\n  add(text) {\n    this.snapshot()\n    return super.add(text)\n  }\n  remove(id) {\n    this.find(id)\n    this.snapshot()\n    super.remove(id)\n  }\n  toggle(id) {\n    const task = this.find(id)\n    this.snapshot()\n    task.toggle()\n  }\n  undo() {\n    const last = this.history.pop()\n    if (last === undefined) return\n    const data = JSON.parse(last)\n    this.nextId = data.nextId\n    this.tasks = data.tasks.map((d) => Object.assign(new Task(d.id, d.title), d))\n  }\n}',
      tests: [['Undo a toggle', '(() => { const l = new UndoableList(); l.add("A"); l.toggle(1); l.undo(); return l.find(1).done === false && l.find(1) instanceof Task })()'], ['Undo a remove, then an add', '(() => { const l = new UndoableList(); l.add("A"); l.add("B"); l.remove(1); l.undo(); const back = l.tasks.length === 2; l.undo(); return back && l.tasks.length === 1 && l.add("C").id === 2 })()'], ['Nothing to undo', '(() => { const l = new UndoableList(); l.undo(); return l.tasks.length === 0 })()']],
    }),
    task('expert', 'Show the list', {
      prompt: 'Write `render(list, today)` that shows the tasks in four groups, in this order: `Overdue` (not done, due before today), `Today` (due today), `Later` (due after today) and `No date`, skipping empty groups. A task that is done and was due before today is left out. Each task is shown indented by two spaces as its `toString()`, then its tags as ` #tag`, then ` (DUE)` except in the Today group. Within a group, keep the order added. Show the sample list for `2026-11-12`.',
      starter: BASE + SAMPLE,
      hint: 'Work out a group name for each task with a small function. Then for each group name in order, filter the tasks, and show the heading and the lines if there are any.',
      solution: BASE + SAMPLE + 'function render(list, today) {\n  const groupOf = (t) => {\n    if (t.due === null) return "No date"\n    if (t.due === today) return "Today"\n    if (t.due < today) return t.done ? null : "Overdue"\n    return "Later"\n  }\n  for (const group of ["Overdue", "Today", "Later", "No date"]) {\n    const tasks = list.tasks.filter((t) => groupOf(t) === group)\n    if (tasks.length === 0) continue\n    console.log(group)\n    for (const t of tasks) {\n      const tags = t.tags.map((tag) => ` #${tag}`).join("")\n      const due = t.due && group !== "Today" ? ` (${t.due})` : ""\n      console.log(`  ${t}${tags}${due}`)\n    }\n  }\n}\nrender(list, "2026-11-12")',
      tests: [['Shows the list', prints('Overdue', '  [ ] Buy milk #home (2026-11-10)', 'Today', '  [x] Send report #work', 'Later', '  [ ] Book dentist (2026-12-01)', 'No date', '  [ ] Read a book #home')]],
      alt: (starter) => starter.replace('list.find(2).toggle()', 'list.find(1).toggle()'),
    }),
  ],
  questions: [
    mc('Why does `parseTask` live in its own function rather than inside `add`?', ['It can be tested alone and used elsewhere, like a search box', 'Classes can\'t use regexes', 'It makes add faster', 'It doesn\'t matter at all'], 0, 'Small pieces with one job.'),
    mc('Why are due dates kept as `YYYY-MM-DD` text?', ['They compare and sort correctly as text, and save to JSON as they are', 'Date objects can\'t be compared', 'Text uses less memory', 'JSON can\'t hold text'], 0, 'No time zones to worry about either.'),
    mc('After `JSON.parse`, are the tasks `Task` objects?', ['No: plain objects, until you rebuild them', 'Yes, always', 'Only the first one', 'They are text'], 0, 'fromJSON makes them Tasks again.'),
    mc('What does `Object.assign(new Task(1, "A"), { done: true })` give?', ['A Task with `done` set to true', 'A plain object', 'An error', 'A copy of the class'], 0, 'It copies the fields onto the new instance.'),
    mc('What does this show?\n```\nconst text = "Pay rent #home due:2026-12-01"\nconsole.log(text.match(/due:(\\S+)/)?.[1] ?? null)\n```', ['`2026-12-01`', '`null`', '`due:2026-12-01`', 'An error'], 0, 'Group 1 holds the date.', { code: 'const text = "Pay rent #home due:2026-12-01"\nconsole.log(text.match(/due:(\\S+)/)?.[1] ?? null)', output: '2026-12-01' }),
    mc('How does the undo work?', ['It saves the state before each change, and goes back to the last saved one', 'It reverses the last line of code', 'It asks the user', 'JavaScript remembers every change'], 0, 'A stack of snapshots.'),
    mc('Why does `render` show text rather than return it, while the other functions return values?', ['Showing is kept at the edge; everything else stays testable logic', 'It is a mistake', 'Classes can\'t return text', 'console.log is faster'], 0, 'Logic in the middle, input and output at the edges.'),
    mc('What does `"2026-11-10" < "2026-11-12"` give?', ['`true`', '`false`', 'An error', '`NaN`'], 0, 'Text compared character by character.', { code: 'console.log("2026-11-10" < "2026-11-12")', output: 'true' }),
    qShort('Which keyword makes `UndoableList` build on `TaskList`?', 'extends', 'class UndoableList extends TaskList'),
  ],
})
