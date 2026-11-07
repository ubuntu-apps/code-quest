// Classes side quest (hard): A tiny battle game. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, same, snippet, task } from '../_builders.mjs'

export default makeProject('hard', {
  id: 'proj_battle',
  title: 'A tiny battle game',
  paragraphs: [
    'Build the heart of a turn-based game. Every character has a name, health and a basic attack; special kinds of character attack in their own way.',
    '- `Character`: `name`, `health` (private, never below 0), `power`; `takeDamage(n)`; getter `isAlive`; `attack(target)` does `power` damage and returns a line like `Ana hits Orc for 5`.\n- `Warrior extends Character`: every third attack is a **critical**, double damage, and the line ends with ` (critical!)`.\n- `Mage extends Character`: has `mana` (starts at 10); an attack costs 4 mana and does `power * 2`; without enough mana it does a basic attack.\n- `battle(a, b)`: they take turns, `a` first, until one falls, returning the lines and who won.',
    'Nothing here is random, so every battle can be checked exactly.',
  ],
  sandboxCode: 'class Character {\n  constructor(name, health, power) {\n    this.name = name\n    this.health = health\n    this.power = power\n  }\n}\nconsole.log(new Character("Ana", 20, 5))',
  sandboxSnippets: [
    snippet('Every third', 'for (let n = 1; n <= 6; n++) console.log(n, n % 3 === 0)'),
  ],
  challenges: [
    task('easy', 'A character', {
      prompt: 'Write `Character(name, health, power)` with a private `#health`, a getter `health`, `takeDamage(n)` (never below 0) and a getter `isAlive`.',
      hint: '`this.#health = Math.max(this.#health - n, 0)`.',
      solution: 'class Character {\n  #health\n  constructor(name, health, power) {\n    this.name = name\n    this.#health = health\n    this.power = power\n  }\n  get health() {\n    return this.#health\n  }\n  takeDamage(n) {\n    this.#health = Math.max(this.#health - n, 0)\n  }\n  get isAlive() {\n    return this.#health > 0\n  }\n}',
      tests: [['Damage', '(() => { const c = new Character("Ana", 20, 5); c.takeDamage(7); return c.health === 13 && c.isAlive })()'], ['Not below 0', '(() => { const c = new Character("Ana", 5, 1); c.takeDamage(50); return c.health === 0 && !c.isAlive })()']],
    }),
    task('easy', 'Attack', {
      prompt: 'Add `attack(target)`, which does `power` damage to `target` and returns `NAME hits TARGET for N`.',
      starter: 'class Character {\n  #health\n  constructor(name, health, power) {\n    this.name = name\n    this.#health = health\n    this.power = power\n  }\n  get health() {\n    return this.#health\n  }\n  takeDamage(n) {\n    this.#health = Math.max(this.#health - n, 0)\n  }\n  get isAlive() {\n    return this.#health > 0\n  }\n}\n',
      hint: '`target.takeDamage(this.power)`, then return the line.',
      solution: 'class Character {\n  #health\n  constructor(name, health, power) {\n    this.name = name\n    this.#health = health\n    this.power = power\n  }\n  get health() {\n    return this.#health\n  }\n  takeDamage(n) {\n    this.#health = Math.max(this.#health - n, 0)\n  }\n  get isAlive() {\n    return this.#health > 0\n  }\n  attack(target) {\n    target.takeDamage(this.power)\n    return `${this.name} hits ${target.name} for ${this.power}`\n  }\n}',
      tests: [['Hits', '(() => { const a = new Character("Ana", 20, 5); const o = new Character("Orc", 12, 3); return a.attack(o) === "Ana hits Orc for 5" && o.health === 7 })()']],
    }),
    task('medium', 'The warrior', {
      prompt: 'Write `Warrior extends Character`: it counts its attacks, and every third one does double damage and ends with ` (critical!)`.',
      starter: 'class Character {\n  #health\n  constructor(name, health, power) {\n    this.name = name\n    this.#health = health\n    this.power = power\n  }\n  get health() {\n    return this.#health\n  }\n  takeDamage(n) {\n    this.#health = Math.max(this.#health - n, 0)\n  }\n  get isAlive() {\n    return this.#health > 0\n  }\n  attack(target) {\n    target.takeDamage(this.power)\n    return `${this.name} hits ${target.name} for ${this.power}`\n  }\n}\n',
      hint: 'Keep `this.attacks = 0`; on a critical, do the damage yourself; otherwise `return super.attack(target)`.',
      solution: 'class Character {\n  #health\n  constructor(name, health, power) {\n    this.name = name\n    this.#health = health\n    this.power = power\n  }\n  get health() {\n    return this.#health\n  }\n  takeDamage(n) {\n    this.#health = Math.max(this.#health - n, 0)\n  }\n  get isAlive() {\n    return this.#health > 0\n  }\n  attack(target) {\n    target.takeDamage(this.power)\n    return `${this.name} hits ${target.name} for ${this.power}`\n  }\n}\nclass Warrior extends Character {\n  constructor(name, health, power) {\n    super(name, health, power)\n    this.attacks = 0\n  }\n  attack(target) {\n    this.attacks++\n    if (this.attacks % 3 !== 0) return super.attack(target)\n    const damage = this.power * 2\n    target.takeDamage(damage)\n    return `${this.name} hits ${target.name} for ${damage} (critical!)`\n  }\n}',
      tests: [['Third is critical', '(() => { const w = new Warrior("Bo", 30, 4); const o = new Character("Orc", 100, 1); const lines = [w.attack(o), w.attack(o), w.attack(o)]; return lines[2] === "Bo hits Orc for 8 (critical!)" && lines[0] === "Bo hits Orc for 4" && o.health === 84 })()'], ['A Character', 'new Warrior("a", 1, 1) instanceof Character']],
    }),
    task('medium', 'The mage', {
      prompt: 'Write `Mage extends Character` with `mana` starting at 10. An attack with 4 or more mana spends 4 and does `power * 2`, returning `NAME casts a spell at TARGET for N`; otherwise it does the basic attack.',
      starter: 'class Character {\n  #health\n  constructor(name, health, power) {\n    this.name = name\n    this.#health = health\n    this.power = power\n  }\n  get health() {\n    return this.#health\n  }\n  takeDamage(n) {\n    this.#health = Math.max(this.#health - n, 0)\n  }\n  get isAlive() {\n    return this.#health > 0\n  }\n  attack(target) {\n    target.takeDamage(this.power)\n    return `${this.name} hits ${target.name} for ${this.power}`\n  }\n}\n',
      hint: '`if (this.mana < 4) return super.attack(target)`.',
      solution: 'class Character {\n  #health\n  constructor(name, health, power) {\n    this.name = name\n    this.#health = health\n    this.power = power\n  }\n  get health() {\n    return this.#health\n  }\n  takeDamage(n) {\n    this.#health = Math.max(this.#health - n, 0)\n  }\n  get isAlive() {\n    return this.#health > 0\n  }\n  attack(target) {\n    target.takeDamage(this.power)\n    return `${this.name} hits ${target.name} for ${this.power}`\n  }\n}\nclass Mage extends Character {\n  constructor(name, health, power) {\n    super(name, health, power)\n    this.mana = 10\n  }\n  attack(target) {\n    if (this.mana < 4) return super.attack(target)\n    this.mana -= 4\n    const damage = this.power * 2\n    target.takeDamage(damage)\n    return `${this.name} casts a spell at ${target.name} for ${damage}`\n  }\n}',
      tests: [['Spells, then basic', '(() => { const m = new Mage("Mo", 15, 3); const o = new Character("Orc", 100, 1); const lines = [m.attack(o), m.attack(o), m.attack(o)]; return lines[0] === "Mo casts a spell at Orc for 6" && lines[2] === "Mo hits Orc for 3" && m.mana === 2 && o.health === 85 })()']],
    }),
    task('hard', 'The battle', {
      prompt: 'Write `battle(a, b)`: `a` attacks `b`, then `b` attacks `a`, and so on, stopping as soon as one is no longer alive. Return `{ lines, winner }`, where `winner` is the survivor\'s name.',
      starter: 'class Character {\n  #health\n  constructor(name, health, power) {\n    this.name = name\n    this.#health = health\n    this.power = power\n  }\n  get health() {\n    return this.#health\n  }\n  takeDamage(n) {\n    this.#health = Math.max(this.#health - n, 0)\n  }\n  get isAlive() {\n    return this.#health > 0\n  }\n  attack(target) {\n    target.takeDamage(this.power)\n    return `${this.name} hits ${target.name} for ${this.power}`\n  }\n}\n',
      hint: 'Keep `attacker` and `defender`; loop while both are alive; swap them after each attack.',
      solution: 'class Character {\n  #health\n  constructor(name, health, power) {\n    this.name = name\n    this.#health = health\n    this.power = power\n  }\n  get health() {\n    return this.#health\n  }\n  takeDamage(n) {\n    this.#health = Math.max(this.#health - n, 0)\n  }\n  get isAlive() {\n    return this.#health > 0\n  }\n  attack(target) {\n    target.takeDamage(this.power)\n    return `${this.name} hits ${target.name} for ${this.power}`\n  }\n}\nfunction battle(a, b) {\n  const lines = []\n  let attacker = a\n  let defender = b\n  while (a.isAlive && b.isAlive) {\n    lines.push(attacker.attack(defender))\n    ;[attacker, defender] = [defender, attacker]\n  }\n  return { lines, winner: a.isAlive ? a.name : b.name }\n}',
      tests: [['A short fight', same('battle(new Character("Ana", 10, 6), new Character("Orc", 11, 4))', '{ lines: ["Ana hits Orc for 6", "Orc hits Ana for 4", "Ana hits Orc for 6"], winner: "Ana" }')], ['The other way', is('battle(new Character("Kit", 3, 1), new Character("Ogre", 50, 5)).winner', 'Ogre')]],
    }),
    task('expert', 'Warrior versus mage', {
      prompt: 'Put it all together: write `Character`, `Warrior`, `Mage` and `battle` as in the earlier steps, then set `result` to `battle(new Warrior("Bo", 30, 4), new Mage("Mo", 20, 3))`.',
      hint: 'Copy the pieces in; `battle` works for any characters because each kind overrides `attack` (polymorphism).',
      solution: 'class Character {\n  #health\n  constructor(name, health, power) {\n    this.name = name\n    this.#health = health\n    this.power = power\n  }\n  get health() {\n    return this.#health\n  }\n  takeDamage(n) {\n    this.#health = Math.max(this.#health - n, 0)\n  }\n  get isAlive() {\n    return this.#health > 0\n  }\n  attack(target) {\n    target.takeDamage(this.power)\n    return `${this.name} hits ${target.name} for ${this.power}`\n  }\n}\nclass Warrior extends Character {\n  constructor(name, health, power) {\n    super(name, health, power)\n    this.attacks = 0\n  }\n  attack(target) {\n    this.attacks++\n    if (this.attacks % 3 !== 0) return super.attack(target)\n    const damage = this.power * 2\n    target.takeDamage(damage)\n    return `${this.name} hits ${target.name} for ${damage} (critical!)`\n  }\n}\nclass Mage extends Character {\n  constructor(name, health, power) {\n    super(name, health, power)\n    this.mana = 10\n  }\n  attack(target) {\n    if (this.mana < 4) return super.attack(target)\n    this.mana -= 4\n    const damage = this.power * 2\n    target.takeDamage(damage)\n    return `${this.name} casts a spell at ${target.name} for ${damage}`\n  }\n}\nfunction battle(a, b) {\n  const lines = []\n  let attacker = a\n  let defender = b\n  while (a.isAlive && b.isAlive) {\n    lines.push(attacker.attack(defender))\n    ;[attacker, defender] = [defender, attacker]\n  }\n  return { lines, winner: a.isAlive ? a.name : b.name }\n}\nconst result = battle(new Warrior("Bo", 30, 4), new Mage("Mo", 20, 3))',
      tests: [['The winner', is('result.winner', 'Bo')], ['The fight', same('result.lines', '["Bo hits Mo for 4", "Mo casts a spell at Bo for 6", "Bo hits Mo for 4", "Mo casts a spell at Bo for 6", "Bo hits Mo for 8 (critical!)", "Mo hits Bo for 3", "Bo hits Mo for 4"]')], ['Classes used', 'new Warrior("x", 1, 1) instanceof Character && new Mage("y", 1, 1) instanceof Character']],
    }),
  ],
  questions: [
    mc('Why is `health` private with only a getter?', ['So it can only change through takeDamage, which keeps it at 0 or more', 'To hide it from the game', 'Getters are faster', 'It must be private'], 0, 'The rule lives in one place.'),
    mc('What does `Math.max(3 - 10, 0)` give?', ['0', '-7', '3', '10'], 0, 'Never below 0.', { code: 'console.log(Math.max(3 - 10, 0))', output: '0' }),
    mc('How does `Warrior` do a normal attack?', ['By calling `super.attack(target)`', 'By copying the code', 'With `this.attack`', 'It can\'t'], 0, 'Reuse the parent\'s version.'),
    mc('Why can `battle` work with warriors, mages and plain characters?', ['Each has an `attack` method; each kind does its own (polymorphism)', 'battle checks each class', 'They are the same class', 'It can\'t'], 0, 'Same method, different behaviour.'),
    mc('What does `;[a, b] = [b, a]` do?', ['Swaps a and b', 'Makes an array', 'Compares them', 'An error'], 0, 'Destructuring swap; the ; stops the line joining the one before.', { code: 'let a = 1\nlet b = 2\n;[a, b] = [b, a]\nconsole.log(a, b)', output: '2 1' }),
    mc('Is a `Mage` a `Character`?', ['Yes', 'No', 'Only with mana', 'Only when attacking'], 0, 'Mage extends Character.', { code: 'class C {}\nclass Mage extends C {}\nconsole.log(new Mage() instanceof C)', output: 'true' }),
  ],
})
