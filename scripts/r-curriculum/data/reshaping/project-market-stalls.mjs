// Reshaping and combining, medium side quest: The market stalls.
import { code, isText, makeProject, mc, qShort, same, sameFrame, snippet, task } from '../_builders.mjs'

const STALLS = 'stall_a <- data.frame(item = c("jam", "honey", "eggs"), qty = c(12, 5, 30))\nstall_b <- data.frame(qty = c(8, 20, 4), item = c("jam", "eggs", "chutney"), note = c("", "2 cracked", ""))\nstall_c <- data.frame(item = c("honey", "eggs", "bread"), qty = c(7, 18, 10))\nproducts <- data.frame(item = c("jam", "honey", "eggs", "chutney"), price = c(3.5, 6, 0.4, 4), category = c("preserves", "preserves", "fresh", "preserves"))\n'
const STACK = 'stall_a$stall <- "A"\nstall_b$stall <- "B"\nstall_c$stall <- "C"\nstall_b$note <- NULL\nall_sales <- rbind(stall_a, stall_b, stall_c)\n'
const PRICED = 'priced <- merge(all_sales, products, by = "item")\npriced$revenue <- priced$qty * priced$price\n'

export default makeProject('medium', {
  id: 'proj_market_stalls',
  title: 'The market stalls',
  paragraphs: [
    'The school farm runs three stalls at the Saturday market. Each stall keeper sent in a sheet, each a little different, and the farm office has a price list:',
    code(...STALLS.trim().split('\n')),
    'Stack the sheets, price them, find what isn\'t on the price list, and report the takings per stall and category.',
  ],
  sandboxCode: STALLS + 'stall_b\nproducts',
  sandboxSnippets: [snippet('What is not priced', STALLS + 'setdiff(c(stall_a$item, stall_b$item, stall_c$item), products$item)')],
  challenges: [
    task('easy', 'Label the sheets', {
      prompt: 'Add a column `stall` to each sheet (`"A"`, `"B"`, `"C"`), drop the `note` column from stall B, then make `all_sales` the three sheets stacked.',
      starter: STALLS,
      hint: '`stall_a$stall <- "A"` and so on, `stall_b$note <- NULL`, then `rbind(stall_a, stall_b, stall_c)`.',
      solution: STALLS + STACK,
      tests: [['all_sales has 9 rows and the columns item, qty, stall', 'is.data.frame(all_sales) && nrow(all_sales) == 9 && identical(sort(names(all_sales)), c("item", "qty", "stall"))'], ['stall is A, A, A, B, B, B, C, C, C', 'identical(all_sales$stall, rep(c("A", "B", "C"), each = 3))']],
    }),
    task('medium', 'Not on the price list', {
      prompt: 'Make `unpriced` the items sold that aren\'t on the price list.',
      starter: STALLS + STACK,
      hint: '`setdiff(all_sales$item, products$item)`',
      solution: STALLS + STACK + 'unpriced <- setdiff(all_sales$item, products$item)',
      tests: [['unpriced is "bread"', isText('unpriced', 'bread')]],
    }),
    task('medium', 'Priced sales', {
      prompt: 'Make `priced` the sales joined to the price list, then add a column `revenue`: quantity times price.',
      starter: STALLS + STACK,
      hint: '`merge(all_sales, products, by = "item")`, then `priced$revenue <- priced$qty * priced$price`.',
      solution: STALLS + STACK + PRICED,
      tests: [['priced has the 8 priced sales', 'is.data.frame(priced) && nrow(priced) == 8'], ['Total revenue is 185.2', 'isTRUE(all.equal(sum(priced$revenue), 185.2))']],
    }),
    task('medium', 'Per stall', {
      prompt: 'Make `per_stall` the revenue of each stall.',
      starter: STALLS + STACK + PRICED,
      hint: '`tapply(priced$revenue, priced$stall, sum)`',
      solution: STALLS + STACK + PRICED + 'per_stall <- tapply(priced$revenue, priced$stall, sum)',
      tests: [['per_stall is A 84, B 52, C 49.2', 'isTRUE(all.equal(as.vector(per_stall), c(84, 52, 49.2))) && identical(names(per_stall), c("A", "B", "C"))']],
    }),
    task('hard', 'Stall by category', {
      prompt: 'Make `grid` a matrix of revenue with stalls in rows and categories in columns.',
      starter: STALLS + STACK + PRICED,
      hint: '`tapply(priced$revenue, list(priced$stall, priced$category), sum)`',
      solution: STALLS + STACK + PRICED + 'grid <- tapply(priced$revenue, list(priced$stall, priced$category), sum)',
      tests: [['grid is 3 by 2 with columns fresh, preserves', 'is.matrix(grid) && identical(colnames(grid), c("fresh", "preserves"))'], ['A preserves is 72, C fresh is 7.2', 'isTRUE(all.equal(c(grid["A", "preserves"], grid["C", "fresh"]), c(72, 7.2)))']],
    }),
    task('expert', 'Best seller per stall', {
      prompt: 'Make `best` a data frame with one row per stall and the columns `stall`, `item` and `revenue`: each stall\'s highest-earning item.',
      starter: STALLS + STACK + PRICED,
      hint: 'Split `priced` by stall, take `d[which.max(d$revenue), c("stall", "item", "revenue")]` from each part, and stack with `do.call(rbind, …)`.',
      solution: STALLS + STACK + PRICED + 'tops <- lapply(split(priced, priced$stall), function(d) d[which.max(d$revenue), c("stall", "item", "revenue")])\nbest <- do.call(rbind, tops)',
      tests: [['best is A jam 42, B jam 28, C honey 42', sameFrame('best', 'data.frame(stall = c("A", "B", "C"), item = c("jam", "jam", "honey"), revenue = c(42, 28, 42))')]],
    }),
  ],
  questions: [
    mc('Why must the `note` column go before stacking?', ['Notes are wrong', '`rbind()` needs the same columns in every table', 'It is text', 'merge() can\'t handle it'], 1,
      'Alternatively, give the other sheets a `note` column of NA.'),
    mc('What happens to the bread in a plain `merge()` with the price list?', ['It gets price NA', 'It is dropped, because it has no match', 'An error', 'It gets price 0'], 1,
      'That is why you find it first with `setdiff()`: dropped rows are easy to miss.'),
    mc('What does `merge(sales, products, all.x = TRUE)` do with the bread?', ['Drops it', 'Keeps it, with NA for price and category', 'Gives it the first price', 'An error'], 1,
      'Then `sum(revenue, na.rm = TRUE)` and a note in the report.'),
    mc('What does `tapply(x, list(a, b), sum)` give?', ['A vector', 'A matrix: a in rows, b in columns', 'A data frame', 'A list'], 1,
      'Two groupings give a two-way grid.'),
    mc('Stall A sold 30 eggs at 0.40. What is the revenue?', ['`30.4`', '`12`', '`120`', '`7.5`'], 1,
      '30 × 0.4.',
      { code: '30 * 0.4', output: '[1] 12' }),
    qShort('Which function joins the sales to the price list by item?', 'merge',
      '`merge(all_sales, products, by = "item")`'),
  ],
})
