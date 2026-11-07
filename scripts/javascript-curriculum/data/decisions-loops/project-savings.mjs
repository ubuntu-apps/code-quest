// Decisions and loops side quest (medium): A savings goal. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, near, prints, snippet, task, uses } from '../_builders.mjs'

export default makeProject('medium', {
  id: 'proj_savings_goal',
  title: 'A savings goal',
  paragraphs: [
    'You want to save up for something. Each month you put in the same amount, and the bank adds interest on what is already there. How long until you reach the goal?',
    'Each month: first the interest is added (the balance times the monthly rate), then your deposit. For a goal of 500, saving 80 a month at 1% a month:',
    '```text\nMonth 1: $80.00\nMonth 2: $160.80\nMonth 3: $242.41\nMonth 4: $324.83\nMonth 5: $408.08\nMonth 6: $492.16\nMonth 7: $577.08\nGoal reached in 7 months\n```',
    'You don\'t know in advance how many months it takes, so it\'s a `while` loop: keep going while the balance is under the goal.',
  ],
  sandboxCode: 'let balance = 100\nconst rate = 0.01\nbalance += balance * rate\nbalance += 80\nconsole.log(balance.toFixed(2))',
  sandboxSnippets: [
    snippet('One month', 'let balance = 160.8\nbalance += balance * 0.01\nbalance += 80\nconsole.log(`$${balance.toFixed(2)}`)'),
  ],
  challenges: [
    task('easy', 'One month', {
      prompt: 'Add one month of interest to `balance` (balance times `rate`), then the `deposit`.',
      starter: 'let balance = 80\nconst rate = 0.01\nconst deposit = 80\n',
      hint: '`balance += balance * rate`, then `balance += deposit`.',
      solution: 'let balance = 80\nconst rate = 0.01\nconst deposit = 80\nbalance += balance * rate\nbalance += deposit',
      tests: [['balance is 160.80', near('balance', 160.8)]],
    }),
    task('easy', 'Without interest', {
      prompt: 'With no interest, set `months` to how many months of `deposit` it takes to reach `goal`, with a `while` loop.',
      starter: 'const goal = 500\nconst deposit = 80\n',
      hint: '`let saved = 0`, `let months = 0`; while `saved < goal`: add the deposit and count the month.',
      solution: 'const goal = 500\nconst deposit = 80\nlet saved = 0\nlet months = 0\nwhile (saved < goal) {\n  saved += deposit\n  months++\n}',
      tests: [['months is 7', is('months', 7)], ['Uses while', '/\\bwhile\\s*\\(/.test(_cq_code)']],
    }),
    task('medium', 'With interest', {
      prompt: 'Now with interest each month before the deposit. Set `months` to how many months it takes to reach `goal`.',
      starter: 'const goal = 1000\nconst deposit = 80\nconst rate = 0.02\n',
      hint: 'Inside the loop: `balance += balance * rate`, `balance += deposit`, `months++`.',
      solution: 'const goal = 1000\nconst deposit = 80\nconst rate = 0.02\nlet balance = 0\nlet months = 0\nwhile (balance < goal) {\n  balance += balance * rate\n  balance += deposit\n  months++\n}',
      tests: [['months is 12', is('months', 12)]],
    }),
    task('medium', 'Month by month', {
      prompt: 'Show the balance after each month until the goal is reached, as `Month 1: $80.00`.',
      starter: 'const goal = 300\nconst deposit = 80\nconst rate = 0.01\n',
      hint: 'In the loop, after updating `balance` and `months`, show `` `Month ${months}: $${balance.toFixed(2)}` ``.',
      solution: 'const goal = 300\nconst deposit = 80\nconst rate = 0.01\nlet balance = 0\nlet months = 0\nwhile (balance < goal) {\n  balance += balance * rate\n  balance += deposit\n  months++\n  console.log(`Month ${months}: $${balance.toFixed(2)}`)\n}',
      tests: [['Shows each month', prints('Month 1: $80.00', 'Month 2: $160.80', 'Month 3: $242.41', 'Month 4: $324.83')]],
    }),
    task('hard', 'The whole plan', {
      prompt: 'Show each month, then `Goal reached in 7 months` after the loop.',
      starter: 'const goal = 500\nconst deposit = 80\nconst rate = 0.01\n',
      hint: 'Same loop as before, then one more `console.log` after it.',
      solution: 'const goal = 500\nconst deposit = 80\nconst rate = 0.01\nlet balance = 0\nlet months = 0\nwhile (balance < goal) {\n  balance += balance * rate\n  balance += deposit\n  months++\n  console.log(`Month ${months}: $${balance.toFixed(2)}`)\n}\nconsole.log(`Goal reached in ${months} months`)',
      tests: [['Shows the plan', prints('Month 1: $80.00', 'Month 2: $160.80', 'Month 3: $242.41', 'Month 4: $324.83', 'Month 5: $408.08', 'Month 6: $492.16', 'Month 7: $577.08', 'Goal reached in 7 months')]],
    }),
    task('expert', 'A safety limit', {
      prompt: 'With a deposit of 0 the goal is never reached and the loop would never end. Stop after 120 months: show `Goal reached in N months`, or `Not reached in 10 years` if it stopped at the limit.',
      starter: 'const goal = 500\nconst deposit = 0\nconst rate = 0.01\n',
      hint: 'Loop `while (balance < goal && months < 120)`, then check `balance >= goal` after the loop.',
      solution: 'const goal = 500\nconst deposit = 0\nconst rate = 0.01\nlet balance = 0\nlet months = 0\nwhile (balance < goal && months < 120) {\n  balance += balance * rate\n  balance += deposit\n  months++\n}\nif (balance >= goal) {\n  console.log(`Goal reached in ${months} months`)\n} else {\n  console.log("Not reached in 10 years")\n}',
      tests: [['Shows Not reached in 10 years', prints('Not reached in 10 years')], ['Stops at 120 months', uses('120')]],
      alt: 'const goal = 500\nconst deposit = 50\nconst rate = 0.01',
    }),
  ],
  questions: [
    mc('Why is this a `while` loop rather than a `for` loop?', ['You don\'t know in advance how many months it takes', 'for can\'t add money', 'while is faster', 'for needs a counter called i'], 0,
      'Loop until the goal is reached.'),
    mc('After `let b = 100; b += b * 0.1`, what is `b`?', ['110', '100.1', '10', '1000'], 0,
      '100 × 0.1 is 10, added to 100.', { code: 'let b = 100; b += b * 0.1\nconsole.log(b)', output: '110' }),
    mc('What could make the loop run forever?', ['A deposit of 0 with no starting money', 'A high interest rate', 'A small goal', 'Using toFixed'], 0,
      '0 plus 1% of 0 stays 0, so the goal is never reached.'),
    mc('What does `(492.1584).toFixed(2)` give?', ['"492.16"', '"492.15"', '492.16', '"492"'], 0,
      'Rounded to 2 decimals, as text.', { code: 'console.log((492.1584).toFixed(2))', output: '492.16' }),
    mc('Which condition stops at the goal or after 120 months, whichever comes first?', ['`balance < goal && months < 120`', '`balance < goal || months < 120`', '`balance > goal && months > 120`', '`months === 120`'], 0,
      'Keep going only while both are still true.'),
    mc('How many months to save 300 at 100 a month, without interest?', ['3', '4', '2', '300'], 0, '100, 200, 300.'),
  ],
})
