// Data frames, medium side quest: A week at the café.
import { code, isText, makeProject, mc, near, prints, qShort, r, sameFrame, snippet, task, uses } from '../_builders.mjs'
import { ORDERS } from '../datasets.mjs'

const COSTS = 'costs <- data.frame(drink = c("latte", "tea", "mocha", "chai"), cost = c(0.9, 0.3, 1.1, 0.6))\n'

export default makeProject('medium', {
  id: 'proj_cafe_week',
  title: 'A week at the café',
  paragraphs: [
    'Corner Café wants to know how its week went. You have the orders from this quest, and a second table with what each drink costs the café to make:',
    code(...(ORDERS + COSTS).trim().split('\n')),
    'The **profit** on an order is its price minus the drink\'s cost. Join the tables, work out the profit, and find the best day and drink. The last challenge shows:',
    code('Orders: 10', 'Takings: 33.0', 'Profit: 25.7', 'Best drink: latte'),
  ],
  sandboxCode: ORDERS + COSTS + 'merge(orders, costs, by = "drink")',
  sandboxSnippets: [snippet('Takings per day', ORDERS + 'tapply(orders$price, orders$day, sum)')],
  challenges: [
    task('easy', 'The takings', {
      prompt: 'Make `takings` the total of all the prices.',
      starter: ORDERS,
      hint: '`takings <- sum(orders$price)`',
      solution: ORDERS + 'takings <- sum(orders$price)',
      tests: [['takings is 33', near('takings', 33)]],
    }),
    task('easy', 'Join the costs', {
      prompt: 'Make `full` the orders merged with the costs, matched on `drink`.',
      starter: ORDERS + COSTS,
      hint: '`full <- merge(orders, costs, by = "drink")`',
      solution: ORDERS + COSTS + 'full <- merge(orders, costs, by = "drink")',
      tests: [['full is the merged table', sameFrame('full', 'merge(orders, costs, by = "drink")')]],
    }),
    task('medium', 'Profit per order', {
      prompt: 'Add a column `profit` to `full`: the price minus the cost.',
      starter: ORDERS + COSTS + 'full <- merge(orders, costs, by = "drink")\n',
      hint: '`full$profit <- full$price - full$cost`',
      solution: ORDERS + COSTS + 'full <- merge(orders, costs, by = "drink")\nfull$profit <- full$price - full$cost',
      tests: [['profit is right for every order', 'isTRUE(all.equal(full$profit, full$price - full$cost)) && nrow(full) == 10']],
    }),
    task('medium', 'Total profit', {
      prompt: 'Make `total_profit` the total profit of the week.',
      starter: ORDERS + COSTS + 'full <- merge(orders, costs, by = "drink")\nfull$profit <- full$price - full$cost\n',
      hint: '`total_profit <- sum(full$profit)`',
      solution: ORDERS + COSTS + 'full <- merge(orders, costs, by = "drink")\nfull$profit <- full$price - full$cost\ntotal_profit <- sum(full$profit)',
      tests: [['total_profit is 25.7', near('total_profit', 25.7)]],
    }),
    task('hard', 'Most profitable order', {
      prompt: 'Make `best_order` the `order` number with the highest profit (the first one if there is a tie).',
      starter: ORDERS + COSTS + 'full <- merge(orders, costs, by = "drink")\nfull$profit <- full$price - full$cost\n',
      hint: '`full$order[which.max(full$profit)]`. The chai makes the most: 3.8 minus 0.6.',
      solution: ORDERS + COSTS + 'full <- merge(orders, costs, by = "drink")\nfull$profit <- full$price - full$cost\nbest_order <- full$order[which.max(full$profit)]',
      tests: [['best_order is 107', near('best_order', 107)]],
    }),
    task('expert', 'The week\'s report', {
      prompt: 'Show the report, with the takings and profit to one decimal place. The best drink is the one with the most profit in total.\n\n```\nOrders: 10\nTakings: 33.0\nProfit: 25.7\nBest drink: latte\n```',
      starter: ORDERS + COSTS,
      hint: 'Merge and add `profit` as before. `tapply(full$profit, full$drink, sum)` gives the profit per drink; `names(which.max(...))` picks the best. Use `sprintf("%.1f", …)` for one decimal place.',
      solution: ORDERS + COSTS + r`full <- merge(orders, costs, by = "drink")
full$profit <- full$price - full$cost
per_drink <- tapply(full$profit, full$drink, sum)
cat("Orders:", nrow(orders), "\n")
cat("Takings:", sprintf("%.1f", sum(orders$price)), "\n")
cat("Profit:", sprintf("%.1f", sum(full$profit)), "\n")
cat("Best drink:", names(which.max(per_drink)), "\n")`,
      tests: [['Shows the report', prints('Orders: 10', 'Takings: 33.0', 'Profit: 25.7', 'Best drink: latte')], ['Joins the tables', uses('merge(')]],
    }),
  ],
  questions: [
    mc('What does `sum(c(3.4, 2.5, 4.2))` give?', ['`10.1`', '`3.37`', '`9.1`', '`11`'], 0,
      'The total of the three prices.',
      { code: 'sum(c(3.4, 2.5, 4.2))', output: '[1] 10.1' }),
    mc('After merging, what does each order gain from the costs table?', ['A new row', 'The cost of its drink', 'A new order number', 'Nothing'], 1,
      'Rows are matched on `drink`, and the cost column comes across.'),
    mc('What does `tapply(c(2, 3, 5), c("a", "b", "a"), sum)` give for "a"?', ['`2`', '`7`', '`10`', '`5`'], 1,
      '`tapply()` adds up the values for each group: 2 + 5 for "a". The next quest covers it in detail.',
      { code: 'as.vector(tapply(c(2, 3, 5), c("a", "b", "a"), sum))[1]', output: '[1] 7' }),
    mc('What does `sprintf("%.1f", 33)` give?', ['`"33"`', '`"33.0"`', '`33.0`', '`"33.00"`'], 1,
      'One decimal place, as text.',
      { code: 'sprintf("%.1f", 33)', output: '[1] "33.0"' }),
    mc('What does `3.9 - 0.9` give?', ['`3`', '`4.8`', '`3.9`', '`2.9`'], 0,
      'The profit on the Thursday latte.',
      { code: '3.9 - 0.9', output: '[1] 3' }),
    qShort('Which function joins two tables by matching a shared column?', 'merge',
      '`merge(a, b, by = "column")`'),
  ],
})
