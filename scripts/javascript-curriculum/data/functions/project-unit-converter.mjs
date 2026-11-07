// Functions side quest (hard): A unit converter. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, same, snippet, task } from '../_builders.mjs'

export default makeProject('hard', {
  id: 'proj_unit_converter',
  title: 'A unit converter',
  paragraphs: [
    'A converter turns metres into feet, kilos into pounds, and so on. Writing a separate function for every pair would take dozens; instead, use a **function factory** that makes converters from a rule.',
    'Most units convert by multiplying: 1 km is 1000 m, 1 inch is 0.0254 m. `makeConverter(factor)` returns a function that multiplies by `factor`. Temperatures also need an offset: °F is °C × 1.8 + 32.',
    '```\nconst makeConverter = (factor) => (value) => value * factor\nconst kmToMiles = makeConverter(0.621371)\nconsole.log(kmToMiles(10))\n```',
    'With many units, convert through a **base unit**. Keep each length\'s size in metres, then `from → metres → to`: 3 feet is 3 × 0.3048 m, which is that ÷ 0.0254 inches.',
    '```\nconst lengths = { m: 1, km: 1000, cm: 0.01, inch: 0.0254, ft: 0.3048, mile: 1609.344 }\n```',
    'Finally, wrap it up as `converterFor(table)`: a function that remembers a table of units (a closure) and converts between any two of them.',
  ],
  sandboxCode: 'const lengths = { m: 1, km: 1000, cm: 0.01, inch: 0.0254, ft: 0.3048 }\nconst metres = 3 * lengths.ft\nconsole.log(metres, metres / lengths.inch)',
  sandboxSnippets: [
    snippet('A factory', 'const makeConverter = (factor) => (value) => value * factor\nconst kgToLb = makeConverter(2.20462)\nconsole.log(kgToLb(10))'),
  ],
  challenges: [
    task('easy', 'Make a converter', {
      prompt: 'Write `makeConverter(factor)`, returning a function that multiplies its argument by `factor`.',
      hint: '`return (value) => value * factor`.',
      solution: 'function makeConverter(factor) {\n  return (value) => value * factor\n}',
      tests: [['km to m', is('makeConverter(1000)(3)', 3000)], ['halves', is('makeConverter(0.5)(9)', 4.5)], ['Returns a function', 'typeof makeConverter(2) === "function"']],
    }),
    task('easy', 'With an offset', {
      prompt: 'Give `makeConverter` a second parameter, `offset = 0`, added after multiplying. Then set `cToF` to a converter for °C to °F (× 1.8 + 32).',
      starter: 'function makeConverter(factor) {\n  return (value) => value * factor\n}\n',
      hint: '`(value) => value * factor + offset`; `const cToF = makeConverter(1.8, 32)`.',
      solution: 'function makeConverter(factor, offset = 0) {\n  return (value) => value * factor + offset\n}\nconst cToF = makeConverter(1.8, 32)',
      tests: [['cToF(100) is 212', is('cToF(100)', 212)], ['cToF(0) is 32', is('cToF(0)', 32)], ['No offset still works', is('makeConverter(10)(2)', 20)]],
    }),
    task('medium', 'Through metres', {
      prompt: 'Write `convertLength(value, from, to)` using the `lengths` table: turn `value` into metres, then into `to`.',
      starter: 'const lengths = { m: 1, km: 1000, cm: 0.01, inch: 0.0254, ft: 0.3048, mile: 1609.344 }\n',
      hint: '`return value * lengths[from] / lengths[to]`.',
      solution: 'const lengths = { m: 1, km: 1000, cm: 0.01, inch: 0.0254, ft: 0.3048, mile: 1609.344 }\nfunction convertLength(value, from, to) {\n  return value * lengths[from] / lengths[to]\n}',
      tests: [['2 km is 2000 m', 'Math.abs(convertLength(2, "km", "m") - 2000) < 1e-9'], ['1 ft is 12 inches', 'Math.abs(convertLength(1, "ft", "inch") - 12) < 1e-9'], ['1 mile in km', 'Math.abs(convertLength(1, "mile", "km") - 1.609344) < 1e-9']],
    }),
    task('medium', 'Rounded', {
      prompt: 'Write `round(value, places = 2)`, returning `value` rounded to that many decimal places, as a number.',
      hint: '`const k = 10 ** places`; `return Math.round(value * k) / k`.',
      solution: 'function round(value, places = 2) {\n  const k = 10 ** places\n  return Math.round(value * k) / k\n}',
      tests: [['round(3.14159)', is('round(3.14159)', 3.14)], ['round(2.5, 0)', is('round(2.5, 0)', 3)], ['round(1.23456, 3)', is('round(1.23456, 3)', 1.235)]],
    }),
    task('hard', 'Unknown units', {
      prompt: 'Write `convertLength(value, from, to)` as before, but return `null` if either unit isn\'t in `lengths`.',
      starter: 'const lengths = { m: 1, km: 1000, cm: 0.01, inch: 0.0254, ft: 0.3048, mile: 1609.344 }\n',
      hint: '`if (!(from in lengths) || !(to in lengths)) return null` first.',
      solution: 'const lengths = { m: 1, km: 1000, cm: 0.01, inch: 0.0254, ft: 0.3048, mile: 1609.344 }\nfunction convertLength(value, from, to) {\n  if (!(from in lengths) || !(to in lengths)) return null\n  return value * lengths[from] / lengths[to]\n}',
      tests: [['Known units', 'Math.abs(convertLength(5, "m", "cm") - 500) < 1e-9'], ['Unknown from', is('convertLength(1, "yard", "m")', null)], ['Unknown to', is('convertLength(1, "m", "league")', null)]],
    }),
    task('expert', 'Any table', {
      prompt: 'Write `converterFor(table)`, returning a function `(value, from, to)` that converts using that table, `null` for unknown units, rounded to 2 decimal places.',
      hint: 'The returned function does what `convertLength` did, with `table` in place of `lengths`, then `Math.round(x * 100) / 100`.',
      solution: 'function converterFor(table) {\n  return (value, from, to) => {\n    if (!(from in table) || !(to in table)) return null\n    const result = value * table[from] / table[to]\n    return Math.round(result * 100) / 100\n  }\n}',
      tests: [['Weights', '(() => { const weight = converterFor({ g: 1, kg: 1000, lb: 453.592 }); return weight(2, "kg", "lb") === 4.41 && weight(500, "g", "kg") === 0.5 })()'], ['Unknown unit', '(() => { const t = converterFor({ s: 1, min: 60 }); return t(1, "s", "hour") === null })()'], ['Times', '(() => { const t = converterFor({ s: 1, min: 60, h: 3600 }); return t(90, "min", "h") === 1.5 })()']],
    }),
  ],
  questions: [
    mc('What does `makeConverter(1000)` give back?', ['A function', '1000', 'A number in metres', 'undefined'], 0, 'A factory returns a function.'),
    mc('How many inches are in 1 foot, using 0.3048 m and 0.0254 m?', ['12', '0.0083', '3.28', '30.48'], 0, '0.3048 / 0.0254.', { code: 'console.log(Math.round(0.3048 / 0.0254))', output: '12' }),
    mc('Why convert through a base unit?', ['One table of sizes covers every pair', 'It is more exact', 'JavaScript needs a base', 'It is faster'], 0, 'n units need n sizes, not n × n functions.'),
    mc('What does `"km" in { m: 1, km: 1000 }` give?', ['true', 'false', '1000', '"km"'], 0, 'in checks for a key.', { code: 'console.log("km" in { m: 1, km: 1000 })', output: 'true' }),
    mc('What does `Math.round(2.345 * 100) / 100` give?', ['2.35', '2.34', '2.3', '235'], 0, 'Rounds to 2 decimal places.', { code: 'console.log(Math.round(2.345 * 100) / 100)', output: '2.35' }),
    mc('In `converterFor(table)`, why can the returned function use `table` later?', ['It is a closure', 'table is global', 'It is copied into each call', 'It can\'t'], 0, 'The function remembers where it was made.'),
  ],
})
