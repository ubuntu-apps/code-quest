// Cleaning data, medium side quest: The sales log.
import { code, isTexts, makeProject, mc, near, qShort, snippet, task } from '../_builders.mjs'

const RAW = 'sales <- read.csv(text = "date,item,price,qty\n02/09/2026,Mug,$8.50,2\n15/09/2026,mug,$8.50,1\n20/09/2026,Tote bag,$12.00,1\n03/10/2026,TOTE BAG,$12.00,3\n21/10/2026,Poster,$5.25,4\n28/10/2026,mug ,$8.50,2")\n'
const PRICE = 'sales$price <- as.numeric(gsub("$", "", sales$price, fixed = TRUE))\n'
const ITEM = 'sales$item <- tolower(trimws(sales$item))\n'
const DATE = 'sales$date <- as.Date(sales$date, format = "%d/%m/%Y")\n'
const TOTAL = 'sales$total <- sales$price * sales$qty\n'

export default makeProject('medium', {
  id: 'proj_sales_log',
  title: 'The sales log',
  paragraphs: [
    'A small school shop sells mugs, tote bags and posters at events. The volunteer who keeps the log types prices with a `$`, dates day first, and item names however they come out.',
    code(...RAW.trim().split('\n')),
    'Clean the log, then answer the two questions the shop committee always asks: how much did we take each month, and which item earned the most?',
  ],
  sandboxCode: RAW + 'str(sales)\ntable(sales$item)',
  sandboxSnippets: [snippet('Prices as numbers', RAW + 'as.numeric(gsub("$", "", sales$price, fixed = TRUE))')],
  challenges: [
    task('easy', 'Prices as numbers', {
      prompt: 'Make the `price` column numbers, removing the `$`.',
      starter: RAW,
      hint: '`as.numeric(gsub("$", "", sales$price, fixed = TRUE))`',
      solution: RAW + PRICE,
      tests: [['price is 8.5, 8.5, 12, 12, 5.25, 8.5', 'is.numeric(sales$price) && isTRUE(all.equal(sales$price, c(8.5, 8.5, 12, 12, 5.25, 8.5)))']],
    }),
    task('easy', 'One name per item', {
      prompt: 'Make the `item` column trimmed and small letters.',
      starter: RAW + PRICE,
      hint: '`sales$item <- tolower(trimws(sales$item))`',
      solution: RAW + PRICE + ITEM,
      tests: [['item is cleaned', 'identical(sales$item, c("mug", "mug", "tote bag", "tote bag", "poster", "mug"))']],
    }),
    task('medium', 'Real dates', {
      prompt: 'Make the `date` column real dates. They are written day first.',
      starter: RAW + PRICE + ITEM,
      hint: '`as.Date(sales$date, format = "%d/%m/%Y")`',
      solution: RAW + PRICE + ITEM + DATE,
      tests: [['date is real dates', 'inherits(sales$date, "Date") && identical(format(sales$date), c("2026-09-02", "2026-09-15", "2026-09-20", "2026-10-03", "2026-10-21", "2026-10-28"))']],
    }),
    task('medium', 'Line totals', {
      prompt: 'Add a column `total`: price times quantity.',
      starter: RAW + PRICE + ITEM + DATE,
      hint: '`sales$total <- sales$price * sales$qty`',
      solution: RAW + PRICE + ITEM + DATE + TOTAL,
      tests: [['total is 17, 8.5, 12, 36, 21, 17', 'isTRUE(all.equal(sales$total, c(17, 8.5, 12, 36, 21, 17)))']],
    }),
    task('hard', 'Takings per month', {
      prompt: 'Make `per_month` the total takings per month, named like `"2026-09"`.',
      starter: RAW + PRICE + ITEM + DATE + TOTAL,
      hint: '`tapply(sales$total, format(sales$date, "%Y-%m"), sum)`',
      solution: RAW + PRICE + ITEM + DATE + TOTAL + 'per_month <- tapply(sales$total, format(sales$date, "%Y-%m"), sum)',
      tests: [['per_month is 2026-09 37.5, 2026-10 74', 'isTRUE(all.equal(as.vector(per_month), c(37.5, 74))) && identical(names(per_month), c("2026-09", "2026-10"))']],
    }),
    task('expert', 'The best seller', {
      prompt: 'Make `per_item` the takings per item, from most to least.',
      starter: RAW + PRICE + ITEM + DATE + TOTAL,
      hint: '`sort(tapply(sales$total, sales$item, sum), decreasing = TRUE)`',
      solution: RAW + PRICE + ITEM + DATE + TOTAL + 'per_item <- sort(tapply(sales$total, sales$item, sum), decreasing = TRUE)',
      tests: [['per_item is tote bag 48, mug 42.5, poster 21', 'isTRUE(all.equal(as.vector(per_item), c(48, 42.5, 21))) && identical(names(per_item), c("tote bag", "mug", "poster"))']],
    }),
  ],
  questions: [
    mc('Why does `price` read in as text?', ['R reads all columns as text', 'The `$` signs make it non-numeric', 'It has NAs', 'It has decimals'], 1,
      'One non-number character makes the whole column text.'),
    mc('Why `fixed = TRUE` in `gsub("$", "", x, fixed = TRUE)`?', ['It is faster', 'In a pattern, `$` means "end of text"; fixed makes it a plain dollar sign', 'It keeps the result as text', 'It is required by gsub()'], 1,
      'Without it, nothing is removed.',
      { code: 'gsub("$", "", "$8.50")', output: '[1] "$8.50"' }),
    mc('Without cleaning, how many different items does `table()` show for "Mug", "mug" and "mug "?', ['1', '2', '3', '0'], 2,
      'Capitals and a trailing space make three different texts.',
      { code: 'length(table(c("Mug", "mug", "mug ")))', output: '[1] 3' }),
    mc('What does `format(as.Date("2026-10-21"), "%Y-%m")` give?', ['`"2026-10"`', '`"10-2026"`', '`"Oct"`', '`"2026-10-21"`'], 0,
      'Year and month: one group per month.',
      { code: 'format(as.Date("2026-10-21"), "%Y-%m")', output: '[1] "2026-10"' }),
    mc('What does `sort(c(mug = 42.5, poster = 21, tote = 48), decreasing = TRUE)` put first?', ['mug', 'poster', 'tote', 'It keeps the order'], 2,
      'The largest value first, with its name.',
      { code: 'names(sort(c(mug = 42.5, poster = 21, tote = 48), decreasing = TRUE))[1]', output: '[1] "tote"' }),
    qShort('Which function puts the per-item takings in order, as in `__(x, decreasing = TRUE)`?', 'sort',
      '`sort()` keeps the names with their values.'),
  ],
})
